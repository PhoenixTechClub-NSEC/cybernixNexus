import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { syncStudentStats } from '@/services/platforms';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentIdParam = searchParams.get('studentId');

    const session = await getServerSession(authOptions);
    const currentUserId = (session?.user as { id?: string })?.id;

    let student = null;
    if (studentIdParam) {
      student = await prisma.student.findUnique({
        where: { id: studentIdParam },
        include: { stats: true },
      });
    } else if (currentUserId) {
      student = await prisma.student.findUnique({
        where: { userId: currentUserId },
        include: { stats: true },
      });
    }

    if (!student) {
      student = await prisma.student.findFirst({
        orderBy: { stats: { totalScore: 'desc' } },
        include: { stats: true },
      });
    }

    if (!student) {
      return NextResponse.json({
        success: true,
        currentStreak: 0,
        maxStreak: 0,
        totalSolved: 0,
        gridData: Array.from({ length: 52 }, () => Array(7).fill(0)),
        dayDetails: [],
      });
    }

    // Check if student has snapshots; if not and platform handles exist, trigger dynamic sync
    let snapshots = await prisma.dailySnapshot.findMany({
      where: { studentId: student.id },
      orderBy: { date: 'asc' },
    });

    if (snapshots.length === 0 && (student.leetcode || student.codeforces)) {
      // Trigger async sync without blocking the response
      syncStudentStats(student.id).catch((syncErr) => {
        console.warn('[Activity Route] Auto-sync on empty snapshots warning:', syncErr);
      });
      // We will just return 0-filled data for now, letting the UI load instantly.
    }

    const totalSolved = (student.stats?.leetcodeSolved || 0) + (student.stats?.codeforcesSolved || 0);

    // Build date-indexed map of real daily solved problem counts
    const dateMap = new Map<string, number>();
    snapshots.forEach((snap) => {
      const dateKey = snap.date.toISOString().split('T')[0];
      const daySolves = (snap.leetcodeSolved || 0) + (snap.codeforcesSolved || 0);
      dateMap.set(dateKey, daySolves);
    });

    // Generate 52 weeks (364 days) gridData ending today
    const weeks = 52;
    const daysPerWeek = 7;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate start date: 52 weeks ago
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (weeks * daysPerWeek - 1));

    const gridData: number[][] = [];
    const dayDetails: { date: string; formattedDate: string; count: number }[][] = [];
    let periodSolves = 0;

    for (let w = 0; w < weeks; w++) {
      const weekCol: number[] = [];
      const weekDetails: { date: string; formattedDate: string; count: number }[] = [];

      for (let d = 0; d < daysPerWeek; d++) {
        const dayOffset = w * daysPerWeek + d;
        const targetDate = new Date(startDate);
        targetDate.setDate(startDate.getDate() + dayOffset);
        const dateKey = targetDate.toISOString().split('T')[0];

        // Future dates have 0 activity
        const count = targetDate > today ? 0 : (dateMap.get(dateKey) || 0);

        weekCol.push(count);
        weekDetails.push({
          date: dateKey,
          formattedDate: targetDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          count,
        });

        periodSolves += count;
      }

      gridData.push(weekCol);
      dayDetails.push(weekDetails);
    }

    // 1. Calculate current active streak (counting backwards from today or yesterday)
    let currentStreakCount = 0;
    const todayKey = today.toISOString().split('T')[0];
    const todaySolves = dateMap.get(todayKey) || 0;

    const streakCursor = new Date(today);
    if (todaySolves > 0) {
      // User solved today, count today and walk backward
      while (true) {
        const key = streakCursor.toISOString().split('T')[0];
        const count = dateMap.get(key) || 0;
        if (count > 0) {
          currentStreakCount++;
          streakCursor.setDate(streakCursor.getDate() - 1);
        } else {
          break;
        }
      }
    } else {
      // User hasn't solved today yet, check if yesterday was active to maintain ongoing streak
      streakCursor.setDate(streakCursor.getDate() - 1);
      const yesterdayKey = streakCursor.toISOString().split('T')[0];
      const yesterdaySolves = dateMap.get(yesterdayKey) || 0;

      if (yesterdaySolves > 0) {
        while (true) {
          const key = streakCursor.toISOString().split('T')[0];
          const count = dateMap.get(key) || 0;
          if (count > 0) {
            currentStreakCount++;
            streakCursor.setDate(streakCursor.getDate() - 1);
          } else {
            break;
          }
        }
      }
    }

    // 2. Calculate max streak across chronological dates
    let maxStreakCount = 0;
    let runningStreak = 0;
    const iterDate = new Date(startDate);

    while (iterDate <= today) {
      const key = iterDate.toISOString().split('T')[0];
      const count = dateMap.get(key) || 0;
      if (count > 0) {
        runningStreak++;
        if (runningStreak > maxStreakCount) {
          maxStreakCount = runningStreak;
        }
      } else {
        runningStreak = 0;
      }
      iterDate.setDate(iterDate.getDate() + 1);
    }

    if (currentStreakCount > maxStreakCount) {
      maxStreakCount = currentStreakCount;
    }

    return NextResponse.json({
      success: true,
      studentId: student.id,
      studentName: student.name,
      currentStreak: currentStreakCount,
      maxStreak: maxStreakCount,
      totalSolved: totalSolved || periodSolves,
      periodSolves,
      gridData,
      dayDetails,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to fetch student activity';
    console.error('[GET /api/student/activity Error]:', error);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
