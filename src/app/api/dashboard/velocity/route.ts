import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    // Find only the student ID for the current user, or fall back to top student by score
    const sessionUser = session?.user as { id?: string } | undefined;
    const userId = sessionUser?.id;

    const student = userId
      ? await prisma.student.findUnique({
          where: { userId },
          select: { id: true },
        })
        ?? await prisma.student.findFirst({
            orderBy: { stats: { totalScore: 'desc' } },
            select: { id: true },
          })
      : await prisma.student.findFirst({
          orderBy: { stats: { totalScore: 'desc' } },
          select: { id: true },
        });

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

    const sumTwoWeeksAgo = twoWeeksAgoLC.reduce((a, b) => a + b, 0) + twoWeeksAgoCF.reduce((a, b) => a + b, 0);
    const sumLastWeek = lastWeekLC.reduce((a, b) => a + b, 0) + lastWeekCF.reduce((a, b) => a + b, 0);
    const sumThisWeek = thisWeekLC.reduce((a, b) => a + b, 0) + thisWeekCF.reduce((a, b) => a + b, 0);

    const calcChange = (curr: number, prev: number): string => {
      if (prev === 0 && curr === 0) return '+0%';
      if (prev === 0) return `+${curr * 100}%`;
      const diff = Math.round(((curr - prev) / prev) * 100);
      return diff >= 0 ? `+${diff}%` : `${diff}%`;
    };

    const thisWeekChange = calcChange(sumThisWeek, sumLastWeek);
    const lastWeekChange = calcChange(sumLastWeek, sumTwoWeeksAgo);
    const twoWeeksAgoChange = sumTwoWeeksAgo > 0 ? `+${Math.min(100, sumTwoWeeksAgo * 10)}%` : '+0%';

    return NextResponse.json({
      success: true,
      velocity: {
        thisWeek: {
          label: 'This Week',
          change: thisWeekChange,
          leetcode: thisWeekLC,
          codeforces: thisWeekCF,
          maxVal,
        },
        lastWeek: {
          label: 'Last Week',
          change: lastWeekChange,
          leetcode: lastWeekLC,
          codeforces: lastWeekCF,
          maxVal,
        },
        twoWeeksAgo: {
          label: '2 Weeks Ago',
          change: twoWeeksAgoChange,
          leetcode: twoWeeksAgoLC,
          codeforces: twoWeeksAgoCF,
          maxVal,
        },
      },
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to calculate velocity metrics';
    console.error('[GET /api/dashboard/velocity Error]:', error);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
