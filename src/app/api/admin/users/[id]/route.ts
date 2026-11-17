import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdmin } from '@/lib/admin-auth';

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
    const { id: targetUserId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        isBanned: true,
        suspensionUntil: true,
        createdAt: true,
        updatedAt: true,
        student: {
          include: {
            stats: true,
            contestRegistrations: {
              include: {
                contest: {
                  select: {
                    id: true,
                    title: true,
                    platform: true,
                    startTime: true,
                    status: true,
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
              take: 10,
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user,
      viewerRole: auth.user.role,
      isSuperAdmin: auth.isSuperAdmin,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to fetch user';
    console.error('[GET /api/admin/users/[id] Error]:', error);
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
    const { id: targetUserId } = await params;
    const body = await req.json();

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: { student: true },
    });

    if (!targetUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Admins cannot edit superadmins
    if (targetUser.role === 'SUPERADMIN' && !auth.isSuperAdmin) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admins cannot edit Superadmin accounts.' },
        { status: 403 }
      );
    }

    const userDataToUpdate: {
      name?: string;
      email?: string;
      isBanned?: boolean;
    } = {};

    if (typeof body.name === 'string' && body.name.trim()) {
      userDataToUpdate.name = body.name.trim();
    }
    if (typeof body.email === 'string' && body.email.trim()) {
      userDataToUpdate.email = body.email.trim().toLowerCase();
    }
    if (typeof body.isBanned === 'boolean') {
      userDataToUpdate.isBanned = body.isBanned;
    }

    // Student fields if present
    const studentDataToUpdate: {
      name?: string;
      department?: string;
      rollNumber?: string;
      graduationYear?: number;
      bio?: string;
    } = {};

    if (body.name && typeof body.name === 'string') studentDataToUpdate.name = body.name.trim();
    if (body.department && typeof body.department === 'string') studentDataToUpdate.department = body.department.trim();
    if (body.rollNumber && typeof body.rollNumber === 'string') studentDataToUpdate.rollNumber = body.rollNumber.trim();
    if (body.graduationYear && typeof body.graduationYear === 'number') studentDataToUpdate.graduationYear = body.graduationYear;
    if (body.bio !== undefined && typeof body.bio === 'string') studentDataToUpdate.bio = body.bio.trim();

    const updatedUser = await prisma.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { id: targetUserId },
        data: userDataToUpdate,
      });

      if (targetUser.student && Object.keys(studentDataToUpdate).length > 0) {
        await tx.student.update({
          where: { id: targetUser.student.id },
          data: studentDataToUpdate,
        });
      }

      return u;
    });

    return NextResponse.json({
      success: true,
      message: 'User details updated successfully',
      user: updatedUser,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to update user';
    console.error('[PATCH /api/admin/users/[id] Error]:', error);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
