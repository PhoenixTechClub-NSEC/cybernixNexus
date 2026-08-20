import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const platform = searchParams.get('platform');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');

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

    const where: Record<string, unknown> = {};
    if (platform && platform !== 'ALL') {
      where.platform = platform;
    }
    if (difficulty && difficulty !== 'ALL') {
      where.difficulty = difficulty;
    }
    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: 'insensitive' } },
        { summary: { contains: search.trim(), mode: 'insensitive' } },
        { content: { contains: search.trim(), mode: 'insensitive' } },
        { tags: { has: search.trim() } },
        { author: { name: { contains: search.trim(), mode: 'insensitive' } } },
      ];
    }

    const rawEditorials = await prisma.editorial.findMany({
      where,
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

    const editorials = rawEditorials.map((ed) => {
      const score = ed.author.stats?.totalScore || 0;
      const level = Math.max(1, Math.min(100, Math.floor(score / 500)));
      const tier = score > 30000 ? 'Phoenix' : score > 10000 ? 'Flame' : score > 2000 ? 'Ember' : 'Spark';
      const isLikedByMe = currentStudentId ? ed.likes.some((l) => l.studentId === currentStudentId) : false;

      return {
        id: ed.id,
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
        isLikedByMe,
        commentsCount: ed.comments.length,
        comments: ed.comments.map((c) => ({
          id: c.id,
          authorName: c.author.name,
          authorAvatar: c.author.user?.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          authorDept: c.author.department,
          content: c.content,
          createdAt: c.createdAt.toISOString(),
          likes: 0,
        })),
        publishedAt: ed.createdAt.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      editorials,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to fetch editorials';
    console.error('[GET /api/editorials Error]:', error);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const sessionUser = session.user as { id?: string };
    const userId = sessionUser.id;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
    }

    let student = await prisma.student.findUnique({
      where: { userId },
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

    const body = await req.json();
    const {
      title,
      problemUrl,
      platform,
      difficulty,
      tags,
      summary,
      content,
      codeSnippet,
      codeLanguage,
    } = body;

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const newEditorial = await prisma.editorial.create({
      data: {
        title: title.trim(),
        problemUrl: problemUrl?.trim() || '',
        platform: platform || 'Codeforces',
        difficulty: difficulty || 'Medium',
        tags: Array.isArray(tags) && tags.length > 0 ? tags : ['Algorithms'],
        summary: summary?.trim() || content.slice(0, 150) + (content.length > 150 ? '...' : ''),
        content: content.trim(),
        codeSnippet: codeSnippet?.trim() || '// Solution snippet',
        codeLanguage: codeLanguage || 'cpp',
        authorId: student.id,
      },
      include: {
        author: {
          include: {
            user: { select: { image: true } },
            stats: { select: { totalScore: true } },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      editorial: newEditorial,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to create editorial';
    console.error('[POST /api/editorials Error]:', error);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
