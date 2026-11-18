import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user.id) {
      return NextResponse.json({ success: false, message: 'Please sign in to edit an editorial.' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => null);
    const { title, summary, content, codeSnippet, codeLanguage, tags, difficulty, platform } = body ?? {};

    if ([title, summary, content].some((value) => typeof value !== 'string' || !value.trim()) ||
        [codeSnippet, codeLanguage, difficulty, platform].some((value) => value != null && typeof value !== 'string') ||
        (tags != null && (!Array.isArray(tags) || tags.some((tag) => typeof tag !== 'string')))) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid title, summary, and explanation.' },
        { status: 400 }
      );
    }

    // Check if editorial exists
    const editorial = await prisma.editorial.findUnique({
      where: { id },
      include: { author: { select: { userId: true } } },
    });

    if (!editorial) {
      return NextResponse.json(
        { success: false, message: 'Editorial not found. It may have been deleted.' },
        { status: 404 }
      );
    }

    // Check if user is the author
    if (editorial.author.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: 'You do not have permission to edit this editorial.' },
        { status: 403 }
      );
    }

    // Update editorial
    const updatedEditorial = await prisma.editorial.update({
      where: { id, author: { userId: session.user.id } },
      data: {
        title: title.trim(),
        summary: summary.trim(),
        content: content.trim(),
        codeSnippet: codeSnippet || editorial.codeSnippet,
        codeLanguage: codeLanguage || editorial.codeLanguage,
        tags: tags || editorial.tags,
        difficulty: difficulty || editorial.difficulty,
        platform: platform || editorial.platform,
        updatedAt: new Date(),
      },
      include: {
        _count: { select: { likes: true } },
        author: {
          include: {
            user: true,
          },
        },
        comments: {
          include: {
            author: {
              include: {
                user: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Editorial updated successfully',
      editorial: {
        id: updatedEditorial.id,
        authorId: updatedEditorial.author.id,
        title: updatedEditorial.title,
        problemUrl: updatedEditorial.problemUrl || '',
        platform: updatedEditorial.platform,
        difficulty: updatedEditorial.difficulty,
        authorName: updatedEditorial.author.name,
        authorAvatar: updatedEditorial.author.user?.image || '/default-avatar.png',
        authorDept: updatedEditorial.author.department,
        tags: updatedEditorial.tags,
        summary: updatedEditorial.summary,
        content: updatedEditorial.content,
        codeSnippet: updatedEditorial.codeSnippet,
        codeLanguage: updatedEditorial.codeLanguage,
        likesCount: updatedEditorial._count.likes,
        commentsCount: updatedEditorial.comments.length,
        comments: updatedEditorial.comments.map((c) => ({
          id: c.id,
          authorName: c.author.name,
          authorAvatar: c.author.user?.image || '/default-avatar.png',
          authorDept: c.author.department,
          content: c.content,
          createdAt: c.createdAt.toISOString(),
          likes: 0,
        })),
        publishedAt: updatedEditorial.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Editorial edit error:', error);
    return NextResponse.json(
      { success: false, message: 'Unable to update your editorial. Please try again.' },
      { status: 500 }
    );
  }
}
