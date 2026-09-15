import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/codechef/stats?studentIds=id1,id2,id3&sort=rating
 * 
 * Batch fetch CodeChef stats for multiple students
 * Useful for leaderboards, rankings pages
 * 
 * Query Parameters:
 * - studentIds: comma-separated student IDs (optional, fetches all if not provided)
 * - sort: 'rating', 'solved', 'rank' (default: 'rating')
 * - limit: max results (default: 100)
 * - offset: pagination offset (default: 0)
 * - departmentFilter: filter by department (optional)
 * 
 * Response:
 * {
 *   success: boolean,
 *   count: number,
 *   total: number,
 *   stats: [
 *     {
 *       studentId: string,
 *       name: string,
 *       department: string,
 *       codechef: { rating, solved, stars, globalRank },
 *       lastUpdated: ISO timestamp
 *     }
 *   ]
 * }
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentIdsParam = searchParams.get('studentIds');
    const sortBy = searchParams.get('sort') || 'rating';
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500);
    const offset = parseInt(searchParams.get('offset') || '0');
    const departmentFilter = searchParams.get('department');

    // Build where clause
    const where: any = {
      stats: {
        codechefFailCount: { lt: 3 }, // Only active users (not failed)
      },
    };

    // Filter by specific student IDs if provided
    if (studentIdsParam) {
      const ids = studentIdsParam.split(',').filter(id => id.trim());
      where.id = { in: ids };
    }

    // Filter by department if provided
    if (departmentFilter) {
      where.department = departmentFilter;
    }

    // Determine sort order
    let orderBy: any = { stats: { totalScore: 'desc' } };

    if (sortBy === 'codechef_rating') {
      orderBy = { stats: { codechefRating: 'desc' } };
    } else if (sortBy === 'solved') {
      orderBy = { stats: { codechefSolved: 'desc' } };
    } else if (sortBy === 'rating') {
      orderBy = { stats: { codechefRating: 'desc' } };
    }

    // Fetch total count
    const totalCount = await prisma.student.count({ where });

    // Fetch students with stats
    const students = await prisma.student.findMany({
      where,
      include: {
        stats: {
          select: {
            codechefRating: true,
            codechefSolved: true,
            codechefStars: true,
            codechefGlobalRank: true,
            codechefFailCount: true,
            codechefLastError: true,
            updatedAt: true,
            totalScore: true,
          },
        },
      },
      orderBy,
      skip: offset,
      take: limit,
    });

    // Format response
    const stats = students
      .filter(s => s.stats) // Ensure stats exist
      .map((student, idx) => ({
        studentId: student.id,
        name: student.name,
        department: student.department,
        codechef: {
          rating: student.stats!.codechefRating,
          solved: student.stats!.codechefSolved,
          stars: student.stats!.codechefStars,
          globalRank: student.stats!.codechefGlobalRank,
          failCount: student.stats!.codechefFailCount,
          lastError: student.stats!.codechefLastError,
        },
        lastUpdated: student.stats!.updatedAt,
        rank: offset + idx + 1, // Leaderboard rank
      }));

    return NextResponse.json({
      success: true,
      count: stats.length,
      total: totalCount,
      offset,
      limit,
      sortBy,
      stats,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[GET /api/codechef/stats]:', error);

    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
