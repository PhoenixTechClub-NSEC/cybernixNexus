import prisma from '@/lib/prisma';
import { fetchLeetCodeStats } from './leetcode';
import { fetchCodeforcesStats } from './codeforces';
import { fetchCodechefStats } from './codechef';
import { PlatformStatsResult, LeetCodeFetchResult, CodeforcesFetchResult } from './types';


//will change the logic later using the formula discussed
//-Satyaki
export function calculateTotalScore(stats: {
  leetcodeSolved: number;
  leetcodeEasySolved?: number;
  leetcodeMediumSolved?: number;
  leetcodeHardSolved?: number;
  leetcodeRating: number | null;
  codeforcesRating: number | null;
  codeforcesSolved: number;
  codechefRating: number | null;
  streakDays?: number;
}): number {
  const easy = stats.leetcodeEasySolved ?? Math.round(Math.max(0, stats.leetcodeSolved) * 0.4);
  const medium = stats.leetcodeMediumSolved ?? Math.round(Math.max(0, stats.leetcodeSolved) * 0.5);
  const hard = stats.leetcodeHardSolved ?? Math.round(Math.max(0, stats.leetcodeSolved) * 0.1);

  // LeetCode: (Easy * 10 + Medium * 30 + Hard * 75) * 1.5 Weight
  const lcRawPoints = easy * 10 + medium * 30 + hard * 75;
  const lcPoints = lcRawPoints * 1.5;

  // Codeforces: Solved * 35 (reflecting higher difficulty) * 1.75 Weight
  const cfSolvedPoints = Math.max(0, stats.codeforcesSolved) * 35 * 1.75;

  // CodeChef Rating bonus contribution if available
  const ccPoints = stats.codechefRating ? Math.max(0, stats.codechefRating - 1000) * 0.5 * 1.25 : 0;

  // Streak Multiplier bonus: +0.01x per active streak day up to 1.60x (60 days)
  const streak = Math.max(0, stats.streakDays ?? 0);
  const streakMultiplier = Math.min(1.6, 1.0 + streak * 0.01);

  return Math.round((lcPoints + cfSolvedPoints + ccPoints) * streakMultiplier);
}

export async function recalculateRankings(): Promise<void> {
  const allStats = await prisma.studentStats.findMany({
    orderBy: {
      totalScore: 'desc',
    },
    include: {
      student: {
        select: { department: true },
      },
    },
  });

  if (allStats.length === 0) return;

  // Sort overall by totalScore desc
  const sortedOverall = [...allStats].sort((a, b) => b.totalScore - a.totalScore);
  const overallRankMap = new Map<string, number>();
  sortedOverall.forEach((stat, index) => {
    overallRankMap.set(stat.id, index + 1);
  });

  // Group by department for departmentRanking
  const deptGroups = new Map<string, typeof allStats>();
  allStats.forEach((stat) => {
    const dept = stat.student?.department || 'DEFAULT';
    if (!deptGroups.has(dept)) {
      deptGroups.set(dept, []);
    }
    deptGroups.get(dept)!.push(stat);
  });

  const deptRankMap = new Map<string, number>();
  deptGroups.forEach((deptStats) => {
    const sortedDept = [...deptStats].sort((a, b) => b.totalScore - a.totalScore);
    sortedDept.forEach((stat, index) => {
      deptRankMap.set(stat.id, index + 1);
    });
  });

  await Promise.all(
    allStats.map((stat) =>
      prisma.studentStats.update({
        where: { id: stat.id },
        data: {
          ranking: overallRankMap.get(stat.id) || 1,
          departmentRanking: deptRankMap.get(stat.id) || 1,
        },
      })
    )
  );
}

