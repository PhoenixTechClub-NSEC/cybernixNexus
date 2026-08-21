import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id: editorialId } = await params;
    const sessionUser = session.user as { id?: string };
    const userId = sessionUser.id;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Invalid session payload' }, { status: 401 });
    }

    let student = await prisma.student.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!student) {
      const dbUser = await prisma.user.findUnique({ where: { id: userId } });
      student = await prisma.student.create({
        data: {
          userId,
          name: dbUser?.name || 'NSEC Student',
          rollNumber: `TEMP-${Date.now().toString().slice(-6)}`,
          department: 'CSE',
          graduationYear: 2026,
        },
      });
    }

    const existingLike = await prisma.editorialLike.findUnique({
      where: {
        editorialId_studentId: {
          editorialId,
          studentId: student.id,
        },
      },
    });

    let isLiked = false;
    if (existingLike) {
      await prisma.editorialLike.delete({
        where: { id: existingLike.id },
      });
      isLiked = false;
    } else {
      await prisma.editorialLike.create({
        data: {
          editorialId,
          studentId: student.id,
        },
      });
      isLiked = true;
    }

    const totalLikes = await prisma.editorialLike.count({
      where: { editorialId },
    });

    return NextResponse.json({
      success: true,
      isLiked,
      likesCount: totalLikes,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to toggle like';
    console.error('[POST /api/editorials/[id]/like Error]:', error);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
