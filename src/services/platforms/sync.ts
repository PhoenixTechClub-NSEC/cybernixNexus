import prisma from '@/lib/prisma';
import { fetchLeetCodeStats } from './leetcode';
import { fetchCodeforcesStats } from './codeforces';
import { fetchGfgStats } from './gfg';
import { fetchCodechefStats } from './codechef';
import { PlatformStatsResult } from './types';

export function calculateTotalScore(stats: {
  leetcodeSolved: number;
  leetcodeRating: number | null;
  codeforcesRating: number | null;
  gfgScore: number | null;
  codechefRating: number | null;
}): number {
  const lcPoints = stats.leetcodeSolved * 10;
  const lcRatingPoints = stats.leetcodeRating ? Math.max(0, stats.leetcodeRating) * 2 : 0;
  const cfPoints = stats.codeforcesRating ? Math.max(0, stats.codeforcesRating) * 3 : 0;
  const gfgPoints = stats.gfgScore ? Math.max(0, stats.gfgScore) : 0;
  const ccPoints = stats.codechefRating ? Math.max(0, stats.codechefRating) * 1.5 : 0;

  return Math.round(lcPoints + lcRatingPoints + cfPoints + gfgPoints + ccPoints);
}

export async function syncStudentStats(studentId: string): Promise<PlatformStatsResult> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    throw new Error(`Student with ID ${studentId} not found`);
  }

  const errors: Record<string, string> = {};

  const [lcRes, cfRes, gfgRes, ccRes] = await Promise.allSettled([
    student.leetcode ? fetchLeetCodeStats(student.leetcode) : Promise.resolve({ solved: 0, rating: null }),
    student.codeforces ? fetchCodeforcesStats(student.codeforces) : Promise.resolve({ rating: null, maxRating: null }),
    student.gfg ? fetchGfgStats(student.gfg) : Promise.resolve({ score: null }),
    student.codechef ? fetchCodechefStats(student.codechef) : Promise.resolve({ rating: null }),
  ]);

  const leetcodeData = lcRes.status === 'fulfilled' ? lcRes.value : { solved: 0, rating: null };
  if (lcRes.status === 'rejected') {
    errors.leetcode = lcRes.reason?.message || 'Failed to fetch LeetCode stats';
  }

  const codeforcesData = cfRes.status === 'fulfilled' ? cfRes.value : { rating: null, maxRating: null };
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
    gfgScore: gfgData.score,
    codechefRating: codechefData.rating,
  });

  const updatedStats = await prisma.studentStats.upsert({
    where: { studentId: student.id },
    create: {
      studentId: student.id,
      leetcodeSolved: leetcodeData.solved,
      leetcodeRating: leetcodeData.rating,
      codeforcesRating: codeforcesData.rating,
      codeforcesMaxRating: codeforcesData.maxRating,
      gfgScore: gfgData.score,
      codechefRating: codechefData.rating,
      totalScore,
    },
    update: {
      leetcodeSolved: leetcodeData.solved,
      leetcodeRating: leetcodeData.rating,
      codeforcesRating: codeforcesData.rating,
      codeforcesMaxRating: codeforcesData.maxRating,
      gfgScore: gfgData.score,
      codechefRating: codechefData.rating,
      totalScore,
    },
  });

  return {
    leetcodeSolved: updatedStats.leetcodeSolved,
    leetcodeRating: updatedStats.leetcodeRating,
    codeforcesRating: updatedStats.codeforcesRating,
    codeforcesMaxRating: updatedStats.codeforcesMaxRating,
    gfgScore: updatedStats.gfgScore,
    codechefRating: updatedStats.codechefRating,
    totalScore: updatedStats.totalScore,
    errors,
  };
}
