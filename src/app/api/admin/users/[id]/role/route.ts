import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdmin } from '@/lib/admin-auth';
import { Role } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // STRICT CHECK: Only Superadmin can manage administrative roles
  const auth = await verifyAdmin({ requireSuperAdmin: true });
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    const { id: targetUserId } = await params;
    const body = (await req.json()) as { role?: string };
    const newRole = body.role?.toUpperCase();

    // Prevent modifying own role to avoid self-lockout
    if (targetUserId === auth.user.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot modify your own administrative role.' },
        { status: 400 }
      );
    }

    if (!newRole || !['STUDENT', 'ADMIN'].includes(newRole)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid role specified. Supported role transitions are STUDENT or ADMIN.',
        },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ success: false, error: 'Target user not found.' }, { status: 404 });
    }

    // STRICT RESTRICTION: Prevent accidental modification or demotion of Superadmin accounts
    if (targetUser.role === Role.SUPERADMIN) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden: Superadmin accounts cannot be modified or demoted.',
        },
        { status: 403 }
      );
    }

    // Update role immediately in database
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole as Role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });

    const actionText = newRole === Role.ADMIN ? 'promoted to Admin' : 'restored to Regular User (Student)';

    return NextResponse.json({
      success: true,
      message: `User ${updatedUser.name || updatedUser.email} was successfully ${actionText}.`,
      user: updatedUser,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to update user role';
    console.error('[POST /api/admin/users/[id]/role Error]:', error);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
