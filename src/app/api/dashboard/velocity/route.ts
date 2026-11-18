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

    const dayMs = 24 * 60 * 60 * 1000;
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const firstDay = new Date(today.getTime() - 20 * dayMs);
    const snapshots = await prisma.dailySnapshot.findMany({
      where: { studentId: student.id, date: { gte: firstDay, lte: today } },
      select: { date: true, leetcodeSolved: true, codeforcesSolved: true },
    });

    const leetcodeAll = Array<number>(21).fill(0);
    const codeforcesAll = Array<number>(21).fill(0);
    for (const snapshot of snapshots) {
      const index = (snapshot.date.getTime() - firstDay.getTime()) / dayMs;
      leetcodeAll[index] = snapshot.leetcodeSolved;
      codeforcesAll[index] = snapshot.codeforcesSolved;
    }

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
