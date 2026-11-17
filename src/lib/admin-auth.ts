import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';
import { NextResponse } from 'next/server';

export interface AdminAuthSuccess {
  authorized: true;
  user: {
    id: string;
    email: string | null;
    name: string | null;
    role: Role;
    isBanned: boolean;
  };
  isSuperAdmin: boolean;
}

export interface AdminAuthFailure {
  authorized: false;
  response: NextResponse;
}

export type AdminAuthResult = AdminAuthSuccess | AdminAuthFailure;

/**
 * Validates that the current request is from an authenticated user with ADMIN or SUPERADMIN role.
 * Queries the database directly on every invocation to ensure privilege changes take effect immediately
 * without waiting for session/token invalidation.
 */
export async function verifyAdmin(options: { requireSuperAdmin?: boolean } = {}): Promise<AdminAuthResult> {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    console.error('[Admin Auth] Error fetching session:', error);
  }

  if (!session || !session.user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required.' },
        { status: 401 }
      ),
    };
  }

  const sessionUser = session.user as { id?: string; email?: string };
  const userId = sessionUser.id;

  if (!userId && !sessionUser.email) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: 'Invalid session payload.' },
        { status: 401 }
      ),
    };
  }

  // Look up user directly in the database to verify real-time role
  let dbUser = null;
  try {
    if (userId) {
      dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, role: true, isBanned: true },
      });
    }
    if (!dbUser && sessionUser.email) {
      dbUser = await prisma.user.findUnique({
        where: { email: sessionUser.email },
        select: { id: true, email: true, name: true, role: true, isBanned: true },
      });
    }
  } catch (dbError) {
    console.error('[Admin Auth] Database error querying user role:', dbError);
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: 'Failed to authenticate user role.' },
        { status: 500 }
      ),
    };
  }

  if (!dbUser) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: 'User account not found.' },
        { status: 404 }
      ),
    };
  }

  if (dbUser.isBanned) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: 'Account has been suspended.' },
        { status: 403 }
      ),
    };
  }

  const isSuperAdmin = dbUser.role === Role.SUPERADMIN;
  const isAdmin = dbUser.role === Role.ADMIN || isSuperAdmin;

  if (options.requireSuperAdmin) {
    if (!isSuperAdmin) {
      return {
        authorized: false,
        response: NextResponse.json(
          {
            success: false,
            error: 'Forbidden: Superadmin access required. Admin role does not have permission for this action.',
          },
          { status: 403 }
        ),
      };
    }
  } else {
    if (!isAdmin) {
      return {
        authorized: false,
        response: NextResponse.json(
          { success: false, error: 'Forbidden: Administrator privileges required.' },
          { status: 403 }
        ),
      };
    }
  }

  return {
    authorized: true,
    user: dbUser,
    isSuperAdmin,
  };
}
