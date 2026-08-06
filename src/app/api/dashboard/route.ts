import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const currentUserId = (session?.user as any)?.id || null;

    // Fetch all students with user profile details and coding platform stats
    const rawStudents = await prisma.student.findMany({
      include: {
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

    // Sort students by totalScore in descending order
    const sortedStudents = rawStudents
      .map((student) => {
        const totalScore = student.stats?.totalScore ?? 0;
        return {
          ...student,
          computedScore: totalScore,
        };
      })
      .sort((a, b) => b.computedScore - a.computedScore);

    // Format all users with rank
    const students = sortedStudents.map((student, index) => {
      const rank = index + 1;
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
          gfg: student.gfg,
          codechef: student.codechef,
        },
        stats: {
          leetcodeSolved: student.stats?.leetcodeSolved ?? 0,
          leetcodeRating: student.stats?.leetcodeRating ?? null,
          codeforcesRating: student.stats?.codeforcesRating ?? null,
          codeforcesMaxRating: student.stats?.codeforcesMaxRating ?? null,
          gfgScore: student.stats?.gfgScore ?? null,
          codechefRating: student.stats?.codechefRating ?? null,
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

    // Extract current authenticated user stats if logged in
    const currentUser = currentUserId
      ? students.find((s) => s.userId === currentUserId) || null
      : null;

    // Compute platform & department summary metrics
    const totalStudents = students.length;
    const totalProblemsSolved = students.reduce(
      (acc, s) => acc + s.stats.leetcodeSolved,
      0
    );
    const averageTotalScore = totalStudents
      ? Math.round(
          students.reduce((acc, s) => acc + s.stats.totalScore, 0) /
            totalStudents
        )
      : 0;

    // Group department stats
    const deptMap: Record<
      string,
      { count: number; totalScore: number; totalSolved: number }
    > = {};

    students.forEach((student) => {
      const dept = student.department || 'Unknown';
      if (!deptMap[dept]) {
        deptMap[dept] = { count: 0, totalScore: 0, totalSolved: 0 };
      }
      deptMap[dept].count += 1;
      deptMap[dept].totalScore += student.stats.totalScore;
      deptMap[dept].totalSolved += student.stats.leetcodeSolved;
    });

    const departmentStats = Object.entries(deptMap).map(([dept, data]) => ({
      department: dept,
      studentCount: data.count,
      averageScore: Math.round(data.totalScore / data.count),
      totalSolved: data.totalSolved,
    }));

    return NextResponse.json({
      success: true,
      currentUser,
      summary: {
        totalStudents,
        totalProblemsSolved,
        averageTotalScore,
        departmentStats,
        topPerformers: students.slice(0, 5),
      },
      students,
    });
  } catch (error: any) {
    console.error('[GET /api/dashboard Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
