import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Cron job executed successfully',
    timestamp: new Date().toISOString(),
  });
}
