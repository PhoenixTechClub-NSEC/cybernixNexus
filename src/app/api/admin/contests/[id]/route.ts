import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdmin } from '@/lib/admin-auth';
import { ContestStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdmin();
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    const { id: contestId } = await params;

    const contest = await prisma.contest.findUnique({
      where: { id: contestId },
      include: {
        _count: {
          select: {
            registrations: true,
            ContestInfringement: true,
            Problem: true,
            Submission: true,
          },
        },
      },
    });

    if (!contest) {
      return NextResponse.json({ success: false, error: 'Contest not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      contest,
      viewerRole: auth.user.role,
      isSuperAdmin: auth.isSuperAdmin,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to fetch contest';
    console.error('[GET /api/admin/contests/[id] Error]:', error);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdmin();
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    const { id: contestId } = await params;
    const body = await req.json();

    const existing = await prisma.contest.findUnique({
      where: { id: contestId },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Contest not found' }, { status: 404 });
    }

    const dataToUpdate: Record<string, unknown> = {};

    if (body.title !== undefined) dataToUpdate.title = String(body.title).trim();
    if (body.platform !== undefined) dataToUpdate.platform = String(body.platform).trim();
    if (body.duration !== undefined) dataToUpdate.duration = String(body.duration).trim();
    if (body.description !== undefined) dataToUpdate.description = body.description ? String(body.description).trim() : null;
    if (body.url !== undefined) dataToUpdate.url = body.url ? String(body.url).trim() : null;
    if (body.venue !== undefined) dataToUpdate.venue = body.venue ? String(body.venue).trim() : null;
    if (body.prize !== undefined) dataToUpdate.prize = body.prize ? String(body.prize).trim() : null;
    if (body.accessCode !== undefined) dataToUpdate.accessCode = body.accessCode ? String(body.accessCode).trim() : null;
    if (body.badge !== undefined) dataToUpdate.badge = body.badge ? String(body.badge).trim() : null;
    if (body.isInternal !== undefined) dataToUpdate.isInternal = Boolean(body.isInternal);
    if (body.hostedInternal !== undefined) dataToUpdate.hostedInternal = Boolean(body.hostedInternal);
    if (body.enableProctoring !== undefined) dataToUpdate.enableProctoring = Boolean(body.enableProctoring);
    if (body.isLinkPublished !== undefined) dataToUpdate.isLinkPublished = Boolean(body.isLinkPublished);
    if (body.displayRegisteredUsers !== undefined) dataToUpdate.displayRegisteredUsers = Boolean(body.displayRegisteredUsers);

    if (body.maxParticipants !== undefined) {
      const parsedMax = parseInt(body.maxParticipants, 10);
      if (!isNaN(parsedMax) && parsedMax > 0) {
        dataToUpdate.maxParticipants = parsedMax;
      }
    }

    if (body.startTime) {
      const parsedStart = new Date(body.startTime);
      if (!isNaN(parsedStart.getTime())) {
        dataToUpdate.startTime = parsedStart;
      }
    }

    if (body.registrationDeadline !== undefined) {
      if (body.registrationDeadline === null || body.registrationDeadline === '') {
        dataToUpdate.registrationDeadline = null;
      } else {
        const parsedDeadline = new Date(body.registrationDeadline);
        if (!isNaN(parsedDeadline.getTime())) {
          dataToUpdate.registrationDeadline = parsedDeadline;
        }
      }
    }

    if (body.status) {
      const upperStatus = String(body.status).toUpperCase();
      if (Object.values(ContestStatus).includes(upperStatus as ContestStatus)) {
        dataToUpdate.status = upperStatus as ContestStatus;
      }
    }

    const updated = await prisma.contest.update({
      where: { id: contestId },
      data: dataToUpdate,
    });

    return NextResponse.json({
      success: true,
      message: `Contest '${updated.title}' updated successfully!`,
      contest: updated,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to update contest';
    console.error('[PATCH /api/admin/contests/[id] Error]:', error);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdmin();
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    const { id: contestId } = await params;

    const contest = await prisma.contest.findUnique({
      where: { id: contestId },
      select: { id: true, title: true },
    });

    if (!contest) {
      return NextResponse.json({ success: false, error: 'Contest not found' }, { status: 404 });
    }

    // Handled with cascade deletion according to database constraints
    await prisma.contest.delete({
      where: { id: contestId },
    });

    return NextResponse.json({
      success: true,
      message: `Contest '${contest.title}' and associated records were successfully deleted.`,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to delete contest';
    console.error('[DELETE /api/admin/contests/[id] Error]:', error);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
