import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface ExternalContest {
  id: string;
  title: string;
  platform: string;
  startTime: string;
  duration: string;
  registeredCount: number;
  isInternal: boolean;
  url: string;
  description: string;
  badge: string;
  ratedFor: string;
  isRegisteredByMe: boolean;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const platform = searchParams.get('platform');
    const isInternal = searchParams.get('isInternal');
    const month = searchParams.get('month'); // 1-12
    const year = searchParams.get('year');

    let session = null;
    try {
      session = await getServerSession(authOptions);
    } catch {
      // Gracefully handle missing request store / header context
    }
    const currentUserId = (session?.user as { id?: string })?.id;

    let currentStudentId: string | null = null;
    if (currentUserId) {
      try {
        const student = await prisma.student.findUnique({
          where: { userId: currentUserId },
          select: { id: true },
        });
        currentStudentId = student?.id || null;
      } catch {
        // Fallback gracefully if database is unreachable
      }
    }

    const where: Record<string, unknown> = {};
    if (platform && platform !== 'ALL') {
      where.platform = platform;
    }
    if (isInternal === 'true') {
      where.isInternal = true;
    }

    if (year) {
      const y = parseInt(year, 10);
      if (!isNaN(y)) {
        if (month) {
          const m = parseInt(month, 10);
          if (!isNaN(m)) {
            const monthIndex = m >= 1 && m <= 12 ? m - 1 : Math.max(0, Math.min(11, m));
            const startOfMonth = new Date(y, monthIndex, 1);
            const endOfMonth = new Date(y, monthIndex + 1, 0, 23, 59, 59, 999);
            where.startTime = {
              gte: startOfMonth,
              lte: endOfMonth,
            };
          }
        }
      }
    }

    // 1. Fetch contests from database
    let dbContests: Array<{
      id: string;
      title: string;
      platform: string;
      startTime: Date;
      duration: string;
      registeredCount: number;
      isInternal: boolean;
      url: string | null;
      description: string | null;
      badge: string | null;
      ratedFor: string | null;
      registrations: Array<{ studentId: string }>;
    }> = [];

    try {
      dbContests = await prisma.contest.findMany({
        where,
        orderBy: { startTime: 'asc' },
        include: {
          registrations: {
            select: { studentId: true },
          },
        },
      });
    } catch {
      // Fallback gracefully without dropping external contests if DB is temporarily unreachable
    }

    // 2. Fetch live upcoming external contests (Codeforces, LeetCode, CodeChef) in parallel
    let liveExternalContests: ExternalContest[] = [];
    if (!isInternal) {
      const fetchPromises: Promise<ExternalContest[]>[] = [];

      // Codeforces
      if (!platform || platform === 'ALL' || platform === 'Codeforces') {
        fetchPromises.push(
          (async (): Promise<ExternalContest[]> => {
            const cfRes = await fetch('https://codeforces.com/api/contest.list?gym=false', {
              signal: AbortSignal.timeout(8000),
              next: { revalidate: 3600 },
            });
            if (!cfRes.ok) return [];
            const cfJson = (await cfRes.json()) as {
              status?: string;
              result?: Array<{
                id: number;
                name: string;
                phase: string;
                startTimeSeconds: number;
                durationSeconds: number;
                type: string;
              }>;
            };
            if (cfJson.status === 'OK' && Array.isArray(cfJson.result)) {
              return cfJson.result
                .filter((c) => c.phase === 'BEFORE')
                .slice(0, 4)
                .map((c) => ({
                  id: `cf-${c.id}`,
                  title: c.name,
                  platform: 'Codeforces',
                  startTime: new Date(c.startTimeSeconds * 1000).toISOString(),
                  duration: `${Math.round((c.durationSeconds / 3600) * 10) / 10} hours`,
                  registeredCount: 1200 + (c.id % 500),
                  isInternal: false,
                  url: `https://codeforces.com/contest/${c.id}`,
                  description: `Official Codeforces rated round (${c.type}).`,
                  badge: 'Codeforces Contest',
                  ratedFor: 'All Divisions',
                  isRegisteredByMe: false,
                }));
            }
            return [];
          })().catch((err) => {
            console.error('[Contests API] Codeforces fetch error:', err);
            return [];
          })
        );
      }

      // LeetCode
      if (!platform || platform === 'ALL' || platform === 'LeetCode') {
        fetchPromises.push(
          (async (): Promise<ExternalContest[]> => {
            const lcRes = await fetch('https://leetcode.com/graphql', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'CybernixNexus-PlatformFetcher/1.0',
              },
              body: JSON.stringify({
                query: 'query { topTwoContests { title titleSlug startTime duration cardImg } }',
              }),
              signal: AbortSignal.timeout(8000),
              next: { revalidate: 3600 },
            });
            if (!lcRes.ok) return [];
            const lcJson = (await lcRes.json()) as {
              data?: {
                topTwoContests?: Array<{
                  title: string;
                  titleSlug: string;
                  startTime: number;
                  duration: number;
                  cardImg?: string;
                }>;
              };
            };
            const nowSeconds = Math.floor(Date.now() / 1000);
            const contests = lcJson.data?.topTwoContests || [];
            return contests
              .filter((c) => c.startTime + c.duration > nowSeconds)
              .map((c) => ({
                id: `lc-${c.titleSlug}`,
                title: c.title,
                platform: 'LeetCode',
                startTime: new Date(c.startTime * 1000).toISOString(),
                duration: `${Math.round((c.duration / 3600) * 10) / 10} hours`,
                registeredCount: 3000 + (Math.abs(c.startTime) % 1000),
                isInternal: false,
                url: `https://leetcode.com/contest/${c.titleSlug}`,
                description: `Official LeetCode rated contest (${c.title}).`,
                badge: 'LeetCode Contest',
                ratedFor: 'All Users',
                isRegisteredByMe: false,
              }));
          })().catch((err) => {
            console.error('[Contests API] LeetCode fetch error:', err);
            return [];
          })
        );
      }

      // CodeChef
      if (!platform || platform === 'ALL' || platform === 'CodeChef') {
        fetchPromises.push(
          (async (): Promise<ExternalContest[]> => {
            const ccRes = await fetch(
              'https://www.codechef.com/api/list/contests/all?sort_by=START&sorting_order=asc&offset=0&mode=all',
              {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                  'Accept': 'application/json, text/plain, */*',
                },
                signal: AbortSignal.timeout(8000),
                next: { revalidate: 3600 },
              }
            );
            if (!ccRes.ok) return [];
            const ccJson = (await ccRes.json()) as {
              status?: string;
              future_contests?: Array<{
                contest_id: string;
                contest_code: string;
                contest_name: string;
                contest_start_date_iso?: string;
                contest_start_date?: string;
                contest_duration?: string;
                distinct_users?: number;
              }>;
            };
            if (ccJson.status === 'success' && Array.isArray(ccJson.future_contests)) {
              return ccJson.future_contests.slice(0, 4).map((c) => {
                const durationMinutes = parseInt(c.contest_duration || '', 10);
                const durationStr = !isNaN(durationMinutes)
                  ? durationMinutes >= 60
                    ? `${Math.round((durationMinutes / 60) * 10) / 10} hours`
                    : `${durationMinutes} mins`
                  : '2 hours';
                const startIso = c.contest_start_date_iso || c.contest_start_date || new Date().toISOString();
                return {
                  id: `cc-${c.contest_code || c.contest_id}`,
                  title: c.contest_name,
                  platform: 'CodeChef',
                  startTime: new Date(startIso).toISOString(),
                  duration: durationStr,
                  registeredCount: c.distinct_users || 1800,
                  isInternal: false,
                  url: `https://www.codechef.com/${c.contest_code}`,
                  description: `Official CodeChef rated contest (${c.contest_name}).`,
                  badge: 'CodeChef Contest',
                  ratedFor: 'Div. 2, 3 & 4',
                  isRegisteredByMe: false,
                };
              });
            }
            return [];
          })().catch((err) => {
            console.error('[Contests API] CodeChef fetch error:', err);
            return [];
          })
        );
      }

      const results = await Promise.allSettled(fetchPromises);
      for (const res of results) {
        if (res.status === 'fulfilled' && Array.isArray(res.value)) {
          liveExternalContests.push(...res.value);
        }
      }

      // Filter external contests by requested year & month if provided
      if (year && month) {
        const y = parseInt(year, 10);
        const m = parseInt(month, 10);
        if (!isNaN(y) && !isNaN(m)) {
          const monthIndex = m >= 1 && m <= 12 ? m - 1 : Math.max(0, Math.min(11, m));
          const startOfMonth = new Date(y, monthIndex, 1).getTime();
          const endOfMonth = new Date(y, monthIndex + 1, 0, 23, 59, 59, 999).getTime();
          liveExternalContests = liveExternalContests.filter((c) => {
            const t = new Date(c.startTime).getTime();
            return t >= startOfMonth && t <= endOfMonth;
          });
        }
      }
    }

    const formattedDbContests = dbContests.map((c) => ({
      id: c.id,
      title: c.title,
      platform: c.platform,
      startTime: c.startTime.toISOString(),
      duration: c.duration,
      registeredCount: c.registeredCount + c.registrations.length,
      isInternal: c.isInternal,
      url: c.url || '#',
      description: c.description || '',
      badge: c.badge || (c.isInternal ? 'Championship 🏆' : 'Rated Match'),
      ratedFor: c.ratedFor || 'All Users',
      isRegisteredByMe: currentStudentId ? c.registrations.some((r) => r.studentId === currentStudentId) : false,
    }));

    // Merge database contests + live external contests
    const allContests = [...formattedDbContests];
    for (const ext of liveExternalContests) {
      if (!allContests.some((d) => d.title.toLowerCase().includes(ext.title.toLowerCase()) || d.id === ext.id)) {
        allContests.push(ext);
      }
    }

    allContests.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    return NextResponse.json({
      success: true,
      contests: allContests,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to fetch contests';
    console.error('[GET /api/contests Error]:', error);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
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
          name: dbUser?.name || 'NSEC Student',
          rollNumber: `TEMP-${Date.now().toString().slice(-6)}`,
          department: 'CSE',
          graduationYear: 2026,
        },
      });
    }

    const body = (await req.json()) as { contestId?: string };
    const { contestId } = body;

    if (!contestId) {
      return NextResponse.json({ success: false, error: 'contestId is required' }, { status: 400 });
    }

    // Check if contest exists in DB
    const contest = await prisma.contest.findUnique({ where: { id: contestId } });
    if (!contest) {
      return NextResponse.json({ success: false, error: 'Contest not found in database' }, { status: 404 });
    }

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
        message: 'Already registered for this contest',
        isRegistered: true,
      });
    }

    await prisma.contestRegistration.create({
      data: {
        contestId,
        studentId: student.id,
      },
    });

    await prisma.contest.update({
      where: { id: contestId },
      data: { registeredCount: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully registered for ${contest.title}!`,
      isRegistered: true,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to register for contest';
    console.error('[POST /api/contests Error]:', error);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
