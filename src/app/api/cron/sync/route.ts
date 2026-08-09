import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { syncStudentStats } from '@/services/platforms/sync';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET;

    // If secret is set, verify authorization header
    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized cron request' }, { status: 401 });
    }

    const students = await prisma.student.findMany({
      select: { id: true, name: true },
    });

    const results = [];
    for (const student of students) {
      try {
        const stats = await syncStudentStats(student.id);
        results.push({ studentId: student.id, name: student.name, success: true, score: stats.totalScore });
      } catch (err: any) {
        results.push({ studentId: student.id, name: student.name, success: false, error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      syncedCount: results.filter((r) => r.success).length,
      totalCount: students.length,
      details: results,
    });
  } catch (error: any) {
    console.error('[GET /api/cron/sync Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Cron sync failed' },
      { status: 500 }
    );
  }
}
