import type { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';

export const EDITORIAL_POINTS = 50;

export function withStudentScoreTransaction<T>(
  studentId: string,
  update: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    // Serialize publishing, deleting, and platform score recalculation for this student.
    await tx.$queryRaw`SELECT "id" FROM "Student" WHERE "id" = ${studentId} FOR NO KEY UPDATE`;
    return update(tx);
  });
}

export async function countEditorialPoints(tx: Prisma.TransactionClient, studentId: string): Promise<number> {
  return EDITORIAL_POINTS * await tx.editorial.count({ where: { authorId: studentId } });
}

export async function recalculateStudentScore(tx: Prisma.TransactionClient, studentId: string): Promise<number> {
  const stats = await tx.studentStats.findUnique({ where: { studentId } });
  const platformScore = stats ? calculateTotalScore(stats) : 0;
  const totalScore = platformScore + await countEditorialPoints(tx, studentId);
  await tx.studentStats.upsert({
    where: { studentId },
    create: { studentId, totalScore },
    update: { totalScore },
  });
  return totalScore;
}

export function calculateTotalScore(stats: {
  leetcodeSolved: number;
  leetcodeEasySolved?: number;
  leetcodeMediumSolved?: number;
  leetcodeHardSolved?: number;
  leetcodeRating: number | null;
  codeforcesRating: number | null;
  codeforcesSolved: number;
  codechefRating: number | null;
  codechefSolved?: number;
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

  // CodeChef: Solved * 20 * 1.25 Weight + Rating bonus
  const ccSolvedPoints = Math.max(0, stats.codechefSolved ?? 0) * 20 * 1.25;
  const ccRatingPoints = stats.codechefRating ? Math.max(0, stats.codechefRating - 500) * 0.5 * 1.25 : 0;
  const ccPoints = ccSolvedPoints + ccRatingPoints;

  // Streak Multiplier bonus: +0.01x per active streak day up to 1.60x (60 days)
  const streak = Math.max(0, stats.streakDays ?? 0);
  const streakMultiplier = Math.min(1.6, 1.0 + streak * 0.01);

  return Math.round((lcPoints + cfSolvedPoints + ccPoints) * streakMultiplier);
}
