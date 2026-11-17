import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdmin } from '@/lib/admin-auth';
import { Role, ContestStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await verifyAdmin();
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    const [
      totalUsers,
      totalStudents,
      totalAdmins,
      totalSuperAdmins,
      totalContests,
      upcomingContests,
      liveContests,
      endedContests,
      totalRegistrations,
      recentRegistrations,
      recentContests,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: Role.STUDENT } }),
      prisma.user.count({ where: { role: Role.ADMIN } }),
      prisma.user.count({ where: { role: Role.SUPERADMIN } }),
      prisma.contest.count(),
      prisma.contest.count({ where: { status: ContestStatus.UPCOMING } }),
      prisma.contest.count({ where: { status: ContestStatus.LIVE } }),
      prisma.contest.count({ where: { status: ContestStatus.ENDED } }),
      prisma.contestRegistration.count(),
      prisma.contestRegistration.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          participantId: true,
          fullName: true,
          email: true,
          status: true,
          createdAt: true,
          contest: {
            select: { id: true, title: true, platform: true },
          },
          student: {
            select: {
              name: true,
              username: true,
              rollNumber: true,
              department: true,
            },
          },
        },
      }),
      prisma.contest.findMany({
        take: 5,
        orderBy: { startTime: 'desc' },
        select: {
          id: true,
          title: true,
          platform: true,
          startTime: true,
          duration: true,
          status: true,
          registeredCount: true,
          maxParticipants: true,
          venue: true,
          isInternal: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalStudents,
        totalAdmins,
        totalSuperAdmins,
        totalContests,
        upcomingContests,
        liveContests,
        endedContests,
        totalRegistrations,
      },
      recentRegistrations,
      recentContests,
      viewerRole: auth.user.role,
      isSuperAdmin: auth.isSuperAdmin,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to fetch admin stats';
    console.error('[GET /api/admin/stats Error]:', error);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
