import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { syncStudentStats } from '@/services/platforms';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionUser = session.user as { id?: string; email?: string };
    const userId = sessionUser.id;

    if (!userId && !sessionUser.email) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    let student = userId
      ? await prisma.student.findUnique({
          where: { userId },
          include: {
            stats: true,
            user: {
              select: { email: true, image: true, name: true },
            },
            syncJobs: {
              take: 5,
              orderBy: { createdAt: 'desc' },
            },
            editorials: {
              take: 5,
              orderBy: { createdAt: 'desc' },
              select: { id: true, title: true, platform: true, createdAt: true },
            },
            dailySnapshots: {
              take: 10,
              orderBy: { date: 'desc' },
              where: { totalScore: { gt: 0 } },
            },
          },
        })
      : null;

    if (!student && sessionUser.email) {
      student = await prisma.student.findFirst({
        where: { user: { email: sessionUser.email } },
        include: {
          stats: true,
          user: {
            select: { email: true, image: true, name: true },
          },
          syncJobs: {
            take: 5,
            orderBy: { createdAt: 'desc' },
          },
          editorials: {
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, title: true, platform: true, createdAt: true },
          },
          dailySnapshots: {
            take: 10,
            orderBy: { date: 'desc' },
            where: { totalScore: { gt: 0 } },
          },
        },
      });
    }

    if (!student) {
      let dbUser = userId
        ? await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, image: true, name: true },
          })
        : null;

      if (!dbUser && sessionUser.email) {
        dbUser = await prisma.user.findUnique({
          where: { email: sessionUser.email },
          select: { email: true, image: true, name: true },
        });
      }

      return NextResponse.json({ student: null, user: dbUser }, { status: 200 });
    }

    // Auto-sync in background if student has platform handles configured but no stats or stale stats
    const shouldAutoSync = Boolean(
      (student.codechef && student.stats?.codechefRating == null && (student.stats?.codechefFailCount || 0) < 2) ||
      (student.leetcode && student.stats?.leetcodeSolved === 0 && !student.stats?.leetcodeRating)
    );
    if (shouldAutoSync) {
      syncStudentStats(student.id).catch((err) => {
        console.warn(`[Auto-sync background] Student ${student.id} sync warning:`, err);
      });
    }

    // Dynamically evaluate badges based on verified achievements
    const badges = [];
    const stats = student.stats;
    const totalScore = stats?.totalScore || 0;
    const totalSolved = (stats?.leetcodeSolved || 0) + (stats?.codeforcesSolved || 0) + (stats?.codechefSolved || 0);

    badges.push({
      id: 'badge-spark',
      title: 'Spark Initiate',
      description: 'Joined Cybernix Nexus and connected coding profile.',
      icon: '✨',
      category: 'tier' as const,
      unlockedAt: student.createdAt.toISOString().split('T')[0],
    });

    if (totalScore >= 2000) {
      badges.push({
        id: 'badge-ember',
        title: 'Ember Hatchling',
        description: 'Crossed 2,000+ points and unlocked Ember Tier.',
        icon: '🔥',
        category: 'tier' as const,
      });
    }

    if (totalScore >= 10000) {
      badges.push({
        id: 'badge-flame',
        title: 'Flame Warrior',
        description: 'Earned 10,000+ points across synced algorithmic platforms.',
        icon: '⚡',
        category: 'tier' as const,
      });
    }

    if (totalScore >= 30000) {
      badges.push({
        id: 'badge-phoenix',
        title: 'Inferno Phoenix',
        description: 'Ascended to Level 51+ with 30,000+ points.',
        icon: '🏆',
        category: 'tier' as const,
      });
    }

    if (totalSolved >= 100) {
      badges.push({
        id: 'badge-century',
        title: 'Century Solver',
        description: 'Solved 100+ algorithmic problems.',
        icon: '🎯',
        category: 'streak' as const,
      });
    }

    if (stats?.codeforcesRating && stats.codeforcesRating >= 1400) {
      badges.push({
        id: 'badge-cf-specialist',
        title: 'Codeforces Specialist',
        description: 'Attained cyan rank rating on Codeforces.',
        icon: '💎',
        category: 'contest' as const,
      });
    }

    if (student.editorials.length > 0) {
      badges.push({
        id: 'badge-author',
        title: 'Community Scholar',
        description: 'Published algorithmic solution write-ups for peers.',
        icon: '📖',
        category: 'contribution' as const,
      });
    }

    // Dynamic recent activities from actual snapshots and published editorials
    // Filter activities: only include snapshots where actual problems were solved, plus all editorials
    const allActivities = [
      ...student.dailySnapshots
        .filter((snap) => {
          // Only include snapshots where at least 1 problem was solved
          const problemsSolved = (snap.leetcodeSolved || 0) + (snap.codeforcesSolved || 0) + (snap.codechefSolved || 0);
          return problemsSolved > 0;
        })
        .map((snap) => ({
          id: `snap-${snap.id}`,
          title: `Solved ${(snap.leetcodeSolved || 0) + (snap.codeforcesSolved || 0) + (snap.codechefSolved || 0)} problem(s) across platforms`,
          type: 'solve' as const,
          platform: (snap.codeforcesSolved > 0 ? 'Codeforces' : 'LeetCode') as any,
          timestamp: snap.date.toISOString().split('T')[0],
          pointsEarned: snap.totalScore,
        })),
      ...student.editorials.map((ed) => ({
        id: `ed-${ed.id}`,
        title: `Published Tutorial: "${ed.title}"`,
        type: 'level_up' as const,
        platform: ed.platform as any,
        timestamp: ed.createdAt.toISOString().split('T')[0],
        pointsEarned: 50,
      })),
    ];

    // Sort by timestamp and remove duplicates (by title + timestamp combination)
    const recentActivities = allActivities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .reduce((unique: typeof allActivities, activity) => {
        // Check if this activity already exists
        const isDuplicate = unique.some(
          (item) => item.title === activity.title && item.timestamp === activity.timestamp
        );
        if (!isDuplicate) {
          unique.push(activity);
        }
        return unique;
      }, [])
      .slice(0, 8);

    return NextResponse.json({
      student: {
        ...student,
        badges,
        recentActivities,
      },
      user: student.user,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Internal server error';
    console.error('[GET /api/student Error]:', error);
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: 'Please sign in to complete your profile.' }, { status: 401 });
    }

    const sessionUser = session.user as { id?: string; email?: string; name?: string };
    const userId = sessionUser.id;

    if (!userId && !sessionUser.email) {
      return NextResponse.json({ message: 'Please sign in to complete your profile.' }, { status: 401 });
    }

    const body = await request.json();

    const {
      name,
      image,
      rollNumber,
      department,
      graduationYear,
      leetcode,
      codeforces,
      codechef,
      github,
      linkedin,
      username,
      bio,
    } = body;

    if (!name || !rollNumber || !department || !graduationYear) {
      return NextResponse.json(
        { message: 'Please fill in all required fields.' },
        { status: 400 }
      );
    }

    // Check for duplicate roll number (excluding current user)
    const existingRollNumber = await prisma.student.findFirst({
      where: {
        rollNumber: rollNumber.trim(),
        userId: { not: userId },
      },
    });

    if (existingRollNumber) {
      return NextResponse.json(
        { message: 'This roll number is already in use. Please check and try again.' },
        { status: 400 }
      );
    }

    // Check for duplicate username (excluding current user)
    if (username && username.trim()) {
      const existingUsername = await prisma.student.findFirst({
        where: {
          username: username.trim().toLowerCase(),
          userId: { not: userId },
        },
      });

      if (existingUsername) {
        return NextResponse.json(
          { message: 'This username is already taken. Please choose a different one.' },
          { status: 400 }
        );
      }
    }

    // Resolve or recover the DB User record
    let dbUser = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
    if (!dbUser && sessionUser.email) {
      dbUser = await prisma.user.findUnique({ where: { email: sessionUser.email } });
    }

    // If user record is missing in DB (e.g. database push/reset occurred with active session), auto-create
    if (!dbUser && sessionUser.email) {
      dbUser = await prisma.user.create({
        data: {
          ...(userId ? { id: userId } : {}),
          email: sessionUser.email,
          name: name.trim() || sessionUser.name || 'Student',
          image: typeof image === 'string' && image.trim() ? image.trim() : null,
        },
      });
    }

    if (!dbUser) {
      return NextResponse.json({ message: 'Please sign in to complete your profile.' }, { status: 404 });
    }

    const effectiveUserId = dbUser.id;

    // Safely update user image or name if provided using updateMany (which never throws P2025 if 0 records match)
    const userUpdateData: { image?: string; name?: string } = {};
    if (typeof image === 'string' && image.trim()) {
      userUpdateData.image = image.trim();
    }
    if (name) {
      userUpdateData.name = name.trim();
    }
    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.updateMany({
        where: { id: effectiveUserId },
        data: userUpdateData,
      });
    }

    const parsedGradYear = Number(graduationYear);
    const validGradYear = isNaN(parsedGradYear) ? 2026 : parsedGradYear;

    // Check Codeforces verification if a new/different Codeforces handle is being submitted
    if (typeof codeforces === 'string' && codeforces.trim()) {
      const existingStudent = await prisma.student.findUnique({
        where: { userId: effectiveUserId },
        select: { codeforces: true },
      });
      const currentCf = existingStudent?.codeforces?.trim().toLowerCase();
      const targetCf = codeforces.trim().toLowerCase();

      if (currentCf !== targetCf) {
        const verifiedToken = await prisma.verificationToken.findFirst({
          where: {
            identifier: `cf-verified:${effectiveUserId}`,
            expires: { gt: new Date() },
          },
        });

        if (!verifiedToken || verifiedToken.token.toLowerCase() !== targetCf) {
          return NextResponse.json(
            { message: `Please verify your Codeforces handle ownership before saving.` },
            { status: 400 }
          );
        }

        // Consume verified token
        await prisma.verificationToken.deleteMany({
          where: { identifier: `cf-verified:${effectiveUserId}` },
        });
      }
    }

    const student = await prisma.student.upsert({
      where: { userId: effectiveUserId },
      create: {
        userId: effectiveUserId,
        name: name.trim(),
        rollNumber: rollNumber.trim(),
        department: department.trim(),
        graduationYear: validGradYear,
        leetcode: typeof leetcode === 'string' && leetcode.trim() ? leetcode.trim() : null,
        codeforces: typeof codeforces === 'string' && codeforces.trim() ? codeforces.trim() : null,
        codechef: typeof codechef === 'string' && codechef.trim() ? codechef.trim() : null,
        github: typeof github === 'string' && github.trim() ? github.trim() : null,
        linkedin: typeof linkedin === 'string' && linkedin.trim() ? linkedin.trim() : null,
        username: typeof username === 'string' && username.trim() ? username.trim().toLowerCase() : null,
        bio: typeof bio === 'string' && bio.trim() ? bio.trim() : null,
        profileComplete: true,
      },
      update: {
        name: name.trim(),
        rollNumber: rollNumber.trim(),
        department: department.trim(),
        graduationYear: validGradYear,
        leetcode: typeof leetcode === 'string' && leetcode.trim() ? leetcode.trim() : null,
        codeforces: typeof codeforces === 'string' && codeforces.trim() ? codeforces.trim() : null,
        codechef: typeof codechef === 'string' && codechef.trim() ? codechef.trim() : null,
        ...(typeof github === 'string' ? { github: github.trim() || null } : {}),
        ...(typeof linkedin === 'string' ? { linkedin: linkedin.trim() || null } : {}),
        ...(typeof username === 'string' ? { username: username.trim().toLowerCase() || null } : {}),
        ...(typeof bio === 'string' ? { bio: bio.trim() || null } : {}),
        profileComplete: true,
      },
    });

    // Automatically trigger stats sync asynchronously after profile save without blocking the response
    syncStudentStats(student.id).catch((syncError: unknown) => {
      console.warn(`[Student Save] Platform sync for student ${student.id}`);
    });

    return NextResponse.json({
      message: 'Profile setup complete! Redirecting to dashboard.',
      student,
      stats: null,
    });
  } catch (error: unknown) {
    console.error('[POST /api/student Error]:', error);
    return NextResponse.json(
      { message: 'Unable to save your profile. Please try again.' },
      { status: 500 }
    );
  }
}
