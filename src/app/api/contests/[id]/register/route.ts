import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateParticipantId, withContestRegistration } from '@/lib/contest';

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

    const body = (await req.json().catch(() => null)) as {
      fullName?: string;
      studentIdNumber?: string;
      academicYear?: string;
      email?: string;
      phoneNumber?: string;
      hackerrank?: string;
    } | null;

    if (!body || typeof body !== 'object' || Array.isArray(body) ||
        Object.values(body).some((value) => typeof value !== 'string')) {
      return NextResponse.json({ success: false, error: 'Invalid registration details.' }, { status: 400 });
    }

    return await withContestRegistration(contestId, async (tx) => {
      // Check if contest exists
      const contest = await tx.contest.findUnique({ where: { id: contestId }, include: { _count: { select: { registrations: true } } } });
      if (!contest) {
        return NextResponse.json({ success: false, error: 'Contest not found.' }, { status: 404 });
      }

      let student = await tx.student.findUnique({ where: { userId } });
      // Check if user is already registered
      const existingReg = student && await tx.contestRegistration.findUnique({
        where: {
          contestId_studentId: {
            contestId,
            studentId: student.id,
          },
        },
      });

      if (existingReg?.participantId) {
        return NextResponse.json({
          success: true,
          message: 'You are already registered for this contest!',
          isRegistered: true,
          participantId: existingReg.participantId,
        });
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

      // Check capacity
      if (!existingReg && Math.max(contest.registeredCount, contest._count.registrations) >= maxParticipants) {
        return NextResponse.json(
          {
            success: false,
            error: `Contest registration is full! All ${maxParticipants} spots have been filled.`,
          },
          { status: 400 }
        );
      }

      const username = (student?.username || sessionUser.email?.split('@')[0] || '').trim().toLowerCase();
      const fullName = (body.fullName || student?.name || sessionUser.name || '').trim();
      const studentIdNumber = (body.studentIdNumber || (student?.rollNumber && !student.rollNumber.startsWith('TEMP-') ? student.rollNumber : '') || '').trim();
      const academicYear = (body.academicYear || '').trim();
      const email = (body.email || sessionUser.email || '').trim();
      const phoneNumber = (body.phoneNumber || '').trim();
      const hackerrank = (body.hackerrank || student?.hackerrank || '').trim();

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
      const duplicateRoll = await tx.student.findFirst({
        where: {
          rollNumber: studentIdNumber,
          ...(student ? { id: { not: student.id } } : {}),
        },
      });
      if (duplicateRoll) {
        return NextResponse.json(
          { success: false, error: 'This Student ID / Roll Number is already registered with another account.' },
          { status: 400 }
        );
      }

      // Check duplicate HackerRank username across other students in Student table
      const duplicateHrStudent = await tx.student.findFirst({
        where: {
          hackerrank: { equals: hackerrank, mode: 'insensitive' },
          ...(student ? { id: { not: student.id } } : {}),
        },
      });
      if (duplicateHrStudent) {
        return NextResponse.json(
          { success: false, error: `The HackerRank username "${hackerrank}" is already linked to another student account.` },
          { status: 400 }
        );
      }

      // Check duplicate HackerRank in this contest's registrations
      const duplicateHrContest = await tx.contestRegistration.findFirst({
        where: {
          contestId,
          hackerrank: { equals: hackerrank, mode: 'insensitive' },
          ...(student ? { studentId: { not: student.id } } : {}),
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

      // Generate unique 12-char participant ID (4-4-4 format)
      let participantId = generateParticipantId();
      let isUnique = false;
      let attempts = 0;

      while (!isUnique && attempts < 10) {
        const collision = await tx.contestRegistration.findUnique({
          where: { participantId },
        });
        if (!collision) {
          isUnique = true;
        } else {
          participantId = generateParticipantId();
          attempts++;
        }
      }

      if (!isUnique) {
        throw new Error('Could not allocate a participant ID. Please try again.');
      }

      if (!student) {
        const dbUser = await tx.user.findUnique({ where: { id: userId } });
        student = await tx.student.upsert({
          where: { userId },
          update: {},
          create: {
            userId,
            name: dbUser?.name || sessionUser.name || 'NSEC Student',
            rollNumber: `TEMP-${userId}`,
            department: 'CSE',
            graduationYear: 2026,
          },
        });
      }

      // Sync fields back to Student profile so they cannot put duplicate things later
      await tx.student.update({
        where: { id: student.id },
        data: {
          name: fullName,
          rollNumber: studentIdNumber,
          hackerrank,
          ...(gradYearUpdate ? { graduationYear: gradYearUpdate } : {}),
        },
      });

      const details = { participantId, fullName, studentIdNumber, academicYear, email, phoneNumber, hackerrank };
      if (existingReg) {
        await tx.contestRegistration.update({ where: { id: existingReg.id }, data: details });
      } else {
        await tx.contestRegistration.create({ data: { contestId, studentId: student.id, ...details } });
        await tx.contest.update({
          where: { id: contestId },
          data: { registeredCount: { increment: 1 } },
        });
      }

      return NextResponse.json({
        success: true,
        message: `Successfully registered for ${contest.title}!`,
        participantId,
        isRegistered: true,
      });
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Registration failed';
    console.error('[POST /api/contests/[id]/register Error]:', error);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

