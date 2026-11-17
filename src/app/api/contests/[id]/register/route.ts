import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateParticipantId } from '@/lib/contest';

export const dynamic = 'force-dynamic';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Authentication required to register for this contest.' }, { status: 401 });
    }

    const { id: contestId } = await params;
    if (!contestId) {
      return NextResponse.json({ success: false, error: 'Contest ID is required' }, { status: 400 });
    }

    const sessionUser = session.user as { id?: string; name?: string; email?: string };
    const userId = sessionUser.id;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Invalid session payload' }, { status: 401 });
    }

    let student = await prisma.student.findUnique({ where: { userId } });
    if (!student) {
      const dbUser = await prisma.user.findUnique({ where: { id: userId } });
      student = await prisma.student.create({
        data: {
          userId,
          name: dbUser?.name || sessionUser.name || 'NSEC Student',
          rollNumber: `TEMP-${Date.now().toString().slice(-6)}`,
          department: 'CSE',
          graduationYear: 2026,
        },
      });
    }

    const body = (await req.json()) as {
      fullName?: string;
      studentIdNumber?: string;
      academicYear?: string;
      email?: string;
      phoneNumber?: string;
      hackerrank?: string;
    };

    const username = (student.username || sessionUser.email?.split('@')[0] || '').trim().toLowerCase();
    const fullName = (body.fullName || student.name || sessionUser.name || '').trim();
    const studentIdNumber = (body.studentIdNumber || (student.rollNumber && !student.rollNumber.startsWith('TEMP-') ? student.rollNumber : '') || '').trim();
    const academicYear = (body.academicYear || '').trim();
    const email = (body.email || sessionUser.email || '').trim();
    const phoneNumber = (body.phoneNumber || '').trim();
    const hackerrank = (body.hackerrank || student.hackerrank || '').trim();

    if (!username) {
      return NextResponse.json({ success: false, error: 'Username is not set for your profile. Please update your profile username first.' }, { status: 400 });
    }
    if (!fullName) {
      return NextResponse.json({ success: false, error: 'Full name is required.' }, { status: 400 });
    }
    if (!studentIdNumber) {
      return NextResponse.json({ success: false, error: 'Student ID / College Roll Number is required.' }, { status: 400 });
    }
    if (!academicYear) {
      return NextResponse.json({ success: false, error: 'Academic Year is required.' }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ success: false, error: 'Email address is required.' }, { status: 400 });
    }
    if (!phoneNumber) {
      return NextResponse.json({ success: false, error: 'Phone number is required.' }, { status: 400 });
    }
    if (!hackerrank) {
      return NextResponse.json({ success: false, error: 'HackerRank Username is required.' }, { status: 400 });
    }

    // Check duplicate studentIdNumber across other students in Student table
    const duplicateRoll = await prisma.student.findFirst({
      where: {
        rollNumber: studentIdNumber,
        id: { not: student.id },
      },
    });
    if (duplicateRoll) {
      return NextResponse.json(
        { success: false, error: 'This Student ID / Roll Number is already registered with another account.' },
        { status: 400 }
      );
    }

    // Check duplicate HackerRank username across other students in Student table
    const duplicateHrStudent = await prisma.student.findFirst({
      where: {
        hackerrank: { equals: hackerrank, mode: 'insensitive' },
        id: { not: student.id },
      },
    });
    if (duplicateHrStudent) {
      return NextResponse.json(
        { success: false, error: `The HackerRank username "${hackerrank}" is already linked to another student account.` },
        { status: 400 }
      );
    }

    // Check duplicate HackerRank in this contest's registrations
    const duplicateHrContest = await prisma.contestRegistration.findFirst({
      where: {
        contestId,
        hackerrank: { equals: hackerrank, mode: 'insensitive' },
        studentId: { not: student.id },
      },
    });
    if (duplicateHrContest) {
      return NextResponse.json(
        { success: false, error: `The HackerRank username "${hackerrank}" is already used for this contest.` },
        { status: 400 }
      );
    }

    // Parse graduation year from academicYear if possible to sync with Student profile
    let gradYearUpdate: number | undefined;
    if (academicYear.includes('1st')) gradYearUpdate = 2029;
    else if (academicYear.includes('2nd')) gradYearUpdate = 2028;
    else if (academicYear.includes('3rd')) gradYearUpdate = 2027;
    else if (academicYear.includes('4th')) gradYearUpdate = 2026;

    // Sync fields back to Student profile so they cannot put duplicate things later
    await prisma.student.update({
      where: { id: student.id },
      data: {
        name: fullName,
        rollNumber: studentIdNumber,
        hackerrank,
        ...(gradYearUpdate ? { graduationYear: gradYearUpdate } : {}),
      },
    });

    // Check if contest exists
    const contest = await prisma.contest.findUnique({ where: { id: contestId } });
    if (!contest) {
      return NextResponse.json({ success: false, error: 'Contest not found.' }, { status: 404 });
    }

    // Check automatic registration deadline
    if (contest.registrationDeadline && new Date() > new Date(contest.registrationDeadline)) {
      return NextResponse.json(
        {
          success: false,
          error: `Registrations closed on ${new Date(contest.registrationDeadline).toLocaleString()}. Please contact an administrator or event coordinator.`,
        },
        { status: 400 }
      );
    }

    const maxParticipants = contest.maxParticipants ?? 50;

    // Check if user is already registered
    const existingReg = await prisma.contestRegistration.findUnique({
      where: {
        contestId_studentId: {
          contestId,
          studentId: student.id,
        },
      },
    });

    if (existingReg) {
      return NextResponse.json({
        success: true,
        message: 'You are already registered for this contest!',
        isRegistered: true,
        participantId: existingReg.participantId,
      });
    }

    // Check capacity
    if (contest.registeredCount >= maxParticipants) {
      return NextResponse.json(
        {
          success: false,
          error: `Contest registration is full! All ${maxParticipants} spots have been filled.`,
        },
        { status: 400 }
      );
    }

    // Generate unique 12-char participant ID (4-4-4 format)
    let participantId = generateParticipantId();
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      const collision = await prisma.contestRegistration.findUnique({
        where: { participantId },
      });
      if (!collision) {
        isUnique = true;
      } else {
        participantId = generateParticipantId();
        attempts++;
      }
    }

    // Create registration record
    const registration = await prisma.contestRegistration.create({
      data: {
        contestId,
        studentId: student.id,
        participantId,
        fullName,
        studentIdNumber,
        academicYear,
        email,
        phoneNumber,
        hackerrank,
      },
    });

    // Increment registered count
    await prisma.contest.update({
      where: { id: contestId },
      data: { registeredCount: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully registered for ${contest.title}!`,
      participantId: registration.participantId,
      isRegistered: true,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Registration failed';
    console.error('[POST /api/contests/[id]/register Error]:', error);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

