import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { formatTimeAgo } from '@/lib/contest';

export const dynamic = 'force-dynamic';

function parseDurationMs(durationStr: string): number {
  const match = durationStr.match(/([\d.]+)\s*(hour|hr|minute|min|h|m)/i);
  if (!match) return 3 * 60 * 60 * 1000;
  const val = parseFloat(match[1]);
  const unit = match[2].toLowerCase();
  if (unit.startsWith('h')) return val * 60 * 60 * 1000;
  if (unit.startsWith('m')) return val * 60 * 1000;
  return 3 * 60 * 60 * 1000;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contestId } = await params;

    if (!contestId) {
      return NextResponse.json({ success: false, error: 'Contest ID is required' }, { status: 400 });
    }

    const contest = await prisma.contest.findUnique({
      where: { id: contestId },
      include: {
        registrations: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    image: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!contest) {
      return NextResponse.json({ success: false, error: 'Contest not found' }, { status: 404 });
    }

    // Determine requesting user's registration and profile
    const session = await getServerSession(authOptions);
    const sessionUser = session?.user as { id?: string; name?: string; email?: string } | undefined;
    let currentUserRegistration = null;
    let currentUserProfile = null;

    if (sessionUser?.id) {
      const student = await prisma.student.findUnique({
        where: { userId: sessionUser.id },
        select: { id: true, name: true, username: true, rollNumber: true, graduationYear: true },
      });

      if (student) {
        currentUserProfile = {
          username: student.username || (sessionUser.email ? sessionUser.email.split('@')[0] : ''),
          fullName: student.name || sessionUser.name || '',
          email: sessionUser.email || '',
          studentIdNumber: student.rollNumber && !student.rollNumber.startsWith('TEMP-') ? student.rollNumber : '',
          academicYear: student.graduationYear ? (
            student.graduationYear === 2029 ? '1st Year' :
            student.graduationYear === 2028 ? '2nd Year' :
            student.graduationYear === 2027 ? '3rd Year' :
            student.graduationYear === 2026 ? '4th Year' : '1st Year'
          ) : '1st Year',
        };

        const reg = contest.registrations.find((r) => r.studentId === student.id);
        if (reg) {
          currentUserRegistration = {
            participantId: reg.participantId,
            fullName: reg.fullName || student.name,
            studentIdNumber: reg.studentIdNumber || student.rollNumber,
            academicYear: reg.academicYear || `${student.graduationYear}`,
            email: reg.email || sessionUser.email,
            phoneNumber: reg.phoneNumber,
            createdAt: reg.createdAt,
          };
        }
      }
    }

    const maxParticipants = contest.maxParticipants ?? 50;
    const spotsLeft = Math.max(0, maxParticipants - contest.registeredCount);

    const now = new Date();
    const startTime = new Date(contest.startTime);
    const linkUnlockTime = new Date(startTime.getTime() - 60 * 60 * 1000); // 1 hour before
    const contestEndTime = new Date(startTime.getTime() + parseDurationMs(contest.duration));

    const isLinkUnlocked = now >= linkUnlockTime;
    const isEventStarted = now >= startTime;
    const isContestEnded = now >= contestEndTime;

    // Secure the external link: strictly provide it only to registered students within the 1-hour window before contest end
    const canViewArenaLink = Boolean(currentUserRegistration) && isLinkUnlocked && !isContestEnded;
    const authorizedUrl = canViewArenaLink ? contest.url : null;

    // Filter public registration data strictly to non-sensitive fields
    const registeredUsers = contest.displayRegisteredUsers
      ? contest.registrations.map((r) => ({
          username: r.student.username || r.student.name || 'Anonymous',
          fullName: r.fullName || r.student.name,
          image: r.student.user.image || null,
          registeredAgo: formatTimeAgo(r.createdAt),
          createdAt: r.createdAt,
        }))
      : [];

    return NextResponse.json({
      success: true,
      contest: {
        id: contest.id,
        title: contest.title,
        platform: contest.platform,
        startTime: contest.startTime,
        duration: contest.duration,
        registeredCount: contest.registeredCount,
        maxParticipants,
        spotsLeft,
        isInternal: contest.isInternal,
        hostedInternal: contest.hostedInternal,
        url: authorizedUrl,
        linkUnlockTime: linkUnlockTime.toISOString(),
        isLinkUnlocked,
        isEventStarted,
        isContestEnded,
        description: contest.description,
        badge: contest.badge,
        venue: contest.venue || 'APC Hall',
        prize: contest.prize || 'TBD',
        registrationDeadline: contest.registrationDeadline,
        isRegistrationClosed: Boolean(contest.registrationDeadline && now > new Date(contest.registrationDeadline)),
        displayRegisteredUsers: contest.displayRegisteredUsers,
        status: contest.status,
      },
      isRegistered: Boolean(currentUserRegistration),
      userRegistration: currentUserRegistration,
      currentUserProfile,
      registeredUsers,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to fetch contest';
    console.error('[GET /api/contests/[id] Error]:', error);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

