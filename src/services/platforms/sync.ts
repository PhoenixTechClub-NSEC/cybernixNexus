import prisma from '@/lib/prisma';
import { fetchLeetCodeStats } from './leetcode';
import { fetchCodeforcesStats } from './codeforces';
import { fetchGfgStats } from './gfg';
import { fetchCodechefStats } from './codechef';
import { PlatformStatsResult } from './types';


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
      student.leetcode ? fetchLeetCodeStats(student.leetcode) : Promise.resolve({ solved: 0, easy: 0, medium: 0, hard: 0, rating: null }),
      student.codeforces ? fetchCodeforcesStats(student.codeforces) : Promise.resolve({ rating: null, maxRating: null, rank: null, maxRank: null, solved: 0, avatar: null, contribution: null }),
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

    // Create or update today's DailySnapshot for historical velocity calculation
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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
        leetcodeSolved,
        codeforcesSolved,
        gfgScore: gfgScore ?? 0,
        codechefRating: codechefRating ?? 0,
        totalScore,
      },
      update: {
        leetcodeSolved,
        codeforcesSolved,
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
