import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { syncStudentStats } from '@/services/platforms';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionUser = session.user as { id?: string };
    const userId = sessionUser.id;

    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const student = await prisma.student.findUnique({
      where: { userId },
      include: {
        stats: true,
        user: {
          select: { email: true, image: true },
        },
        syncJobs: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!student) {
      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, image: true, name: true },
      });
      return NextResponse.json({ student: null, user: dbUser }, { status: 200 });
    }

    return NextResponse.json({ student, user: student.user });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Internal server error';
    console.error('[GET /api/student Error]:', error);
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionUser = session.user as { id?: string };
    const userId = sessionUser.id;

    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const body = await request.json();

    const {
      name,
      rollNumber,
      department,
      graduationYear,
      leetcode,
      codeforces,
      gfg,
      codechef,
      github,
      linkedin,
    } = body;

    if (!name || !rollNumber || !department || !graduationYear) {
      return NextResponse.json(
        { error: 'Missing required fields: name, rollNumber, department, graduationYear' },
        { status: 400 }
      );
    }

    const parsedGradYear = Number(graduationYear);
    const validGradYear = isNaN(parsedGradYear) ? 2026 : parsedGradYear;

    const student = await prisma.student.upsert({
      where: { userId },
      create: {
        userId,
        name: name.trim(),
        rollNumber: rollNumber.trim(),
        department: department.trim(),
        graduationYear: validGradYear,
        leetcode: typeof leetcode === 'string' && leetcode.trim() ? leetcode.trim() : null,
        codeforces: typeof codeforces === 'string' && codeforces.trim() ? codeforces.trim() : null,
        gfg: typeof gfg === 'string' && gfg.trim() ? gfg.trim() : null,
        codechef: typeof codechef === 'string' && codechef.trim() ? codechef.trim() : null,
        github: typeof github === 'string' && github.trim() ? github.trim() : null,
        linkedin: typeof linkedin === 'string' && linkedin.trim() ? linkedin.trim() : null,
        profileComplete: true,
      },
      update: {
        name: name.trim(),
        rollNumber: rollNumber.trim(),
        department: department.trim(),
        graduationYear: validGradYear,
        leetcode: typeof leetcode === 'string' && leetcode.trim() ? leetcode.trim() : null,
        codeforces: typeof codeforces === 'string' && codeforces.trim() ? codeforces.trim() : null,
        gfg: typeof gfg === 'string' && gfg.trim() ? gfg.trim() : null,
        codechef: typeof codechef === 'string' && codechef.trim() ? codechef.trim() : null,
        ...(typeof github === 'string' ? { github: github.trim() || null } : {}),
        ...(typeof linkedin === 'string' ? { linkedin: linkedin.trim() || null } : {}),
        profileComplete: true,
      },
    });

    // Automatically trigger stats sync asynchronously after profile save
    let syncResults = null;
    try {
      syncResults = await syncStudentStats(student.id);
    } catch (syncError: unknown) {
      const errorMsg = syncError instanceof Error ? syncError.message : 'Scraping warning';
      console.warn(`[Student Save] Platform sync warning for student ${student.id}:`, errorMsg);
    }

    return NextResponse.json({
      message: 'Student profile saved successfully',
      student,
      stats: syncResults,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Internal server error';
    console.error('[POST /api/student Error]:', error);
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}