export async function syncStudentStats(studentId: string): Promise<PlatformStatsResult> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { stats: true },
  });

  if (!student) {
    throw new Error(`Student with ID ${studentId} not found`);
  }

  const existingStats = student.stats;

  // Create SyncJob record
  const syncJob = await prisma.syncJob.create({
    data: {
      studentId: student.id,
      status: 'PENDING',
      startedAt: new Date(),
    },
  });

  const errors: Record<string, string> = {};

  try {
    const [lcRes, cfRes, ccRes] = await Promise.allSettled([
      student.leetcode ? fetchLeetCodeStats(student.leetcode) : Promise.resolve<LeetCodeFetchResult>({ solved: 0, easy: 0, medium: 0, hard: 0, rating: null, submissionCalendar: {} }),
      student.codeforces ? fetchCodeforcesStats(student.codeforces) : Promise.resolve<CodeforcesFetchResult>({ rating: null, maxRating: null, rank: null, maxRank: null, solved: 0, avatar: null, contribution: null, dailySubmissions: {} }),
      student.codechef ? fetchCodechefStats(student.codechef) : Promise.resolve({ rating: null }),
    ]);

    const leetcodeSolved = lcRes.status === 'fulfilled'
      ? lcRes.value.solved
      : (existingStats?.leetcodeSolved ?? 0);
    const leetcodeEasySolved = lcRes.status === 'fulfilled'
      ? lcRes.value.easy
      : (existingStats?.leetcodeEasySolved ?? Math.round(leetcodeSolved * 0.4));
    const leetcodeMediumSolved = lcRes.status === 'fulfilled'
      ? lcRes.value.medium
      : (existingStats?.leetcodeMediumSolved ?? Math.round(leetcodeSolved * 0.5));
    const leetcodeHardSolved = lcRes.status === 'fulfilled'
      ? lcRes.value.hard
      : (existingStats?.leetcodeHardSolved ?? Math.round(leetcodeSolved * 0.1));
    const leetcodeRating = lcRes.status === 'fulfilled'
      ? lcRes.value.rating
      : (existingStats?.leetcodeRating ?? null);
    if (lcRes.status === 'rejected') {
      errors.leetcode = lcRes.reason?.message || 'Failed to fetch LeetCode stats';
    }

    const codeforcesRating = cfRes.status === 'fulfilled'
      ? cfRes.value.rating
      : (existingStats?.codeforcesRating ?? null);
    const codeforcesMaxRating = cfRes.status === 'fulfilled'
      ? cfRes.value.maxRating
      : (existingStats?.codeforcesMaxRating ?? null);
    const codeforcesRank = cfRes.status === 'fulfilled'
      ? cfRes.value.rank
      : (existingStats?.codeforcesRank ?? null);
    const codeforcesMaxRank = cfRes.status === 'fulfilled'
      ? cfRes.value.maxRank
      : (existingStats?.codeforcesMaxRank ?? null);
    const codeforcesSolved = cfRes.status === 'fulfilled'
      ? cfRes.value.solved
      : (existingStats?.codeforcesSolved ?? 0);
    const codeforcesAvatar = cfRes.status === 'fulfilled'
      ? cfRes.value.avatar
      : (existingStats?.codeforcesAvatar ?? null);
    const codeforcesContribution = cfRes.status === 'fulfilled'
      ? cfRes.value.contribution
      : (existingStats?.codeforcesContribution ?? null);
    if (cfRes.status === 'rejected') {
      errors.codeforces = cfRes.reason?.message || 'Failed to fetch Codeforces stats';
    }

    const codechefRating = ccRes.status === 'fulfilled'
      ? ccRes.value.rating
      : (existingStats?.codechefRating ?? null);
    if (ccRes.status === 'rejected') {
      errors.codechef = ccRes.reason?.message || 'Failed to fetch CodeChef stats';
    }

    const totalScore = calculateTotalScore({
      leetcodeSolved,
      leetcodeEasySolved,
      leetcodeMediumSolved,
      leetcodeHardSolved,
      leetcodeRating,
      codeforcesRating,
      codeforcesSolved,
      codechefRating,
    });

    await prisma.studentStats.upsert({
      where: { studentId: student.id },
      create: {
        studentId: student.id,
        leetcodeSolved,
        leetcodeEasySolved,
        leetcodeMediumSolved,
        leetcodeHardSolved,
        leetcodeRating,
        codeforcesRating,
        codeforcesMaxRating,
        codeforcesRank,
        codeforcesMaxRank,
        codeforcesSolved,
        codeforcesAvatar,
        codeforcesContribution,
        codechefRating,
        totalScore,
      },
      update: {
        leetcodeSolved,
        leetcodeEasySolved,
        leetcodeMediumSolved,
        leetcodeHardSolved,
        leetcodeRating,
        codeforcesRating,
        codeforcesMaxRating,
        codeforcesRank,
        codeforcesMaxRank,
        codeforcesSolved,
        codeforcesAvatar,
        codeforcesContribution,
        codechefRating,
        totalScore,
      },
    });

    // Collect all historical daily solves from platforms
    const dailyMap = new Map<string, { lc: number; cf: number }>();

    // 1. LeetCode submissionCalendar
    if (lcRes.status === 'fulfilled' && lcRes.value.submissionCalendar) {
      for (const [timestampStr, count] of Object.entries(lcRes.value.submissionCalendar)) {
        const ts = parseInt(timestampStr, 10);
        if (!isNaN(ts) && ts > 0 && typeof count === 'number') {
          const dateKey = new Date(ts * 1000).toISOString().split('T')[0];
          const entry = dailyMap.get(dateKey) || { lc: 0, cf: 0 };
          entry.lc += count;
          dailyMap.set(dateKey, entry);
        }
      }
    }

    // 2. Codeforces dailySubmissions
    if (cfRes.status === 'fulfilled' && cfRes.value.dailySubmissions) {
      for (const [dateKey, count] of Object.entries(cfRes.value.dailySubmissions)) {
        if (typeof count === 'number' && count > 0) {
          const entry = dailyMap.get(dateKey) || { lc: 0, cf: 0 };
          entry.cf += count;
          dailyMap.set(dateKey, entry);
        }
      }
    }

    // Upsert historical DailySnapshots
    const upsertPromises = Array.from(dailyMap.entries()).map(([dateStr, counts]) => {
      const snapDate = new Date(`${dateStr}T00:00:00.000Z`);
      const dayScore = counts.lc * 10 + counts.cf * 15;
      return prisma.dailySnapshot.upsert({
        where: {
          studentId_date: {
            studentId: student.id,
            date: snapDate,
          },
        },
        create: {
          studentId: student.id,
          date: snapDate,
          leetcodeSolved: counts.lc,
          codeforcesSolved: counts.cf,
          codechefRating: 0,
          totalScore: dayScore,
        },
        update: {
          leetcodeSolved: counts.lc,
          codeforcesSolved: counts.cf,
          totalScore: dayScore,
        },
      });
    });

    await Promise.all(upsertPromises);

    // Create or update today's DailySnapshot
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    const todayActivity = dailyMap.get(todayStr) || { lc: 0, cf: 0 };

    await prisma.dailySnapshot.upsert({
      where: {
        studentId_date: {
          studentId: student.id,
          date: today,
        },
      },
      create: {
        studentId: student.id,
        date: today,
        leetcodeSolved: todayActivity.lc,
        codeforcesSolved: todayActivity.cf,
        codechefRating: codechefRating ?? 0,
        totalScore,
      },
      update: {
        leetcodeSolved: todayActivity.lc,
        codeforcesSolved: todayActivity.cf,
        codechefRating: codechefRating ?? 0,
        totalScore,
      },
    });

    // Recalculate rankings across all students
    await recalculateRankings();


    // Fetch updated stats with ranking
    const finalStats = await prisma.studentStats.findUnique({
      where: { studentId: student.id },
    });

    const hasErrors = Object.keys(errors).length > 0;
    const isTotalFailure =
      hasErrors &&
      [student.leetcode, student.codeforces, student.codechef].filter(Boolean).length ===
      Object.keys(errors).length;

    await prisma.syncJob.update({
      where: { id: syncJob.id },
      data: {
        status: isTotalFailure ? 'FAILED' : 'SUCCESS',
        finishedAt: new Date(),
        error: hasErrors ? JSON.stringify(errors) : null,
      },
    });

    // Update lastSyncedAt on student
    await prisma.student.update({
      where: { id: student.id },
      data: { lastSyncedAt: new Date() },
    });

    return {
      leetcodeSolved: finalStats?.leetcodeSolved ?? 0,
      leetcodeEasySolved: finalStats?.leetcodeEasySolved ?? 0,
      leetcodeMediumSolved: finalStats?.leetcodeMediumSolved ?? 0,
      leetcodeHardSolved: finalStats?.leetcodeHardSolved ?? 0,
      leetcodeRating: finalStats?.leetcodeRating ?? null,
      codeforcesRating: finalStats?.codeforcesRating ?? null,
      codeforcesMaxRating: finalStats?.codeforcesMaxRating ?? null,
      codeforcesRank: finalStats?.codeforcesRank ?? null,
      codeforcesMaxRank: finalStats?.codeforcesMaxRank ?? null,
      codeforcesSolved: finalStats?.codeforcesSolved ?? 0,
      codeforcesAvatar: finalStats?.codeforcesAvatar ?? null,
      codeforcesContribution: finalStats?.codeforcesContribution ?? null,
      codechefRating: finalStats?.codechefRating ?? null,
      totalScore: finalStats?.totalScore ?? 0,
      ranking: finalStats?.ranking ?? null,
      departmentRanking: finalStats?.departmentRanking ?? null,
      syncJobId: syncJob.id,
      errors,
    };
  } catch (fatalError: any) {
    await prisma.syncJob.update({
      where: { id: syncJob.id },
      data: {
        status: 'FAILED',
        finishedAt: new Date(),
        error: fatalError.message || 'Fatal error during platform sync',
      },
    });
    throw fatalError;
  }
}
