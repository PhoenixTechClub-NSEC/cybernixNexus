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
          select: { email: true, image: true, name: true },
        },
        syncJobs: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        editorials: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: { id: true, title: true, platform: true, createdAt: true },
        },
        dailySnapshots: {
          take: 10,
          orderBy: { date: 'desc' },
          where: { totalScore: { gt: 0 } },
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

    // Dynamically evaluate badges based on verified achievements
    const badges = [];
    const stats = student.stats;
    const totalScore = stats?.totalScore || 0;
    const totalSolved = (stats?.leetcodeSolved || 0) + (stats?.codeforcesSolved || 0);

    badges.push({
      id: 'badge-spark',
      title: 'Spark Initiate',
      description: 'Joined Cybernix Nexus and connected coding profile.',
      icon: '✨',
      category: 'tier' as const,
      unlockedAt: student.createdAt.toISOString().split('T')[0],
    });

    if (totalScore >= 2000) {
      badges.push({
        id: 'badge-ember',
        title: 'Ember Hatchling',
        description: 'Crossed 2,000+ points and unlocked Ember Tier.',
        icon: '🔥',
        category: 'tier' as const,
      });
    }

    if (totalScore >= 10000) {
      badges.push({
        id: 'badge-flame',
        title: 'Flame Warrior',
        description: 'Earned 10,000+ points across synced algorithmic platforms.',
        icon: '⚡',
        category: 'tier' as const,
      });
    }

    if (totalScore >= 30000) {
      badges.push({
        id: 'badge-phoenix',
        title: 'Inferno Phoenix',
        description: 'Ascended to Level 51+ with 30,000+ points.',
        icon: '🏆',
        category: 'tier' as const,
      });
    }

    if (totalSolved >= 100) {
      badges.push({
        id: 'badge-century',
        title: 'Century Solver',
        description: 'Solved 100+ algorithmic problems.',
        icon: '🎯',
        category: 'streak' as const,
      });
    }

    if (stats?.codeforcesRating && stats.codeforcesRating >= 1400) {
      badges.push({
        id: 'badge-cf-specialist',
        title: 'Codeforces Specialist',
        description: 'Attained cyan rank rating on Codeforces.',
        icon: '💎',
        category: 'contest' as const,
      });
    }

    if (student.editorials.length > 0) {
      badges.push({
        id: 'badge-author',
        title: 'Community Scholar',
        description: 'Published algorithmic solution write-ups for peers.',
        icon: '📖',
        category: 'contribution' as const,
      });
    }

    // Dynamic recent activities from actual snapshots and published editorials
    const recentActivities = [
      ...student.dailySnapshots.map((snap) => ({
        id: `snap-${snap.id}`,
        title: `Solved ${(snap.leetcodeSolved || 0) + (snap.codeforcesSolved || 0)} problem(s) across platforms`,
        type: 'solve' as const,
        platform: (snap.codeforcesSolved > 0 ? 'Codeforces' : 'LeetCode') as any,
        timestamp: snap.date.toISOString().split('T')[0],
        pointsEarned: snap.totalScore,
      })),
      ...student.editorials.map((ed) => ({
        id: `ed-${ed.id}`,
        title: `Published Tutorial: "${ed.title}"`,
        type: 'level_up' as const,
        platform: ed.platform as any,
        timestamp: ed.createdAt.toISOString().split('T')[0],
        pointsEarned: 50,
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8);

    return NextResponse.json({
      student: {
        ...student,
        badges,
        recentActivities,
      },
      user: student.user,
    });
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
      image,
      rollNumber,
      department,
      graduationYear,
      leetcode,
      codeforces,
      codechef,
      github,
      linkedin,
      username,
      bio,
    } = body;

    if (!name || !rollNumber || !department || !graduationYear) {
      return NextResponse.json(
        { error: 'Missing required fields: name, rollNumber, department, graduationYear' },
        { status: 400 }
      );
    }

    // Update user image or name if provided
    if (typeof image === 'string' && image.trim()) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          image: image.trim(),
          ...(name ? { name: name.trim() } : {}),
        },
      });
    } else if (name) {
      await prisma.user.update({
        where: { id: userId },
        data: { name: name.trim() },
      });
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
        codechef: typeof codechef === 'string' && codechef.trim() ? codechef.trim() : null,
        github: typeof github === 'string' && github.trim() ? github.trim() : null,
        linkedin: typeof linkedin === 'string' && linkedin.trim() ? linkedin.trim() : null,
        username: typeof username === 'string' && username.trim() ? username.trim() : null,
        bio: typeof bio === 'string' && bio.trim() ? bio.trim() : null,
        profileComplete: true,
      },
      update: {
        name: name.trim(),
        rollNumber: rollNumber.trim(),
        department: department.trim(),
        graduationYear: validGradYear,
        leetcode: typeof leetcode === 'string' && leetcode.trim() ? leetcode.trim() : null,
        codeforces: typeof codeforces === 'string' && codeforces.trim() ? codeforces.trim() : null,
        codechef: typeof codechef === 'string' && codechef.trim() ? codechef.trim() : null,
        ...(typeof github === 'string' ? { github: github.trim() || null } : {}),
        ...(typeof linkedin === 'string' ? { linkedin: linkedin.trim() || null } : {}),
        ...(typeof username === 'string' ? { username: username.trim() || null } : {}),
        ...(typeof bio === 'string' ? { bio: bio.trim() || null } : {}),
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
