import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { syncStudentStats } from '@/services/platforms';

interface SignupRequestBody {
  name?: string;
  email?: string;
  password?: string;
  image?: string | null;
  rollNumber?: string;
  department?: string;
  graduationYear?: number | string;
  leetcode?: string | null;
  codeforces?: string | null;
  gfg?: string | null;
  codechef?: string | null;
  github?: string | null;
  linkedin?: string | null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SignupRequestBody;
    const {
      name,
      email,
      password,
      image,
      rollNumber,
      department,
      graduationYear,
      leetcode,
      codeforces,
      gfg,
      codechef,
      github,
      linkedin,
    } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Name, email, and password are required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user account with this email already exists.' },
        { status: 409 }
      );
    }

    // Check roll number uniqueness if provided
    const trimmedRoll = rollNumber?.trim();
    if (trimmedRoll) {
      const existingRoll = await prisma.student.findUnique({
        where: { rollNumber: trimmedRoll },
      });
      if (existingRoll) {
        return NextResponse.json(
          { error: 'A student profile with this roll number already exists.' },
          { status: 409 }
        );
      }
    }

    // Hash password with SHA-256
    const hashedPassword = hashPassword(password);

    // Create User account
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        image: typeof image === 'string' && image.trim() ? image.trim() : null,
      },
    });

    // Create student profile if rollNumber & department are provided
    let student = null;
    if (trimmedRoll && department && graduationYear) {
      const parsedGradYear = Number(graduationYear);
      student = await prisma.student.create({
        data: {
          userId: newUser.id,
          name: name.trim(),
          rollNumber: trimmedRoll,
          department: department.trim(),
          graduationYear: isNaN(parsedGradYear) ? 2026 : parsedGradYear,
          leetcode: typeof leetcode === 'string' && leetcode.trim() ? leetcode.trim() : null,
          codeforces: typeof codeforces === 'string' && codeforces.trim() ? codeforces.trim() : null,
          gfg: typeof gfg === 'string' && gfg.trim() ? gfg.trim() : null,
          codechef: typeof codechef === 'string' && codechef.trim() ? codechef.trim() : null,
          github: typeof github === 'string' && github.trim() ? github.trim() : null,
          linkedin: typeof linkedin === 'string' && linkedin.trim() ? linkedin.trim() : null,
          profileComplete: true,
        },
      });

      // Trigger initial stats sync asynchronously without blocking
      try {
        await syncStudentStats(student.id);
      } catch (syncErr: unknown) {
        const msg = syncErr instanceof Error ? syncErr.message : 'Unknown sync error';
        console.warn(`[Signup] Platform sync warning for student ${student.id}:`, msg);
      }
    }

    return NextResponse.json(
      {
        message: 'Account created successfully',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
        hasStudentProfile: Boolean(student),
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to create user account';
    console.error('[POST /api/auth/signup Error]:', error);
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}
