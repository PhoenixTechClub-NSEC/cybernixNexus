import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdmin } from '@/lib/admin-auth';
import { Role, Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const auth = await verifyAdmin();
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    const { searchParams } = new URL(req.url);
    const roleParam = searchParams.get('role');
    const q = (searchParams.get('q') || '').trim();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '10', 10)));
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    // Filter by role if specified and valid
    if (roleParam && roleParam !== 'ALL') {
      const upperRole = roleParam.toUpperCase();
      if (Object.values(Role).includes(upperRole as Role)) {
        where.role = upperRole as Role;
      }
    }

    // Search query across name, email, student rollNumber, or student username
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        {
          student: {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { username: { contains: q, mode: 'insensitive' } },
              { rollNumber: { contains: q, mode: 'insensitive' } },
              { department: { contains: q, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    // Parallel fetch for users, total matching count, and role counts for tab badges
    const [users, total, countAll, countStudents, countAdmins, countSuperAdmins] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ role: 'desc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          isBanned: true,
          createdAt: true,
          updatedAt: true,
          student: {
            select: {
              id: true,
              name: true,
              username: true,
              rollNumber: true,
              department: true,
              graduationYear: true,
              profileComplete: true,
              stats: {
                select: {
                  totalScore: true,
                  ranking: true,
                  departmentRanking: true,
                },
              },
              _count: {
                select: {
                  contestRegistrations: true,
                  editorials: true,
                },
              },
            },
          },
        },
      }),
      prisma.user.count({ where }),
      prisma.user.count(),
      prisma.user.count({ where: { role: Role.STUDENT } }),
      prisma.user.count({ where: { role: Role.ADMIN } }),
      prisma.user.count({ where: { role: Role.SUPERADMIN } }),
    ]);

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
      counts: {
        all: countAll,
        students: countStudents,
        admins: countAdmins,
        superadmins: countSuperAdmins,
      },
      viewerRole: auth.user.role,
      isSuperAdmin: auth.isSuperAdmin,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to fetch users';
    console.error('[GET /api/admin/users Error]:', error);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
