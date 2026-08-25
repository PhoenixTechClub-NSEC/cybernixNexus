import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const monthParam = searchParams.get('month');
    const yearParam = searchParams.get('year');

    const now = new Date();
    const month = monthParam ? parseInt(monthParam, 10) : now.getMonth() + 1;
    const year = yearParam ? parseInt(yearParam, 10) : now.getFullYear();

    const rawAchievements = await prisma.monthlyAchievement.findMany({
      where: { month, year },
      include: {
        student: {
          include: {
            user: {
              select: { name: true, image: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const achievements = rawAchievements.map((item) => ({
      id: item.id,
      category: item.category,
      title: item.title,
      winnerName: item.student?.name || item.student?.user?.name || (item.department ? `${item.department} Department` : 'NSEC Student'),
      winnerDept: item.department || item.student?.department || 'CSE',
      winnerAvatar: item.student?.user?.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      scoreOrMetric: item.scoreOrMetric,
      badgeIcon: item.badgeIcon,
    }));

    return NextResponse.json({
      success: true,
      month,
      year,
      achievements,
    });
  } catch (error: any) {
    console.error('[GET /api/achievements/monthly Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch monthly achievements' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const now = new Date();
    const month = body.month || (now.getMonth() + 1);
    const year = body.year || now.getFullYear();

    // Delete existing automated monthly achievements for this month/year
    await prisma.monthlyAchievement.deleteMany({
      where: { month, year, isManual: false },
    });

    // 1. Problem solver of the month
    const topSolver = await prisma.studentStats.findFirst({
      orderBy: { leetcodeSolved: 'desc' },
      include: { student: { include: { user: true } } },
    });

    if (topSolver && topSolver.student) {
      await prisma.monthlyAchievement.create({
        data: {
          category: 'Problem solver of the month',
          title: 'Problem Solver of the Month',
          month,
          year,
          studentId: topSolver.student.id,
          department: topSolver.student.department,
          scoreOrMetric: `${topSolver.leetcodeSolved + topSolver.codeforcesSolved} Problems Solved`,
          badgeIcon: '⚡',
          isManual: false,
        },
      });
    }

    // 2. CP Champion (highest rating)
    const topRated = await prisma.studentStats.findFirst({
      where: { codeforcesRating: { not: null } },
      orderBy: { codeforcesRating: 'desc' },
      include: { student: { include: { user: true } } },
    });

    if (topRated && topRated.student) {
      await prisma.monthlyAchievement.create({
        data: {
          category: 'CP Champion of the month',
          title: 'Highest Rated Algorithmic Star',
          month,
          year,
          studentId: topRated.student.id,
          department: topRated.student.department,
          scoreOrMetric: `${topRated.codeforcesRating} CF Rating`,
          badgeIcon: '🏆',
          isManual: false,
        },
      });
    }

    // 3. Top Department of the Month
    const allStats = await prisma.studentStats.findMany({
      include: { student: { select: { department: true } } },
    });

    const deptScores: Record<string, { total: number; count: number }> = {};
    allStats.forEach((st) => {
      const dept = st.student?.department || 'CSE';
      if (!deptScores[dept]) deptScores[dept] = { total: 0, count: 0 };
      deptScores[dept].total += st.totalScore;
      deptScores[dept].count += 1;
    });

    const topDeptEntry = Object.entries(deptScores)
      .map(([dept, d]) => ({ dept, avg: Math.round(d.total / d.count) }))
      .sort((a, b) => b.avg - a.avg)[0];

    if (topDeptEntry) {
      await prisma.monthlyAchievement.create({
        data: {
          category: 'Department of the month',
          title: 'Inter-Department Champion',
          month,
          year,
          department: topDeptEntry.dept,
          scoreOrMetric: `${topDeptEntry.avg} Avg CP Score`,
          badgeIcon: '🏛️',
          isManual: false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Calculated monthly achievements for ${month}/${year}`,
    });
  } catch (error: any) {
    console.error('[POST /api/achievements/monthly Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to compute monthly achievements' },
      { status: 500 }
    );
  }
}
