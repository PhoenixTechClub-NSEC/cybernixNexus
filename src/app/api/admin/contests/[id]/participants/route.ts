import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdmin } from '@/lib/admin-auth';
import { RegistrationStatus, Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

function getAttendanceStatus(reg: { status: RegistrationStatus; dqReason: string | null }): 'PRESENT' | 'ABSENT' | 'PENDING' {
  if (reg.status === RegistrationStatus.ACTIVE || reg.status === RegistrationStatus.COMPLETED) {
    return 'PRESENT';
  }
  if (reg.status === RegistrationStatus.DISQUALIFIED) {
    return 'ABSENT';
  }
  return 'PENDING';
}

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
    const { searchParams } = new URL(req.url);
    const attendanceFilter = (searchParams.get('attendance') || 'ALL').toUpperCase();
    const q = (searchParams.get('q') || '').trim();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const contest = await prisma.contest.findUnique({
      where: { id: contestId },
      select: {
        id: true,
        title: true,
        platform: true,
        startTime: true,
        duration: true,
        status: true,
        maxParticipants: true,
        registeredCount: true,
        venue: true,
      },
    });

    if (!contest) {
      return NextResponse.json({ success: false, error: 'Contest not found' }, { status: 404 });
    }

    const where: Prisma.ContestRegistrationWhereInput = {
      contestId,
    };

    if (q) {
      where.OR = [
        { fullName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { participantId: { contains: q, mode: 'insensitive' } },
        { studentIdNumber: { contains: q, mode: 'insensitive' } },
        { phoneNumber: { contains: q, mode: 'insensitive' } },
        {
          student: {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { username: { contains: q, mode: 'insensitive' } },
              { rollNumber: { contains: q, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    if (attendanceFilter === 'PRESENT') {
      where.status = { in: [RegistrationStatus.ACTIVE, RegistrationStatus.COMPLETED] };
    } else if (attendanceFilter === 'ABSENT') {
      where.status = RegistrationStatus.DISQUALIFIED;
    } else if (attendanceFilter === 'PENDING') {
      where.status = RegistrationStatus.REGISTERED;
    }

    const [rawRegistrations, total, countPresent, countAbsent, countPending] = await Promise.all([
      prisma.contestRegistration.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ createdAt: 'asc' }],
        include: {
          student: {
            select: {
              id: true,
              name: true,
              username: true,
              rollNumber: true,
              department: true,
              graduationYear: true,
              user: {
                select: {
                  image: true,
                  email: true,
                },
              },
            },
          },
        },
      }),
      prisma.contestRegistration.count({ where }),
      prisma.contestRegistration.count({
        where: {
          contestId,
          status: { in: [RegistrationStatus.ACTIVE, RegistrationStatus.COMPLETED] },
        },
      }),
      prisma.contestRegistration.count({
        where: {
          contestId,
          status: RegistrationStatus.DISQUALIFIED,
        },
      }),
      prisma.contestRegistration.count({
        where: {
          contestId,
          status: RegistrationStatus.REGISTERED,
        },
      }),
    ]);

    const participants = rawRegistrations.map((r) => ({
      id: r.id,
      participantId: r.participantId,
      contestId: r.contestId,
      studentId: r.studentId,
      fullName: r.fullName || r.student.name,
      email: r.email || r.student.user.email,
      studentIdNumber: r.studentIdNumber || r.student.rollNumber,
      academicYear: r.academicYear || `${r.student.graduationYear}`,
      phoneNumber: r.phoneNumber,
      score: r.score,
      tabSwitches: r.tabSwitches,
      dqReason: r.dqReason,
      otpVerified: r.otpVerified,
      createdAt: r.createdAt,
      finishTime: r.finishTime,
      status: r.status,
      attendanceStatus: getAttendanceStatus(r),
      student: {
        id: r.student.id,
        name: r.student.name,
        username: r.student.username,
        department: r.student.department,
        avatar: r.student.user.image,
      },
    }));

    return NextResponse.json({
      success: true,
      contest,
      participants,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
      summary: {
        total: countPresent + countAbsent + countPending,
        present: countPresent,
        absent: countAbsent,
        pending: countPending,
      },
      viewerRole: auth.user.role,
      isSuperAdmin: auth.isSuperAdmin,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to fetch contest participants';
    console.error('[GET /api/admin/contests/[id]/participants Error]:', error);
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

    const targetStatus = (body.status || '').toUpperCase();
    if (!['PRESENT', 'ABSENT', 'PENDING'].includes(targetStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid attendance status. Supported values: 'PRESENT', 'ABSENT', 'PENDING'.",
        },
        { status: 400 }
      );
    }

    // Support both single registration update or bulk array of IDs
    const registrationIds: string[] = Array.isArray(body.registrationIds)
      ? body.registrationIds
      : body.registrationId
      ? [body.registrationId]
      : [];

    if (registrationIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one participant registration ID is required.' },
        { status: 400 }
      );
    }

    let dbStatus: RegistrationStatus;
    let otpVerified = false;
    let dqReason: string | null = null;

    if (targetStatus === 'PRESENT') {
      dbStatus = RegistrationStatus.ACTIVE;
      otpVerified = true;
      dqReason = null;
    } else if (targetStatus === 'ABSENT') {
      dbStatus = RegistrationStatus.DISQUALIFIED;
      otpVerified = false;
      dqReason = 'Absent';
    } else {
      // PENDING
      dbStatus = RegistrationStatus.REGISTERED;
      otpVerified = false;
      dqReason = null;
    }

    // Update in database atomically
    const updateResult = await prisma.contestRegistration.updateMany({
      where: {
        contestId,
        id: { in: registrationIds },
      },
      data: {
        status: dbStatus,
        otpVerified,
        dqReason,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Updated attendance for ${updateResult.count} participant(s) to ${targetStatus}.`,
      updatedCount: updateResult.count,
      status: targetStatus,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to update attendance';
    console.error('[PATCH /api/admin/contests/[id]/participants Error]:', error);
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
    const { searchParams } = new URL(req.url);
    const registrationId = searchParams.get('registrationId');

    if (!registrationId) {
      return NextResponse.json({ success: false, error: 'registrationId is required.' }, { status: 400 });
    }

    const reg = await prisma.contestRegistration.findUnique({
      where: { id: registrationId },
    });

    if (!reg || reg.contestId !== contestId) {
      return NextResponse.json({ success: false, error: 'Registration not found in this contest.' }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.contestRegistration.delete({
        where: { id: registrationId },
      }),
      prisma.contest.update({
        where: { id: contestId },
        data: {
          registeredCount: {
            decrement: 1,
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Participant registration removed successfully.',
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to delete participant registration';
    console.error('[DELETE /api/admin/contests/[id]/participants Error]:', error);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
