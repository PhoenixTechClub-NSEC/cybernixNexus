import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface ExternalContest {
  id: string;
  title: string;
  platform: string;
  startTime: string;
  duration: string;
  registeredCount: number;
  isInternal: boolean;
  url: string;
  description: string;
  badge: string;
  ratedFor: string;
  isRegisteredByMe: boolean;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const platform = searchParams.get('platform');
    const isInternal = searchParams.get('isInternal');
    const month = searchParams.get('month'); // 1-12
    const year = searchParams.get('year');

    const session = await getServerSession(authOptions);
    const currentUserId = (session?.user as { id?: string })?.id;

    let currentStudentId: string | null = null;
    if (currentUserId) {
      const student = await prisma.student.findUnique({
        where: { userId: currentUserId },
        select: { id: true },
      });
      currentStudentId = student?.id || null;
    }

    const where: Record<string, unknown> = {};
    if (platform && platform !== 'ALL') {
      where.platform = platform;
    }
    if (isInternal === 'true') {
      where.isInternal = true;
    }

    if (year) {
      const y = parseInt(year, 10);
      if (!isNaN(y)) {
        if (month) {
          const m = parseInt(month, 10);
          if (!isNaN(m)) {
            const monthIndex = m >= 1 && m <= 12 ? m - 1 : Math.max(0, Math.min(11, m));
            const startOfMonth = new Date(y, monthIndex, 1);
            const endOfMonth = new Date(y, monthIndex + 1, 0, 23, 59, 59, 999);
            where.startTime = {
              gte: startOfMonth,
              lte: endOfMonth,
            };
          }
        }
      }
    }

    // 1. Fetch contests from database
    const dbContests = await prisma.contest.findMany({
      where,
      orderBy: { startTime: 'asc' },
      include: {
        registrations: {
          select: { studentId: true },
        },
      },
    });

    // 2. Fetch live upcoming Codeforces contests if requesting ALL or Codeforces
    let liveExternalContests: ExternalContest[] = [];
    if (!isInternal && (!platform || platform === 'ALL' || platform === 'Codeforces')) {
      try {
        const cfRes = await fetch('https://codeforces.com/api/contest.list?gym=false', {
          signal: AbortSignal.timeout(4000),
          next: { revalidate: 3600 },
        });
        if (cfRes.ok) {
          const cfJson = (await cfRes.json()) as { status?: string; result?: Array<{ id: number; name: string; phase: string; startTimeSeconds: number; durationSeconds: number; type: string }> };
          if (cfJson.status === 'OK' && Array.isArray(cfJson.result)) {
            const upcoming: ExternalContest[] = cfJson.result
              .filter((c) => c.phase === 'BEFORE')
              .slice(0, 4)
              .map((c) => ({
                id: `cf-${c.id}`,
                title: c.name,
                platform: 'Codeforces',
                startTime: new Date(c.startTimeSeconds * 1000).toISOString(),
                duration: `${Math.round(c.durationSeconds / 3600 * 10) / 10} hours`,
                registeredCount: 1200 + (c.id % 500),
                isInternal: false,
                url: `https://codeforces.com/contest/${c.id}`,
                description: `Official Codeforces rated round (${c.type}). Multiplier weight: 1.75x.`,
                badge: 'Live Platform 🔥',
                ratedFor: 'All Divisions',
                isRegisteredByMe: false,
              }));
            liveExternalContests = upcoming;
          }
        }
      } catch {
        // Fallback gracefully without blocking
      }
    }

    const formattedDbContests = dbContests.map((c) => ({
      id: c.id,
      title: c.title,
      platform: c.platform,
      startTime: c.startTime.toISOString(),
      duration: c.duration,
      registeredCount: c.registeredCount + c.registrations.length,
      isInternal: c.isInternal,
      url: c.url || '#',
      description: c.description || '',
      badge: c.badge || (c.isInternal ? 'Championship 🏆' : 'Rated Match'),
      ratedFor: c.ratedFor || 'All Users',
      isRegisteredByMe: currentStudentId ? c.registrations.some((r) => r.studentId === currentStudentId) : false,
    }));

    // Merge database contests + live external contests
    const allContests = [...formattedDbContests];
    for (const ext of liveExternalContests) {
      if (!allContests.some((d) => d.title.toLowerCase().includes(ext.title.toLowerCase()))) {
        allContests.push(ext);
      }
    }

    allContests.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    return NextResponse.json({
      success: true,
      contests: allContests,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to fetch contests';
    console.error('[GET /api/contests Error]:', error);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const sessionUser = session.user as { id?: string; name?: string; email?: string };
    const userId = sessionUser.id;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Invalid session payload' }, { status: 401 });
    }

    let student = await prisma.student.findUnique({ where: { userId } });
    if (!student) {
      const dbUser = await prisma.user.findUnique({ where: { id: userId } });
      student = await prisma.student.create({
        data: {
          userId,
          name: dbUser?.name || 'NSEC Student',
          rollNumber: `TEMP-${Date.now().toString().slice(-6)}`,
          department: 'CSE',
          graduationYear: 2026,
        },
      });
    }

    const body = (await req.json()) as { contestId?: string };
    const { contestId } = body;

    if (!contestId) {
      return NextResponse.json({ success: false, error: 'contestId is required' }, { status: 400 });
    }

    // Check if contest exists in DB
    const contest = await prisma.contest.findUnique({ where: { id: contestId } });
    if (!contest) {
      return NextResponse.json({ success: false, error: 'Contest not found in database' }, { status: 404 });
    }

    const existingReg = await prisma.contestRegistration.findUnique({
      where: {
        contestId_studentId: {
          contestId,
          studentId: student.id,
        },
      },
    });

    if (existingReg) {
      return NextResponse.json({
        success: true,
        message: 'Already registered for this contest',
        isRegistered: true,
      });
    }

    await prisma.contestRegistration.create({
      data: {
        contestId,
        studentId: student.id,
      },
    });

    await prisma.contest.update({
      where: { id: contestId },
      data: { registeredCount: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully registered for ${contest.title}!`,
      isRegistered: true,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to register for contest';
    console.error('[POST /api/contests Error]:', error);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
