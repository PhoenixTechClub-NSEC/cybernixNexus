import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { syncStudentStats } from '@/services/platforms';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const student = await prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    const stats = await syncStudentStats(student.id);

    return NextResponse.json({
      message: 'Student platform stats updated successfully',
      stats,
    });
  } catch (error: any) {
    console.error('[POST /api/student/sync Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync platform stats' },
      { status: 500 }
    );
  }
}
