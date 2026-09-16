import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Please sign in to view your editorials.' }, { status: 401 });
    }

    const sessionUser = session.user as { id?: string };
    const userId = sessionUser.id;

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Please sign in to view your editorials.' }, { status: 401 });
    }

    const student = await prisma.student.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json({
        success: true,
        editorials: [],
      });
    }

    const editorials = await prisma.editorial.findMany({
      where: { authorId: student.id },
      orderBy: { createdAt: 'desc' },
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
          select: { id: true },
        },
      },
    });

    const formattedEditorials = editorials.map((ed) => {
      const score = ed.author.stats?.totalScore || 0;
      const level = Math.max(1, Math.min(100, Math.floor(score / 500)));
      const tier = score > 30000 ? 'Phoenix' : score > 10000 ? 'Flame' : score > 2000 ? 'Ember' : 'Spark';

      return {
        id: ed.id,
        authorId: ed.authorId,
        title: ed.title,
        problemUrl: ed.problemUrl || '',
        platform: ed.platform,
        difficulty: ed.difficulty,
        authorName: ed.author.name,
        authorAvatar: ed.author.user?.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        authorDept: ed.author.department,
        authorLevel: level,
        authorTier: tier,
        tags: ed.tags,
        summary: ed.summary,
        content: ed.content,
        codeSnippet: ed.codeSnippet,
        codeLanguage: ed.codeLanguage,
        likesCount: ed.likes.length,
        commentsCount: ed.comments.length,
        publishedAt: ed.createdAt.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      editorials: formattedEditorials,
    });
  } catch (error: unknown) {
    console.error('[GET /api/editorials/my-editorials Error]:', error);
    return NextResponse.json(
      { success: false, message: 'Unable to load your editorials. Please try again.' },
      { status: 500 }
    );
  }
}
