import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { syncStudentStats } from '@/services/platforms';

interface UpdateHandlesRequestBody {
  leetcode?: string | null;
  codeforces?: string | null;
  codechef?: string | null;
  github?: string | null;
  linkedin?: string | null;
  name?: string;
  avatar?: string | null;
  department?: string;
  graduationYear?: number | string;
  rollNumber?: string;
  username?: string | null;
  bio?: string | null;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionUser = session.user as { id?: string; email?: string; name?: string };
    const userId = sessionUser.id;

    if (!userId) {
      return NextResponse.json({ error: 'Invalid session payload.' }, { status: 401 });
    }

    const body = (await request.json()) as UpdateHandlesRequestBody;
    const {
      leetcode,
      codeforces,
      codechef,
      github,
      linkedin,
      name,
      avatar,
      department,
      graduationYear,
      rollNumber,
      username,
      bio,
    } = body;

    let student = await prisma.student.findUnique({
      where: { userId },
    });

    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User account not found.' }, { status: 404 });
    }

    const parsedGradYear = graduationYear ? Number(graduationYear) : 2026;
    const validGradYear = isNaN(parsedGradYear) ? 2026 : parsedGradYear;

    if (!student) {
      const fallbackRoll = rollNumber?.trim() || `NSEC-${userId.slice(-8).toUpperCase()}`;
      student = await prisma.student.create({
        data: {
          userId,
          name: name?.trim() || dbUser.name || 'Student',
          rollNumber: fallbackRoll,
          department: department?.trim() || 'CSE',
          graduationYear: validGradYear,
          leetcode: typeof leetcode === 'string' && leetcode.trim() ? leetcode.trim() : null,
          codeforces: typeof codeforces === 'string' && codeforces.trim() ? codeforces.trim() : null,
          codechef: typeof codechef === 'string' && codechef.trim() ? codechef.trim() : null,
          github: typeof github === 'string' && github.trim() ? github.trim() : null,
          linkedin: typeof linkedin === 'string' && linkedin.trim() ? linkedin.trim() : null,
          username: typeof username === 'string' && username.trim() ? username.trim() : null,
          bio: typeof bio === 'string' && bio.trim() ? bio.trim() : null,
          profileComplete: true,
        },
      });
    }

    // Check duplicate roll number if user is attempting to change it
    if (rollNumber && rollNumber.trim() !== student.rollNumber) {
      const existing = await prisma.student.findUnique({
        where: { rollNumber: rollNumber.trim() },
      });
      if (existing && existing.id !== student.id) {
        return NextResponse.json(
          { error: 'A student profile with this roll number already exists.' },
          { status: 409 }
        );
      }
    }

    // Check changed platform handles
    const oldLc = (student.leetcode || '').trim();
    const oldCf = (student.codeforces || '').trim();
    const oldCc = (student.codechef || '').trim();

    const newLc = typeof leetcode === 'string' ? leetcode.trim() : oldLc;
    const newCf = typeof codeforces === 'string' ? codeforces.trim() : oldCf;
    const newCc = typeof codechef === 'string' ? codechef.trim() : oldCc;

    const changedPlatforms = {
      leetcode: oldLc !== newLc,
      codeforces: oldCf !== newCf,
      codechef: oldCc !== newCc,
    };

    const hasHandleChanges = Object.values(changedPlatforms).some(Boolean);

    // Update user image URL or name if provided
    if (avatar !== undefined || name) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          ...(avatar !== undefined ? { image: typeof avatar === 'string' && avatar.trim() ? avatar.trim() : null } : {}),
          ...(name ? { name: name.trim() } : {}),
        },
      });
    }

    // Update student table handles, socials, and academic info
    const updatedStudent = await prisma.student.update({
      where: { id: student.id },
      data: {
        leetcode: newLc || null,
        codeforces: newCf || null,
        codechef: newCc || null,
        ...(typeof github === 'string' ? { github: github.trim() || null } : {}),
        ...(typeof linkedin === 'string' ? { linkedin: linkedin.trim() || null } : {}),
        ...(name ? { name: name.trim() } : {}),
        ...(department ? { department: department.trim() } : {}),
        ...(graduationYear ? { graduationYear: validGradYear } : {}),
        ...(rollNumber ? { rollNumber: rollNumber.trim() } : {}),
        ...(typeof username === 'string' ? { username: username.trim() || null } : {}),
        ...(typeof bio === 'string' ? { bio: bio.trim() || null } : {}),
      },
      include: {
        stats: true,
        user: {
          select: { email: true, image: true },
        },
      },
    });

    let syncResult = null;
    if (hasHandleChanges) {
      // Trigger sync and recalculate ratings for updated handles
      try {
        syncResult = await syncStudentStats(student.id);
      } catch (syncError: unknown) {
        const errorMsg = syncError instanceof Error ? syncError.message : 'Scraping warning';
        console.warn(`[Handles Sync Warning]:`, errorMsg);
      }
    }

    return NextResponse.json({
      success: true,
      hasHandleChanges,
      changedPlatforms,
      student: updatedStudent,
      stats: syncResult,
      message: hasHandleChanges
        ? 'Platform handles updated & stats fetched successfully'
        : 'Profile updated',
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to update platform handles';
    console.error('[POST /api/student/handles Error]:', error);
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}
