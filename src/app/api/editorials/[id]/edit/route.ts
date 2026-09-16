import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, summary, content, codeSnippet, codeLanguage, tags, difficulty, platform, publisherId } = body;

    // Validate required fields
    if (!title || !summary || !content || !publisherId) {
      return NextResponse.json(
        { success: false, message: 'Please fill in all required fields.' },
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
        { success: false, message: 'Editorial not found. It may have been deleted.' },
        { status: 404 }
      );
    }

    // Check if user is the author
    if (editorial.authorId !== publisherId) {
      return NextResponse.json(
        { success: false, message: 'You do not have permission to edit this editorial.' },
        { status: 403 }
      );
    }

    // Update editorial
    const updatedEditorial = await prisma.editorial.update({
      where: { id },
      data: {
        title,
        summary,
        content,
        codeSnippet: codeSnippet || editorial.codeSnippet,
        codeLanguage: codeLanguage || editorial.codeLanguage,
        tags: tags || editorial.tags,
        difficulty: difficulty || editorial.difficulty,
        platform: platform || editorial.platform,
        updatedAt: new Date(),
      },
      include: {
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
        likesCount: 0,
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
