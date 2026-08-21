import prisma from '@/lib/prisma';
import { fetchLeetCodeStats } from './leetcode';
import { fetchCodeforcesStats } from './codeforces';
import { fetchGfgStats } from './gfg';
import { fetchCodechefStats } from './codechef';
import { PlatformStatsResult, LeetCodeFetchResult, CodeforcesFetchResult } from './types';


//will change the logic later using the formula discussed
//-Satyaki
export function calculateTotalScore(stats: {
  leetcodeSolved: number;
  leetcodeRating: number | null;
  codeforcesRating: number | null;
  codeforcesSolved: number;
  gfgScore: number | null;
  codechefRating: number | null;
}): number {
  const lcPoints = Math.max(0, stats.leetcodeSolved) * 10;
  const cfSolvedPoints = Math.max(0, stats.codeforcesSolved) * 15; // CF problems worth more
  const gfgPoints = stats.gfgScore ? Math.max(0, stats.gfgScore) : 0;

  return Math.round(lcPoints + cfSolvedPoints + gfgPoints);
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
    const [lcRes, cfRes, gfgRes, ccRes] = await Promise.allSettled([
      student.leetcode ? fetchLeetCodeStats(student.leetcode) : Promise.resolve<LeetCodeFetchResult>({ solved: 0, easy: 0, medium: 0, hard: 0, rating: null, submissionCalendar: {} }),
      student.codeforces ? fetchCodeforcesStats(student.codeforces) : Promise.resolve<CodeforcesFetchResult>({ rating: null, maxRating: null, rank: null, maxRank: null, solved: 0, avatar: null, contribution: null, dailySubmissions: {} }),
      student.gfg ? fetchGfgStats(student.gfg) : Promise.resolve({ score: null }),
      student.codechef ? fetchCodechefStats(student.codechef) : Promise.resolve({ rating: null }),
    ]);

    const leetcodeSolved = lcRes.status === 'fulfilled'
      ? lcRes.value.solved
      : (existingStats?.leetcodeSolved ?? 0);
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

    const gfgScore = gfgRes.status === 'fulfilled'
      ? gfgRes.value.score
      : (existingStats?.gfgScore ?? null);
    if (gfgRes.status === 'rejected') {
      errors.gfg = gfgRes.reason?.message || 'Failed to fetch GFG stats';
    }

    const codechefRating = ccRes.status === 'fulfilled'
      ? ccRes.value.rating
      : (existingStats?.codechefRating ?? null);
    if (ccRes.status === 'rejected') {
      errors.codechef = ccRes.reason?.message || 'Failed to fetch CodeChef stats';
    }

    const totalScore = calculateTotalScore({
      leetcodeSolved,
      leetcodeRating,
      codeforcesRating,
      codeforcesSolved,
      gfgScore,
      codechefRating,
    });

    await prisma.studentStats.upsert({
      where: { studentId: student.id },
      create: {
        studentId: student.id,
        leetcodeSolved,
        leetcodeRating,
        codeforcesRating,
        codeforcesMaxRating,
        codeforcesRank,
        codeforcesMaxRank,
        codeforcesSolved,
        codeforcesAvatar,
        codeforcesContribution,
        gfgScore,
        codechefRating,
        totalScore,
      },
      update: {
        leetcodeSolved,
        leetcodeRating,
        codeforcesRating,
        codeforcesMaxRating,
        codeforcesRank,
        codeforcesMaxRank,
        codeforcesSolved,
        codeforcesAvatar,
        codeforcesContribution,
        gfgScore,
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
          gfgScore: 0,
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
        gfgScore: gfgScore ?? 0,
        codechefRating: codechefRating ?? 0,
        totalScore,
      },
      update: {
        leetcodeSolved: todayActivity.lc,
        codeforcesSolved: todayActivity.cf,
        gfgScore: gfgScore ?? 0,
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
      [student.leetcode, student.codeforces, student.gfg, student.codechef].filter(Boolean).length ===
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
      leetcodeRating: finalStats?.leetcodeRating ?? null,
      codeforcesRating: finalStats?.codeforcesRating ?? null,
      codeforcesMaxRating: finalStats?.codeforcesMaxRating ?? null,
      codeforcesRank: finalStats?.codeforcesRank ?? null,
      codeforcesMaxRank: finalStats?.codeforcesMaxRank ?? null,
      codeforcesSolved: finalStats?.codeforcesSolved ?? 0,
      codeforcesAvatar: finalStats?.codeforcesAvatar ?? null,
      codeforcesContribution: finalStats?.codeforcesContribution ?? null,
      gfgScore: finalStats?.gfgScore ?? null,
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
