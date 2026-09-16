import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { publisherId } = body;

    if (!publisherId) {
      return NextResponse.json(
        { success: false, message: 'Unable to process this request. Please try again.' },
        { status: 400 }
      );
    }

    // Check if editorial exists
    const editorial = await prisma.editorial.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!editorial) {
      return NextResponse.json(
        { success: false, message: 'Editorial not found. It may have already been deleted.' },
        { status: 404 }
      );
    }

    // Check if user is the author
    if (editorial.authorId !== publisherId) {
      return NextResponse.json(
        { success: false, message: 'You do not have permission to delete this editorial.' },
        { status: 403 }
      );
    }

    // Delete all comments associated with the editorial first
    await prisma.editorialComment.deleteMany({
      where: { editorialId: id },
    });

    // Delete editorial
    await prisma.editorial.delete({
      where: { id },
    });

    // Deduct 50 points for deleting an editorial
    const EDITORIAL_POINTS = 50;
    await prisma.studentStats.update({
      where: { studentId: editorial.authorId },
      data: {
        totalScore: {
          decrement: EDITORIAL_POINTS,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Editorial deleted successfully. 50 points have been deducted.',
    });
  } catch (error) {
    console.error('Editorial delete error:', error);
    return NextResponse.json(
      { success: false, message: 'Unable to delete your editorial. Please try again.' },
      { status: 500 }
    );
  }
}
