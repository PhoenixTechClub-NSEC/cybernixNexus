import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { syncStudentStats } from '@/services/platforms';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();

    const {
      leetcode,
      codeforces,
      gfg,
      codechef,
      name,
      avatar,
    } = body;

    const student = await prisma.student.findUnique({
      where: { userId },
      include: { user: true, stats: true },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // Check changed platform handles
    const oldLc = (student.leetcode || '').trim();
    const oldCf = (student.codeforces || '').trim();
    const oldGfg = (student.gfg || '').trim();
    const oldCc = (student.codechef || '').trim();

    const newLc = typeof leetcode === 'string' ? leetcode.trim() : oldLc;
    const newCf = typeof codeforces === 'string' ? codeforces.trim() : oldCf;
    const newGfg = typeof gfg === 'string' ? gfg.trim() : oldGfg;
    const newCc = typeof codechef === 'string' ? codechef.trim() : oldCc;

    const changedPlatforms = {
      leetcode: oldLc !== newLc,
      codeforces: oldCf !== newCf,
      gfg: oldGfg !== newGfg,
      codechef: oldCc !== newCc,
    };

    const hasHandleChanges = Object.values(changedPlatforms).some(Boolean);

    // Update user image / name if provided
    if (avatar || name) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          ...(avatar ? { image: avatar } : {}),
          ...(name ? { name } : {}),
        },
      });
    }

    // Update student table handles
    const updatedStudent = await prisma.student.update({
      where: { id: student.id },
      data: {
        leetcode: newLc || null,
        codeforces: newCf || null,
        gfg: newGfg || null,
        codechef: newCc || null,
        ...(name ? { name } : {}),
      },
      include: {
        stats: true,
        user: {
          select: { email: true, image: true },
        },
      },
    });

    let syncResult = null;
    if (hasHandleChanges) {
      // Trigger sync and recalculate ratings for updated handles
      try {
        syncResult = await syncStudentStats(student.id);
      } catch (syncError: any) {
        console.warn(`[Handles Sync Warning] ${syncError.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      hasHandleChanges,
      changedPlatforms,
      student: updatedStudent,
      stats: syncResult,
      message: hasHandleChanges
        ? 'Platform handles updated & stats fetched successfully'
        : 'Profile updated',
    });
  } catch (error: any) {
    console.error('[POST /api/student/handles Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update platform handles' },
      { status: 500 }
    );
  }
}
