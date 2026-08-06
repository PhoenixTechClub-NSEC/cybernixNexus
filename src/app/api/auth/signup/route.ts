import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { syncStudentStats } from '@/services/platforms';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      password,
      rollNumber,
      department,
      graduationYear,
      leetcode,
      codeforces,
      gfg,
      codechef,
    } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const newUser = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
      },
    });

    // Create student profile if rollNumber & department are provided
    let student = null;
    if (rollNumber && department && graduationYear) {
      student = await prisma.student.create({
        data: {
          userId: newUser.id,
          name,
          rollNumber: rollNumber.trim(),
          department: department.trim(),
          graduationYear: Number(graduationYear),
          leetcode: leetcode?.trim() || null,
          codeforces: codeforces?.trim() || null,
          gfg: gfg?.trim() || null,
          codechef: codechef?.trim() || null,
          profileComplete: true,
        },
      });

      // Trigger initial stats sync asynchronously
      try {
        await syncStudentStats(student.id);
      } catch (syncErr: any) {
        console.warn(`[Signup] Platform sync warning for ${student.id}:`, syncErr.message);
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
        hasStudentProfile: !!student,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[POST /api/auth/signup Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create user account' },
      { status: 500 }
    );
  }
}
