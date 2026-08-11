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

    // Calculate top problem solver from studentStats
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
          scoreOrMetric: `${topSolver.leetcodeSolved} Problems Solved`,
          badgeIcon: '⚡',
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
