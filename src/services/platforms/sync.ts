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
  const lcPoints = stats.leetcodeSolved * 10;
  const lcRatingPoints = stats.leetcodeRating ? Math.max(0, stats.leetcodeRating) * 2 : 0;
  const cfPoints = stats.codeforcesRating ? Math.max(0, stats.codeforcesRating) * 3 : 0;
  const cfSolvedPoints = stats.codeforcesSolved * 15; // CF problems worth more
  const gfgPoints = stats.gfgScore ? Math.max(0, stats.gfgScore) : 0;
  const ccPoints = stats.codechefRating ? Math.max(0, stats.codechefRating) * 1.5 : 0;

  return Math.round(lcPoints + lcRatingPoints + cfPoints + cfSolvedPoints + gfgPoints + ccPoints);
}

export async function recalculateRankings(): Promise<void> {
  const allStats = await prisma.studentStats.findMany({
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
  });

  if (!student) {
    throw new Error(`Student with ID ${studentId} not found`);
  }

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

    const leetcodeData = lcRes.status === 'fulfilled' ? lcRes.value : { solved: 0, easy: 0, medium: 0, hard: 0, rating: null };
    if (lcRes.status === 'rejected') {
      errors.leetcode = lcRes.reason?.message || 'Failed to fetch LeetCode stats';
    }

    const codeforcesData = cfRes.status === 'fulfilled' ? cfRes.value : { rating: null, maxRating: null, rank: null, maxRank: null, solved: 0, avatar: null, contribution: null };
    if (cfRes.status === 'rejected') {
      errors.codeforces = cfRes.reason?.message || 'Failed to fetch Codeforces stats';
    }

    const gfgData = gfgRes.status === 'fulfilled' ? gfgRes.value : { score: null };
    if (gfgRes.status === 'rejected') {
      errors.gfg = gfgRes.reason?.message || 'Failed to fetch GFG stats';
    }

    const codechefData = ccRes.status === 'fulfilled' ? ccRes.value : { rating: null };
    if (ccRes.status === 'rejected') {
      errors.codechef = ccRes.reason?.message || 'Failed to fetch CodeChef stats';
    }

    const totalScore = calculateTotalScore({
      leetcodeSolved: leetcodeData.solved,
      leetcodeRating: leetcodeData.rating,
      codeforcesRating: codeforcesData.rating,
      codeforcesSolved: codeforcesData.solved,
      gfgScore: gfgData.score,
      codechefRating: codechefData.rating,
    });

    await prisma.studentStats.upsert({
      where: { studentId: student.id },
      create: {
        studentId: student.id,
        leetcodeSolved: leetcodeData.solved,
        leetcodeRating: leetcodeData.rating,
        codeforcesRating: codeforcesData.rating,
        codeforcesMaxRating: codeforcesData.maxRating,
        codeforcesRank: codeforcesData.rank,
        codeforcesMaxRank: codeforcesData.maxRank,
        codeforcesSolved: codeforcesData.solved,
        codeforcesAvatar: codeforcesData.avatar,
        codeforcesContribution: codeforcesData.contribution,
        gfgScore: gfgData.score,
        codechefRating: codechefData.rating,
        totalScore,
      },
      update: {
        leetcodeSolved: leetcodeData.solved,
        leetcodeRating: leetcodeData.rating,
        codeforcesRating: codeforcesData.rating,
        codeforcesMaxRating: codeforcesData.maxRating,
        codeforcesRank: codeforcesData.rank,
        codeforcesMaxRank: codeforcesData.maxRank,
        codeforcesSolved: codeforcesData.solved,
        codeforcesAvatar: codeforcesData.avatar,
        codeforcesContribution: codeforcesData.contribution,
        gfgScore: gfgData.score,
        codechefRating: codechefData.rating,
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
        leetcodeSolved: leetcodeData.solved,
        codeforcesSolved: codeforcesData.solved,
        gfgScore: gfgData.score ?? 0,
        codechefRating: codechefData.rating ?? 0,
        totalScore,
      },
      update: {
        leetcodeSolved: leetcodeData.solved,
        codeforcesSolved: codeforcesData.solved,
        gfgScore: gfgData.score ?? 0,
        codechefRating: codechefData.rating ?? 0,
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
