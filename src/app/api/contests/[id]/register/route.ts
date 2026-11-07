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
      username?: string;
      fullName?: string;
      studentIdNumber?: string;
      academicYear?: string;
      email?: string;
      phoneNumber?: string;
    };

    const username = (body.username || student.username || sessionUser.email?.split('@')[0] || '').trim().toLowerCase();
    const fullName = (body.fullName || student.name || sessionUser.name || '').trim();
    const studentIdNumber = (body.studentIdNumber || student.rollNumber || '').trim();
    const academicYear = (body.academicYear || `${student.graduationYear}` || '').trim();
    const email = (body.email || sessionUser.email || '').trim();
    const phoneNumber = (body.phoneNumber || '').trim();

    if (!username) {
      return NextResponse.json({ success: false, error: 'Username is required.' }, { status: 400 });
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

    // If username is specified and different, ensure it's not taken by another student
    if (username && username !== student.username) {
      const existingUser = await prisma.student.findUnique({
        where: { username },
      });
      if (existingUser && existingUser.id !== student.id) {
        return NextResponse.json(
          { success: false, error: `The username '@${username}' is already taken. Please choose another.` },
          { status: 400 }
        );
      }
      // Update student username
      await prisma.student.update({
        where: { id: student.id },
        data: { username },
      });
    }

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

