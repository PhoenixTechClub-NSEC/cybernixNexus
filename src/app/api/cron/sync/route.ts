import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { syncStudentStats } from '@/services/platforms/sync';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET;

    // If CRON_SECRET is set, verify authorization header
    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized cron request' }, { status: 401 });
    }

    // Sync only students who have not been synced for more than 3 days (or never synced)
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    const [totalStudentsCount, eligibleStudents] = await Promise.all([
      prisma.student.count(),
      prisma.student.findMany({
        where: {
          OR: [
            { lastSyncedAt: null },
            { lastSyncedAt: { lt: threeDaysAgo } },
          ],
        },
        select: { id: true, name: true, lastSyncedAt: true },
      }),
    ]);

    const results = [];
    for (const student of eligibleStudents) {
      try {
        const stats = await syncStudentStats(student.id);
        results.push({ studentId: student.id, name: student.name, success: true, score: stats.totalScore });
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown sync error';
        results.push({ studentId: student.id, name: student.name, success: false, error: errorMsg });
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      syncedCount: results.filter((r) => r.success).length,
      eligibleCount: eligibleStudents.length,
      totalCount: totalStudentsCount,
      skippedCount: totalStudentsCount - eligibleStudents.length,
      details: results,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Cron sync failed';
    console.error('[GET /api/cron/sync Error]:', error);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const studentsWithHandles = await prisma.student.findMany({
      where: {
        OR: [
          { leetcode: { not: null } },
          { codeforces: { not: null } },
          { codechef: { not: null } },
        ],
      },
      select: { id: true, name: true },
      take: 15,
    });

    const results = [];
    for (const student of studentsWithHandles) {
      try {
        const stats = await syncStudentStats(student.id);
        results.push({ studentId: student.id, name: student.name, success: true, score: stats.totalScore });
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Sync error';
        results.push({ studentId: student.id, name: student.name, success: false, error: errorMsg });
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      syncedCount: results.filter((r) => r.success).length,
      details: results,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Sync failed';
    console.error('[POST /api/cron/sync Error]:', error);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

