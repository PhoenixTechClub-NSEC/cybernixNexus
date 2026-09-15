import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import crypto from 'crypto';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { syncStudentStats } from '@/services/platforms';

const CF_USER_INFO_ENDPOINT = 'https://codeforces.com/api/user.info';
const TOKEN_EXPIRY_MINUTES = 15;

function sanitizeHandle(handle: string): string {
  return handle
    .trim()
    .replace(/^https?:\/\/[^\/]+\/(?:profile\/)?/i, '')
    .replace(/^@+/, '')
    .replace(/\/+$/, '');
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionUser = session.user as { id?: string; email?: string };
    const userId = sessionUser.id;
    if (!userId && !sessionUser.email) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    let dbUser = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
    if (!dbUser && sessionUser.email) {
      dbUser = await prisma.user.findUnique({ where: { email: sessionUser.email } });
    }
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const handleQuery = searchParams.get('handle');
    const cleanHandle = handleQuery ? sanitizeHandle(handleQuery).toLowerCase() : null;

    const identifier = cleanHandle
      ? `cf-verify:${dbUser.id}:${cleanHandle}`
      : `cf-verify:${dbUser.id}`;

    const activeToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: { startsWith: `cf-verify:${dbUser.id}` },
        expires: { gt: new Date() },
      },
      orderBy: { expires: 'desc' },
    });

    if (!activeToken) {
      return NextResponse.json({ activeVerification: null });
    }

    const tokenHandle = activeToken.identifier.split(':')[2] || null;

    return NextResponse.json({
      activeVerification: {
        verificationCode: activeToken.token,
        handle: tokenHandle,
        expiresAt: activeToken.expires,
      },
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionUser = session.user as { id?: string; email?: string };
    const userId = sessionUser.id;
    if (!userId && !sessionUser.email) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    let dbUser = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
    if (!dbUser && sessionUser.email) {
      dbUser = await prisma.user.findUnique({ where: { email: sessionUser.email } });
    }
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { action, handle } = body;

    if (!handle || typeof handle !== 'string' || !handle.trim()) {
      return NextResponse.json({ error: 'Codeforces handle is required.' }, { status: 400 });
    }

    const cleanHandle = sanitizeHandle(handle);
    const lowerHandle = cleanHandle.toLowerCase();

    // ----------------------------------------------------
    // ACTION: GENERATE VERIFICATION CODE
    // ----------------------------------------------------
    if (action === 'generate') {
      // 1. Check if another student has already claimed this handle
      const existingStudent = await prisma.student.findFirst({
        where: {
          codeforces: { equals: cleanHandle, mode: 'insensitive' },
          userId: { not: dbUser.id },
        },
        select: { id: true, name: true },
      });

      if (existingStudent) {
        return NextResponse.json(
          { error: `The Codeforces handle "${cleanHandle}" is already connected to another student profile.` },
          { status: 409 }
        );
      }

      // 2. Validate that the handle exists on Codeforces
      const infoUrl = `${CF_USER_INFO_ENDPOINT}?handles=${encodeURIComponent(cleanHandle)}`;
      let cfUser: { handle: string; firstName?: string } | null = null;

      try {
        const response = await fetch(infoUrl, {
          method: 'GET',
          headers: { 'User-Agent': 'CybernixNexus-Verification/1.0' },
          signal: AbortSignal.timeout(8000),
          cache: 'no-store',
        });

        if (!response.ok) {
          return NextResponse.json(
            { error: `Codeforces API returned status ${response.status}. Please check the handle and try again.` },
            { status: 400 }
          );
        }

        const data = await response.json();
        if (data.status !== 'OK' || !Array.isArray(data.result) || data.result.length === 0) {
          return NextResponse.json(
            { error: `Codeforces handle "${cleanHandle}" not found. Please verify the handle on codeforces.com.` },
            { status: 404 }
          );
        }

        cfUser = data.result[0];
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Network error';
        return NextResponse.json(
          { error: `Unable to reach Codeforces API: ${errMsg}. Please try again shortly.` },
          { status: 502 }
        );
      }

      // 3. Generate a random verification token
      const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 chars
      const verificationCode = `CYBERNIX-${randomPart}`;
      const expires = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000);
      const identifier = `cf-verify:${dbUser.id}:${lowerHandle}`;

      // 4. Remove any existing pending tokens for this user & handle
      await prisma.verificationToken.deleteMany({
        where: {
          identifier: { startsWith: `cf-verify:${dbUser.id}` },
        },
      });

      // 5. Store new token
      await prisma.verificationToken.create({
        data: {
          identifier,
          token: verificationCode,
          expires,
        },
      });

      return NextResponse.json({
        success: true,
        verificationCode,
        handle: cfUser!.handle,
        currentFirstName: cfUser!.firstName || null,
        expiresAt: expires.toISOString(),
        message: 'Verification code generated successfully.',
      });
    }

    // ----------------------------------------------------
    // ACTION: VERIFY CODEFORCES FIRST NAME
    // ----------------------------------------------------
    if (action === 'verify') {
      const identifier = `cf-verify:${dbUser.id}:${lowerHandle}`;

      const activeToken = await prisma.verificationToken.findFirst({
        where: {
          identifier,
          expires: { gt: new Date() },
        },
      });

      if (!activeToken) {
        return NextResponse.json(
          {
            error: 'No active verification found or the code has expired. Please generate a new verification code.',
          },
          { status: 400 }
        );
      }

      const expectedCode = activeToken.token.trim().toUpperCase();

      // Fetch fresh profile data directly from Codeforces without caching
      const infoUrl = `${CF_USER_INFO_ENDPOINT}?handles=${encodeURIComponent(cleanHandle)}`;
      let liveProfile: { handle: string; firstName?: string; [key: string]: any } | null = null;

      try {
        const response = await fetch(infoUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'CybernixNexus-Verification/1.0',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
          },
          signal: AbortSignal.timeout(8000),
          cache: 'no-store',
        });

        if (!response.ok) {
          return NextResponse.json(
            { error: `Codeforces API returned status ${response.status}. Please try again.` },
            { status: 502 }
          );
        }

        const data = await response.json();
        if (data.status !== 'OK' || !Array.isArray(data.result) || data.result.length === 0) {
          return NextResponse.json(
            { error: `Could not retrieve Codeforces profile for "${cleanHandle}".` },
            { status: 404 }
          );
        }

        liveProfile = data.result[0];
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Network error';
        return NextResponse.json(
          { error: `Failed to contact Codeforces API: ${errMsg}. Please try again.` },
          { status: 502 }
        );
      }

      const profile = liveProfile!;

      const actualFirstName = (profile.firstName || '').trim();
      const actualUpper = actualFirstName.toUpperCase();

      // Check if actual first name matches the expected verification code
      if (actualUpper !== expectedCode) {
        return NextResponse.json(
          {
            success: false,
            error: 'First name does not match the verification code.',
            details: {
              expected: expectedCode,
              found: actualFirstName || '(empty)',
              message: `We checked Codeforces for @${cleanHandle}, but the First Name is "${actualFirstName || '(empty)'}". Please update your First Name to "${expectedCode}" on codeforces.com/settings/social, save changes, and try again.`,
            },
          },
          { status: 400 }
        );
      }

      // Verification Succeeded!
      // 1. Clean up the pending verification token
      await prisma.verificationToken.deleteMany({
        where: {
          identifier: { startsWith: `cf-verify:${dbUser.id}` },
        },
      });

      // 2. Create a verified token indicator (expires in 1 hour) for signup / profile save validation
      await prisma.verificationToken.deleteMany({
        where: { identifier: `cf-verified:${dbUser.id}` },
      });
      await prisma.verificationToken.create({
        data: {
          identifier: `cf-verified:${dbUser.id}`,
          token: profile.handle,
          expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        },
      });

      // 3. If student profile already exists, update and trigger stats sync
      let student = await prisma.student.findUnique({
        where: { userId: dbUser.id },
      });

      if (!student && sessionUser.email) {
        student = await prisma.student.findFirst({
          where: { user: { email: sessionUser.email } },
        });
      }

      let syncResult = null;
      if (student) {
        student = await prisma.student.update({
          where: { id: student.id },
          data: { codeforces: profile.handle },
        });

        // Trigger stats sync in background/safe execution
        try {
          syncResult = await syncStudentStats(student.id);
        } catch (syncError: unknown) {
          const syncMsg = syncError instanceof Error ? syncError.message : 'Sync warning';
          console.warn(`[Codeforces Verify] Platform sync warning for student ${student.id}:`, syncMsg);
        }
      }

      return NextResponse.json({
        success: true,
        verified: true,
        handle: profile.handle,
        message: `Successfully verified and linked Codeforces profile @${profile.handle}!`,
        student,
        stats: syncResult,
      });
    }

    return NextResponse.json({ error: 'Invalid action. Must be "generate" or "verify".' }, { status: 400 });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Internal error';
    console.error('[POST /api/student/codeforces/verify Error]:', error);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
