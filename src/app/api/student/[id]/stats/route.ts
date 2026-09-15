import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/student/[id]/stats?platform=codechef
 * 
 * Fetch student stats for a specific platform
 * 
 * Query Parameters:
 * - platform: 'codechef', 'leetcode', 'codeforces', 'all' (default)
 * 
 * Response:
 * {
 *   success: boolean,
 *   studentId: string,
 *   codechef?: { rating, solved, stars, globalRank },
 *   leetcode?: { ... },
 *   codeforces?: { ... }
 * }
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const platform = searchParams.get('platform') || 'all';
    const studentId = params.id;

    // Fetch student and stats
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        stats: true,
        user: {
          select: { id: true },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }

    const stats = student.stats;

    if (!stats) {
      return NextResponse.json(
        {
          success: true,
          studentId,
          codechef:
            platform === 'codechef' || platform === 'all'
              ? {
                  rating: null,
                  solved: 0,
                  stars: null,
                  globalRank: null,
                  failCount: 0,
                  lastError: 'No stats available',
                }
              : undefined,
          leetcode:
            platform === 'leetcode' || platform === 'all'
              ? { solved: 0, easy: 0, medium: 0, hard: 0, rating: null }
              : undefined,
          codeforces:
            platform === 'codeforces' || platform === 'all'
              ? { rating: null, maxRating: null, rank: null, solved: 0 }
              : undefined,
        },
        { status: 200 }
      );
    }

    // Build response based on platform filter
    const response: any = {
      success: true,
      studentId,
      lastUpdated: stats.updatedAt,
    };

    if (platform === 'codechef' || platform === 'all') {
      response.codechef = {
        rating: stats.codechefRating,
        solved: stats.codechefSolved,
        stars: stats.codechefStars,
        globalRank: stats.codechefGlobalRank,
        failCount: stats.codechefFailCount,
        lastError: stats.codechefLastError,
      };
    }

    if (platform === 'leetcode' || platform === 'all') {
      response.leetcode = {
        solved: stats.leetcodeSolved,
        easy: stats.leetcodeEasySolved,
        medium: stats.leetcodeMediumSolved,
        hard: stats.leetcodeHardSolved,
        rating: stats.leetcodeRating,
      };
    }

    if (platform === 'codeforces' || platform === 'all') {
      response.codeforces = {
        rating: stats.codeforcesRating,
        maxRating: stats.codeforcesMaxRating,
        rank: stats.codeforcesRank,
        maxRank: stats.codeforcesMaxRank,
        solved: stats.codeforcesSolved,
        avatar: stats.codeforcesAvatar,
        contribution: stats.codeforcesContribution,
      };
    }

    if (platform === 'all') {
      response.totalScore = stats.totalScore;
      response.ranking = stats.ranking;
      response.departmentRanking = stats.departmentRanking;
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[GET /api/student/[id]/stats]:', error);

    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
