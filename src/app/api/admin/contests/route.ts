import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdmin } from '@/lib/admin-auth';
import { ContestStatus, Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const auth = await verifyAdmin();
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get('status');
    const q = (searchParams.get('q') || '').trim();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '10', 10)));
    const skip = (page - 1) * limit;

    const where: Prisma.ContestWhereInput = {};

    if (statusParam && statusParam !== 'ALL') {
      const upperStatus = statusParam.toUpperCase();
      if (Object.values(ContestStatus).includes(upperStatus as ContestStatus)) {
        where.status = upperStatus as ContestStatus;
      }
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { platform: { contains: q, mode: 'insensitive' } },
        { venue: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [contests, total, upcomingCount, liveCount, endedCount, archivedCount] = await Promise.all([
      prisma.contest.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ startTime: 'desc' }],
        include: {
          _count: {
            select: {
              registrations: true,
              ContestInfringement: true,
            },
          },
        },
      }),
      prisma.contest.count({ where }),
      prisma.contest.count({ where: { status: ContestStatus.UPCOMING } }),
      prisma.contest.count({ where: { status: ContestStatus.LIVE } }),
      prisma.contest.count({ where: { status: ContestStatus.ENDED } }),
      prisma.contest.count({ where: { status: ContestStatus.ARCHIVED } }),
    ]);

    return NextResponse.json({
      success: true,
      contests,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
      counts: {
        all: upcomingCount + liveCount + endedCount + archivedCount,
        upcoming: upcomingCount,
        live: liveCount,
        ended: endedCount,
        archived: archivedCount,
      },
      viewerRole: auth.user.role,
      isSuperAdmin: auth.isSuperAdmin,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to fetch contests';
    console.error('[GET /api/admin/contests Error]:', error);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await verifyAdmin();
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    const body = await req.json();

    const title = (body.title || '').trim();
    const platform = (body.platform || 'NSEC Internal').trim();
    const startTimeStr = body.startTime;
    const duration = (body.duration || '2 hours').trim();
    const description = body.description ? String(body.description).trim() : null;
    const url = body.url ? String(body.url).trim() : null;
    const venue = body.venue ? String(body.venue).trim() : null;
    const prize = body.prize ? String(body.prize).trim() : null;
    const maxParticipants = body.maxParticipants !== undefined ? Math.max(1, parseInt(body.maxParticipants, 10)) : 50;
    const isInternal = Boolean(body.isInternal);
    const hostedInternal = Boolean(body.hostedInternal);
    const enableProctoring = body.enableProctoring !== undefined ? Boolean(body.enableProctoring) : true;
    const isLinkPublished = Boolean(body.isLinkPublished);
    const displayRegisteredUsers = body.displayRegisteredUsers !== undefined ? Boolean(body.displayRegisteredUsers) : true;
    const accessCode = body.accessCode ? String(body.accessCode).trim() : null;
    const status = (body.status || ContestStatus.UPCOMING).toUpperCase();

    // Validation
    if (!title) {
      return NextResponse.json({ success: false, error: 'Contest title is required.' }, { status: 400 });
    }
    if (!platform) {
      return NextResponse.json({ success: false, error: 'Contest platform is required.' }, { status: 400 });
    }
    if (!startTimeStr) {
      return NextResponse.json({ success: false, error: 'Contest start date and time is required.' }, { status: 400 });
    }

    const startTime = new Date(startTimeStr);
    if (isNaN(startTime.getTime())) {
      return NextResponse.json({ success: false, error: 'Invalid start date and time format.' }, { status: 400 });
    }

    let registrationDeadline: Date | null = null;
    if (body.registrationDeadline) {
      registrationDeadline = new Date(body.registrationDeadline);
      if (isNaN(registrationDeadline.getTime())) {
        registrationDeadline = null;
      }
    }

    const contestStatus = Object.values(ContestStatus).includes(status as ContestStatus)
      ? (status as ContestStatus)
      : ContestStatus.UPCOMING;

    const contest = await prisma.contest.create({
      data: {
        title,
        platform,
        startTime,
        duration,
        description,
        url,
        venue,
        prize,
        maxParticipants,
        isInternal,
        hostedInternal,
        enableProctoring,
        isLinkPublished,
        displayRegisteredUsers,
        accessCode,
        registrationDeadline,
        status: contestStatus,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Contest '${contest.title}' created successfully!`,
      contest,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to create contest';
    console.error('[POST /api/admin/contests Error]:', error);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
