import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: editorialId } = await params;

    if (!editorialId) {
      return NextResponse.json(
        { success: false, message: 'Unable to load this editorial. Please try again.' },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    const sessionUser = session?.user as { id?: string } | undefined;
    const currentUserId = sessionUser?.id;

    let currentStudentId: string | null = null;
    if (currentUserId) {
      const student = await prisma.student.findUnique({
        where: { userId: currentUserId },
        select: { id: true },
      });
      currentStudentId = student?.id || null;
    }

    const editorial = await prisma.editorial.findUnique({
      where: { id: editorialId },
      include: {
        author: {
          include: {
            user: { select: { image: true } },
            stats: { select: { totalScore: true } },
          },
        },
        likes: {
          select: { studentId: true },
        },
        comments: {
          orderBy: { createdAt: 'desc' },
          include: {
            author: {
              include: {
                user: { select: { image: true } },
              },
            },
          },
        },
      },
    });

    if (!editorial) {
      return NextResponse.json(
        { success: false, message: 'Editorial not found. It may have been deleted.' },
        { status: 404 }
      );
    }

    const score = editorial.author.stats?.totalScore || 0;
    const level = Math.max(1, Math.min(100, Math.floor(score / 500)));
    const tier = score > 30000 ? 'Phoenix' : score > 10000 ? 'Flame' : score > 2000 ? 'Ember' : 'Spark';
    const isLikedByMe = currentStudentId ? editorial.likes.some((l) => l.studentId === currentStudentId) : false;

    const formattedEditorial = {
      id: editorial.id,
      authorId: editorial.authorId,
      title: editorial.title,
      problemUrl: editorial.problemUrl || '',
      platform: editorial.platform,
      difficulty: editorial.difficulty,
      authorName: editorial.author.name,
      authorAvatar: editorial.author.user?.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      authorDept: editorial.author.department,
      authorLevel: level,
      authorTier: tier,
      tags: editorial.tags,
      summary: editorial.summary,
      content: editorial.content,
      codeSnippet: editorial.codeSnippet,
      codeLanguage: editorial.codeLanguage,
      likesCount: editorial.likes.length,
      isLikedByMe,
      commentsCount: editorial.comments.length,
      comments: editorial.comments.map((c) => ({
        id: c.id,
        authorName: c.author.name,
        authorAvatar: c.author.user?.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        authorDept: c.author.department,
        content: c.content,
        createdAt: c.createdAt.toISOString(),
        likes: 0,
      })),
      publishedAt: editorial.createdAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      editorial: formattedEditorial,
    });
  } catch (error: unknown) {
    console.error(`[GET /api/editorials/[id] Error]:`, error);
    return NextResponse.json(
      { success: false, message: 'Unable to load this editorial. Please refresh and try again.' },
      { status: 500 }
    );
  }
}
