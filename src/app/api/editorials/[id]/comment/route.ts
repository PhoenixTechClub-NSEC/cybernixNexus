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

    const body = await req.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ success: false, error: 'Comment content is required' }, { status: 400 });
    }

    let student = await prisma.student.findUnique({
      where: { userId },
      select: { id: true, name: true, department: true, user: { select: { image: true } } },
    });

    if (!student) {
      const dbUser = await prisma.user.findUnique({ where: { id: userId } });
      const created = await prisma.student.create({
        data: {
          userId,
          name: dbUser?.name || 'NSEC Student',
          rollNumber: `TEMP-${Date.now().toString().slice(-6)}`,
          department: 'CSE',
          graduationYear: 2026,
        },
        include: { user: { select: { image: true } } },
      });
      student = created;
    }

    const newComment = await prisma.editorialComment.create({
      data: {
        editorialId,
        authorId: student.id,
        content: content.trim(),
      },
      include: {
        author: {
          include: {
            user: { select: { image: true } },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      comment: {
        id: newComment.id,
        authorName: newComment.author.name,
        authorAvatar: newComment.author.user?.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        authorDept: newComment.author.department,
        content: newComment.content,
        createdAt: newComment.createdAt.toISOString(),
        likes: 0,
      },
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to add comment';
    console.error('[POST /api/editorials/[id]/comment Error]:', error);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
