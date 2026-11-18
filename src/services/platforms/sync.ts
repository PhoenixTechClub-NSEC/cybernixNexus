import prisma from '@/lib/prisma';
import { calculateTotalScore, countEditorialPoints, withStudentScoreTransaction } from '@/lib/student-score';
import { fetchLeetCodeStats } from './leetcode';
import { fetchCodeforcesStats } from './codeforces';
import { fetchCodechefStats } from './codechef';
import { PlatformStatsResult, LeetCodeFetchResult, CodeforcesFetchResult } from './types';

export { calculateTotalScore } from '@/lib/student-score';

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

  // Filter for only records that have changed rankings to avoid wasteful writes
  const updatesToApply = allStats.filter((stat) => {
    const newRank = overallRankMap.get(stat.id) || 1;
    const newDeptRank = deptRankMap.get(stat.id) || 1;
    return stat.ranking !== newRank || stat.departmentRanking !== newDeptRank;
  });

  // Batch updates in chunks of 5 to protect Supabase Postgres connection pool
  const BATCH_SIZE = 5;
  for (let i = 0; i < updatesToApply.length; i += BATCH_SIZE) {
    const batch = updatesToApply.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map((stat) =>
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
      student.codechef ? fetchCodechefStats(student.codechef) : Promise.resolve({ rating: null, stars: null, globalRank: null, solved: 0 }),
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
    const codechefSolved = ccRes.status === 'fulfilled'
      ? ccRes.value.solved
      : ((existingStats as any)?.codechefSolved ?? 0);
    const codechefStars = ccRes.status === 'fulfilled'
      ? ccRes.value.stars
      : (existingStats?.codechefStars ?? null);
    const codechefGlobalRank = ccRes.status === 'fulfilled'
      ? ccRes.value.globalRank
      : (existingStats?.codechefGlobalRank ?? null);
    
    let codechefFailCount = existingStats?.codechefFailCount ?? 0;
    let codechefLastError: string | null = null;
    
    if (ccRes.status === 'rejected') {
      const error = ccRes.reason?.message || 'Failed to fetch CodeChef stats';
      errors.codechef = error;
      codechefFailCount = Math.min((codechefFailCount ?? 0) + 1, 10); // Cap at 10
      codechefLastError = error;
    } else if (ccRes.status === 'fulfilled') {
      // Success - reset failure count
      codechefFailCount = 0;
      codechefLastError = null;
    }

    const platformStats = {
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
      codechefSolved,
      codechefStars,
      codechefGlobalRank,
      codechefFailCount,
      codechefLastError,
    };
    const platformScore = calculateTotalScore(platformStats);
    await withStudentScoreTransaction(student.id, async (tx) => {
      const totalScore = platformScore + await countEditorialPoints(tx, student.id);
      await tx.studentStats.upsert({
        where: { studentId: student.id },
        create: { studentId: student.id, ...platformStats, totalScore },
        update: { ...platformStats, totalScore },
      });
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

    const now = new Date();
    const todayKey = now.toISOString().slice(0, 10);
    const refreshLeetCode = lcRes.status === 'fulfilled' && lcRes.value.submissionCalendar !== undefined;
    const refreshCodeforces = cfRes.status === 'fulfilled' && cfRes.value.dailySubmissions !== undefined;

    // Preserve saved activity when a platform fails or omits its calendar.
    const dates = [...new Set([...dailyMap.keys(), todayKey])];
    const previous = refreshLeetCode && refreshCodeforces
      ? []
      : await prisma.dailySnapshot.findMany({
          where: { studentId: student.id, date: { in: dates.map((date) => new Date(date)) } },
          select: { date: true, leetcodeSolved: true, codeforcesSolved: true },
        });
    const previousByDate = new Map(previous.map((snapshot) => [snapshot.date.toISOString().slice(0, 10), snapshot]));

    const SNAPSHOT_CHUNK_SIZE = 10;
    for (let i = 0; i < dates.length; i += SNAPSHOT_CHUNK_SIZE) {
      await Promise.all(dates.slice(i, i + SNAPSHOT_CHUNK_SIZE).map((dateKey) => {
        const date = new Date(dateKey);
        const counts = dailyMap.get(dateKey);
        const saved = previousByDate.get(dateKey);
        const leetcodeSolved = refreshLeetCode ? counts?.lc ?? 0 : saved?.leetcodeSolved ?? 0;
        const codeforcesSolved = refreshCodeforces ? counts?.cf ?? 0 : saved?.codeforcesSolved ?? 0;
        const isToday = dateKey === todayKey;
        const snapshotScore = isToday ? platformScore : leetcodeSolved * 10 + codeforcesSolved * 15;
        const codechefActivity = isToday ? { codechefRating: codechefRating ?? 0, codechefSolved } : {};

        return prisma.dailySnapshot.upsert({
          where: { studentId_date: { studentId: student.id, date } },
          create: {
            studentId: student.id,
            date,
            leetcodeSolved,
            codeforcesSolved,
            totalScore: snapshotScore,
            ...codechefActivity,
          },
          update: {
            ...(refreshLeetCode ? { leetcodeSolved } : {}),
            ...(refreshCodeforces ? { codeforcesSolved } : {}),
            totalScore: snapshotScore,
            ...(ccRes.status === 'fulfilled' ? codechefActivity : {}),
          },
        });
      }));
    }

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
      codechefStars: (finalStats as any)?.codechefStars ?? null,
      codechefGlobalRank: (finalStats as any)?.codechefGlobalRank ?? null,
      codechefSolved: (finalStats as any)?.codechefSolved ?? 0,
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
