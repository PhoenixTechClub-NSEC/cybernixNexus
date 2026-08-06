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

    const userId = (session.user as any).id;

    const student = await prisma.student.findUnique({
      where: { userId },
      include: {
        stats: true,
        user: {
          select: { email: true, image: true },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    return NextResponse.json({ student });
  } catch (error: any) {
    console.error('[GET /api/student Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
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

    const userId = (session.user as any).id;
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
    } = body;

    if (!name || !rollNumber || !department || !graduationYear) {
      return NextResponse.json(
        { error: 'Missing required fields: name, rollNumber, department, graduationYear' },
        { status: 400 }
      );
    }

    const student = await prisma.student.upsert({
      where: { userId },
      create: {
        userId,
        name,
        rollNumber,
        department,
        graduationYear: Number(graduationYear),
        leetcode: leetcode || null,
        codeforces: codeforces || null,
        gfg: gfg || null,
        codechef: codechef || null,
        profileComplete: true,
      },
      update: {
        name,
        rollNumber,
        department,
        graduationYear: Number(graduationYear),
        leetcode: leetcode || null,
        codeforces: codeforces || null,
        gfg: gfg || null,
        codechef: codechef || null,
        profileComplete: true,
      },
    });

    // Automatically trigger stats sync asynchronously after profile save
    let syncResults = null;
    try {
      syncResults = await syncStudentStats(student.id);
    } catch (syncError: any) {
      console.warn(`[Student Save] Platform sync warning for student ${student.id}:`, syncError.message);
    }

    return NextResponse.json({
      message: 'Student profile saved successfully',
      student,
      stats: syncResults,
    });
  } catch (error: any) {
    console.error('[POST /api/student Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
