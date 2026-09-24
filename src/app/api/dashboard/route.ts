import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { unstable_cache } from 'next/cache';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Cached public computation of leaderboard and summary metrics
// Cache TTL: 300 seconds (5 minutes), revalidated on-demand via 'dashboard' tag
const getCachedDashboardData = unstable_cache(
  async (take: number) => {
    // 1. Fetch top students ordered by totalScore desc using Prisma index
    const rawStudents = await prisma.student.findMany({
      orderBy: {
        stats: {
          totalScore: 'desc',
        },
      },
      take,
      select: {
        id: true,
        userId: true,
        name: true,
        rollNumber: true,
        department: true,
        graduationYear: true,
        profileComplete: true,
        leetcode: true,
        codeforces: true,
        codechef: true,
        github: true,
        linkedin: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
        stats: true,
      },
    });

    // Format top users with rank
    const students = rawStudents.map((student, index) => {
      const rank = student.stats?.ranking ?? (index + 1);
      return {
        id: student.id,
        userId: student.userId,
        name: student.name,
        email: student.user?.email || null,
        image: student.user?.image || null,
        rollNumber: student.rollNumber,
        department: student.department,
        graduationYear: student.graduationYear,
        profileComplete: student.profileComplete,
        handles: {
          leetcode: student.leetcode,
          codeforces: student.codeforces,
          codechef: student.codechef,
          github: student.github,
          linkedin: student.linkedin,
        },
        stats: {
          leetcodeSolved: student.stats?.leetcodeSolved ?? 0,
          leetcodeRating: student.stats?.leetcodeRating ?? null,
          codeforcesRating: student.stats?.codeforcesRating ?? null,
          codeforcesMaxRating: student.stats?.codeforcesMaxRating ?? null,
          codeforcesSolved: student.stats?.codeforcesSolved ?? 0,
          codechefRating: student.stats?.codechefRating ?? null,
          codechefSolved: student.stats?.codechefSolved ?? 0,
          codechefStars: student.stats?.codechefStars ?? null,
          codechefGlobalRank: student.stats?.codechefGlobalRank ?? null,
          totalScore: student.stats?.totalScore ?? 0,
          ranking: student.stats?.ranking ?? rank,
          departmentRanking: student.stats?.departmentRanking ?? null,
          updatedAt: student.stats?.updatedAt ?? student.updatedAt,
        },
        rank: student.stats?.ranking ?? rank,
        departmentRanking: student.stats?.departmentRanking ?? null,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
      };
    });

    // 2. Fetch minimal fields from all students to calculate aggregate department and tier metrics
    const allStudentStats = await prisma.student.findMany({
      select: {
        department: true,
        name: true,
        user: { select: { image: true } },
        stats: {
          select: {
            totalScore: true,
            leetcodeSolved: true,
            codeforcesSolved: true,
            codechefSolved: true,
          },
        },
      },
    });

    const totalStudents = allStudentStats.length;
    // Eliminates redundant prisma.student.count() query:
    const totalRegisteredStudents = totalStudents;

    const totalProblemsSolved = allStudentStats.reduce(
      (acc, s) => acc + (s.stats?.leetcodeSolved || 0) + (s.stats?.codeforcesSolved || 0) + (s.stats?.codechefSolved || 0),
      0
    );

    const averageTotalScore = totalStudents
      ? Math.round(
          allStudentStats.reduce((acc, s) => acc + (s.stats?.totalScore || 0), 0) /
            totalStudents
        )
      : 0;

    // Group department stats and identify top coder per department
    const deptMap: Record<
      string,
      { count: number; totalScore: number; totalSolved: number; topCoderName: string; topCoderScore: number; topCoderAvatar: string | null }
    > = {};

    allStudentStats.forEach((student) => {
      const dept = student.department || 'Unknown';
      const studentTotalScore = student.stats?.totalScore || 0;

      if (!deptMap[dept]) {
        deptMap[dept] = {
          count: 0,
          totalScore: 0,
          totalSolved: 0,
          topCoderName: student.name || 'NSEC Student',
          topCoderScore: studentTotalScore,
          topCoderAvatar: student.user?.image || null,
        };
      } else if (studentTotalScore > deptMap[dept].topCoderScore) {
        deptMap[dept].topCoderName = student.name || 'NSEC Student';
        deptMap[dept].topCoderScore = studentTotalScore;
        deptMap[dept].topCoderAvatar = student.user?.image || null;
      }
      deptMap[dept].count += 1;
      deptMap[dept].totalScore += studentTotalScore;
      deptMap[dept].totalSolved += (student.stats?.leetcodeSolved || 0) + (student.stats?.codeforcesSolved || 0) + (student.stats?.codechefSolved || 0);
    });

    const departmentStats = Object.entries(deptMap)
      .map(([dept, data]) => ({
        department: dept,
        studentCount: data.count,
        averageScore: Math.round(data.totalScore / data.count),
        totalSolved: data.totalSolved,
        topCoderName: data.topCoderName,
        topCoderScore: data.topCoderScore,
        topCoderAvatar: data.topCoderAvatar,
      }))
      .sort((a, b) => b.averageScore - a.averageScore)
      .map((d, idx) => ({
        ...d,
        rank: idx + 1,
        seasonalMultiplier: idx === 0 ? 2.0 : idx === 1 ? 1.75 : idx === 2 ? 1.5 : 1.25,
      }));

    const tierDistribution = {
      Phoenix: allStudentStats.filter((s) => (s.stats?.totalScore || 0) > 30000).length,
      Flame: allStudentStats.filter((s) => (s.stats?.totalScore || 0) > 10000 && (s.stats?.totalScore || 0) <= 30000).length,
      Ember: allStudentStats.filter((s) => (s.stats?.totalScore || 0) > 2000 && (s.stats?.totalScore || 0) <= 10000).length,
      Spark: allStudentStats.filter((s) => (s.stats?.totalScore || 0) <= 2000).length,
    };

    const topDepartment = departmentStats[0] || {
      department: 'CSE',
      averageScore: 0,
      seasonalMultiplier: 2.0,
    };

    return {
      students,
      summary: {
        totalStudents,
        totalRegisteredStudents,
        totalProblemsSolved,
        averageTotalScore,
        departmentStats,
        topDepartment,
        tierDistribution,
        topPerformers: students.slice(0, 5),
      },
    };
  },
  ['dashboard-public-metrics'],
  {
    revalidate: 300,
    tags: ['dashboard'],
  }
);

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const sessionUser = session?.user as { id?: string } | undefined;
    const currentUserId = sessionUser?.id || null;

    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const parsedLimit = limitParam ? parseInt(limitParam, 10) : 30;
    const take = Math.max(1, Math.min(100, isNaN(parsedLimit) ? 30 : parsedLimit));

    // Retrieve cached leaderboard and platform metrics (0 DB reads when cache is warm)
    const { students, summary } = await getCachedDashboardData(take);

    // Extract current authenticated user stats if logged in
    let currentUser = currentUserId
      ? students.find((s) => s.userId === currentUserId) || null
      : null;

    // Only if logged-in user is not in the top leaderboard do we execute a single targeted read
    if (currentUserId && !currentUser) {
      const dbUser = await prisma.student.findUnique({
        where: { userId: currentUserId },
        select: {
          id: true,
          userId: true,
          name: true,
          rollNumber: true,
          department: true,
          graduationYear: true,
          profileComplete: true,
          leetcode: true,
          codeforces: true,
          codechef: true,
          github: true,
          linkedin: true,
          createdAt: true,
          updatedAt: true,
          user: { select: { name: true, email: true, image: true } },
          stats: true,
        },
      });
      if (dbUser) {
        currentUser = {
          id: dbUser.id,
          userId: dbUser.userId,
          name: dbUser.name,
          email: dbUser.user?.email || null,
          image: dbUser.user?.image || null,
          rollNumber: dbUser.rollNumber,
          department: dbUser.department,
          graduationYear: dbUser.graduationYear,
          profileComplete: dbUser.profileComplete,
          handles: {
            leetcode: dbUser.leetcode,
            codeforces: dbUser.codeforces,
            codechef: dbUser.codechef,
            github: dbUser.github,
            linkedin: dbUser.linkedin,
          },
          stats: {
            leetcodeSolved: dbUser.stats?.leetcodeSolved ?? 0,
            leetcodeRating: dbUser.stats?.leetcodeRating ?? null,
            codeforcesRating: dbUser.stats?.codeforcesRating ?? null,
            codeforcesMaxRating: dbUser.stats?.codeforcesMaxRating ?? null,
            codeforcesSolved: dbUser.stats?.codeforcesSolved ?? 0,
            codechefRating: dbUser.stats?.codechefRating ?? null,
            codechefSolved: dbUser.stats?.codechefSolved ?? 0,
            codechefStars: dbUser.stats?.codechefStars ?? null,
            codechefGlobalRank: dbUser.stats?.codechefGlobalRank ?? null,
            totalScore: dbUser.stats?.totalScore ?? 0,
            ranking: dbUser.stats?.ranking ?? 1,
            departmentRanking: dbUser.stats?.departmentRanking ?? null,
            updatedAt: dbUser.stats?.updatedAt ?? dbUser.updatedAt,
          },
          rank: dbUser.stats?.ranking ?? 1,
          departmentRanking: dbUser.stats?.departmentRanking ?? null,
          createdAt: dbUser.createdAt,
          updatedAt: dbUser.updatedAt,
        };
      }
    }

    return NextResponse.json({
      success: true,
      currentUser,
      summary,
      students,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Internal server error';
    console.error('[GET /api/dashboard Error]:', error);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
