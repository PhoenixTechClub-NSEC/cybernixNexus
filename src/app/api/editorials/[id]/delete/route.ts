import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { recalculateStudentScore, withStudentScoreTransaction } from '@/lib/student-score';
import { revalidateTag } from 'next/cache';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user.id) {
      return NextResponse.json({ success: false, message: 'Please sign in to delete an editorial.' }, { status: 401 });
    }
    const { id } = await params;

    // Check if editorial exists
    const editorial = await prisma.editorial.findUnique({
      where: { id },
      select: { authorId: true, author: { select: { userId: true } } },
    });

    if (!editorial) {
      return NextResponse.json(
        { success: false, message: 'Editorial not found. It may have already been deleted.' },
        { status: 404 }
      );
    }

    // Check if user is the author
    if (editorial.author.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: 'You do not have permission to delete this editorial.' },
        { status: 403 }
      );
    }

    await withStudentScoreTransaction(editorial.authorId, async (tx) => {
      await tx.editorial.delete({ where: { id, author: { userId: session.user.id } } });
      await recalculateStudentScore(tx, editorial.authorId);
    });
    revalidateTag('dashboard', { expire: 0 });

    return NextResponse.json({
      success: true,
      message: 'Editorial deleted successfully.',
    });
  } catch (error) {
    console.error('Editorial delete error:', error);
    return NextResponse.json(
      { success: false, message: 'Unable to delete your editorial. Please try again.' },
      { status: 500 }
    );
  }
}
