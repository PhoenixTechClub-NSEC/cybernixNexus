import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Email and password registration is disabled. Please sign in with Google.' },
    { status: 400 }
  );
}
