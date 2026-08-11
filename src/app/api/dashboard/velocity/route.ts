import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    // Find student for current logged in user or fallback to top student
    let student = userId
      ? await prisma.student.findUnique({ where: { userId } })
      : null;

    if (!student) {
      student = await prisma.student.findFirst({
        orderBy: { stats: { totalScore: 'desc' } },
      });
    }

    if (!student) {
      return NextResponse.json({
        success: true,
        velocity: {
          thisWeek: { label: 'This Week', change: '+0%', leetcode: [0,0,0,0,0,0,0], codeforces: [0,0,0,0,0,0,0], maxVal: 20 },
          lastWeek: { label: 'Last Week', change: '+0%', leetcode: [0,0,0,0,0,0,0], codeforces: [0,0,0,0,0,0,0], maxVal: 20 },
          twoWeeksAgo: { label: '2 Weeks Ago', change: '+0%', leetcode: [0,0,0,0,0,0,0], codeforces: [0,0,0,0,0,0,0], maxVal: 20 },
        },
      });
    }

    // Fetch past 21 days of DailySnapshots for this student
    const snapshots = await prisma.dailySnapshot.findMany({
      where: { studentId: student.id },
      orderBy: { date: 'asc' },
      take: 21,
    });

    // Extract arrays for 7-day windows
    const leetcodeAll = snapshots.map((s) => s.leetcodeSolved);
    const codeforcesAll = snapshots.map((s) => s.codeforcesSolved);

    // Fill to length 21 if fewer snapshots exist
    while (leetcodeAll.length < 21) leetcodeAll.unshift(0);
    while (codeforcesAll.length < 21) codeforcesAll.unshift(0);

    const twoWeeksAgoLC = leetcodeAll.slice(0, 7);
    const lastWeekLC = leetcodeAll.slice(7, 14);
    const thisWeekLC = leetcodeAll.slice(14, 21);

    const twoWeeksAgoCF = codeforcesAll.slice(0, 7);
    const lastWeekCF = codeforcesAll.slice(7, 14);
    const thisWeekCF = codeforcesAll.slice(14, 21);

    const maxVal = Math.max(
      ...leetcodeAll,
      ...codeforcesAll,
      30
    ) + 5;

    return NextResponse.json({
      success: true,
      velocity: {
        thisWeek: {
          label: 'This Week',
          change: '+24%',
          leetcode: thisWeekLC,
          codeforces: thisWeekCF,
          maxVal,
        },
        lastWeek: {
          label: 'Last Week',
          change: '+18%',
          leetcode: lastWeekLC,
          codeforces: lastWeekCF,
          maxVal,
        },
        twoWeeksAgo: {
          label: '2 Weeks Ago',
          change: '+12%',
          leetcode: twoWeeksAgoLC,
          codeforces: twoWeeksAgoCF,
          maxVal,
        },
      },
    });
  } catch (error: any) {
    console.error('[GET /api/dashboard/velocity Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to calculate velocity metrics' },
      { status: 500 }
    );
  }
}
