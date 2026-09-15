import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { fetchCodechefStats } from '@/services/platforms/codechef';

/**
 * POST /api/student/[id]/sync-codechef
 * 
 * Trigger manual CodeChef stats sync for a single student
 * Authenticated endpoint - user can only sync their own stats
 * 
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   stats?: { rating, solved, stars, globalRank },
 *   duration: number (ms)
 * }
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const studentId = id;

  try {
    // Get session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user owns this student profile
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: { select: { id: true, email: true } },
        stats: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }

    if (student.user.id !== (session.user as any).id) {
      return NextResponse.json(
        { success: false, error: 'You can only sync your own profile' },
        { status: 403 }
      );
    }

    if (!student.codechef) {
      return NextResponse.json(
        {
          success: false,
          error: 'CodeChef username not configured',
          message: 'Please set your CodeChef username in settings first',
        },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    console.log(
      `[Manual Sync] Syncing CodeChef stats for ${student.name} (${student.codechef})`
    );

    // Fetch fresh CodeChef stats
    const freshStats = await fetchCodechefStats(student.codechef);

    // Update database
    await prisma.studentStats.upsert({
      where: { studentId: student.id },
      create: {
        studentId: student.id,
        codechefRating: freshStats.rating,
        codechefSolved: freshStats.solved,
        codechefStars: freshStats.stars,
        codechefGlobalRank: freshStats.globalRank,
        codechefFailCount: 0, // Reset on manual sync
        codechefLastError: null,
      },
      update: {
        codechefRating: freshStats.rating,
        codechefSolved: freshStats.solved,
        codechefStars: freshStats.stars,
        codechefGlobalRank: freshStats.globalRank,
        codechefFailCount: 0,
        codechefLastError: null,
        updatedAt: new Date(),
      },
    });

    // Update student lastSyncedAt
    await prisma.student.update({
      where: { id: student.id },
      data: { lastSyncedAt: new Date() },
    });

    const duration = Date.now() - startTime;

    console.log(
      `[Manual Sync] Completed for ${student.name} in ${duration}ms`
    );

    return NextResponse.json({
      success: true,
      message: 'CodeChef stats synced successfully',
      stats: freshStats,
      duration,
      username: student.codechef,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[POST /api/student/[id]/sync-codechef]:', error);

    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
        message: 'Failed to sync CodeChef stats. Please try again later.',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/student/[id]/sync-codechef/status
 * 
 * Check manual sync status and failure count
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const studentId = id;

  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        stats: {
          select: {
            codechefFailCount: true,
            codechefLastError: true,
            updatedAt: true,
          },
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
    const isFailedProfile = (stats?.codechefFailCount ?? 0) >= 3;

    return NextResponse.json({
      success: true,
      studentId,
      failCount: stats?.codechefFailCount ?? 0,
      lastError: stats?.codechefLastError ?? null,
      lastUpdated: stats?.updatedAt ?? null,
      isFailedProfile,
      canRetry: !isFailedProfile,
      message: isFailedProfile
        ? 'Profile has too many consecutive failures. Admin manual intervention may be required.'
        : 'Profile is active and can be synced',
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[GET /api/student/[id]/sync-codechef/status]:', error);

    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
