import {
  UserProfile,
  Editorial,
  Contest,
  DepartmentStat,
  MonthlyAchievement,
} from '@/types';

export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const res = await fetch('/api/dashboard');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.currentUser) {
        return data.currentUser;
      }
    }
  } catch (err) {
    console.error('Failed to fetch current user from API', err);
  }
  return null;
}

export async function getLeaderboard(limit: number = 30): Promise<UserProfile[]> {
  try {
    const res = await fetch(`/api/dashboard?limit=${limit}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.students)) {
        return data.students.map((s: any) => {
          const gradYear = s.graduationYear || 2026;
          const currentYear = new Date().getFullYear();
          const calculatedYear = Math.max(1, Math.min(4, 4 - (gradYear - currentYear)));
          const yearString = `${calculatedYear === 1 ? '1st' : calculatedYear === 2 ? '2nd' : calculatedYear === 3 ? '3rd' : '4th'} Year`;
          const totalScore = s.stats?.totalScore ?? 0;
          const lcSolved = s.stats?.leetcodeSolved ?? 0;
          const cfSolved = s.stats?.codeforcesSolved ?? 0;
          const totalSolved = lcSolved + cfSolved;
          const lcEasy = s.stats?.leetcodeEasySolved ?? Math.round(lcSolved * 0.4);
          const lcMedium = s.stats?.leetcodeMediumSolved ?? Math.round(lcSolved * 0.5);
          const lcHard = s.stats?.leetcodeHardSolved ?? Math.round(lcSolved * 0.1);
          const nextTierScore = totalScore < 2000 ? 2000 : totalScore < 10000 ? 10000 : totalScore < 30000 ? 30000 : 55500;

          return {
            id: s.id,
            name: s.name || 'NSEC Programmer',
            username: s.email ? s.email.split('@')[0] : 'student',
            avatar: s.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            email: s.email || '',
            bio: `${s.department} '${String(gradYear).slice(2)} @ NSEC`,
            department: s.department || 'CSE',
            year: yearString,
            collegeRank: s.rank || s.stats?.ranking || 1,
            deptRank: s.departmentRanking || s.stats?.departmentRanking || 1,
            level: Math.max(1, Math.min(100, Math.floor(totalScore / 500))),
            tier: totalScore > 30000 ? 'Phoenix' : totalScore > 10000 ? 'Flame' : totalScore > 2000 ? 'Ember' : 'Spark',
            cpScore: totalScore,
            nextTierScore,
            currentStreak: totalSolved > 0 ? 1 : 0,
            maxStreak: totalSolved > 0 ? 1 : 0,
            contestWinRate: 0,
            solvedByDifficulty: {
              easy: lcEasy,
              medium: lcMedium,
              hard: lcHard,
              total: totalSolved,
            },
            platforms: [
              {
                platform: 'Codeforces',
                handle: s.handles?.codeforces || 'N/A',
                rating: s.stats?.codeforcesRating || 0,
                solvedCount: s.stats?.codeforcesSolved || 0,
                weight: 1.75,
              },
              {
                platform: 'LeetCode',
                handle: s.handles?.leetcode || 'N/A',
                rating: s.stats?.leetcodeRating || 0,
                solvedCount: s.stats?.leetcodeSolved || 0,
                weight: 1.5,
              },
              {
                platform: 'CodeChef',
                handle: s.handles?.codechef || 'N/A',
                rating: s.stats?.codechefRating || 0,
                solvedCount: 0,
                weight: 1.25,
              },
            ],
            badges: [],
            dsaTopics: [],
            recentActivities: [],
          };
        });
      }
    }
  } catch (err) {
    console.error('Failed to fetch leaderboard from API', err);
  }
  return [];
}

export async function getDepartmentStats(): Promise<DepartmentStat[]> {
  try {
    const res = await fetch('/api/dashboard');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.summary?.departmentStats)) {
        return data.summary.departmentStats.map((d: any, idx: number) => ({
          name: d.department,
          rank: idx + 1,
          averageRating: d.averageScore || 0,
          totalSolved: d.totalSolved || 0,
          topCoderName: d.topCoderName || 'NSEC Student',
          topCoderScore: d.topCoderScore || 0,
          seasonalMultiplier: d.seasonalMultiplier || (idx === 0 ? 2.0 : idx === 1 ? 1.75 : 1.5),
          activeStudentsCount: d.studentCount || 0,
        }));
      }
    }
  } catch (err) {
    console.error('Failed to fetch department stats from API', err);
  }
  return [];
}

export async function getMonthlyAchievements(): Promise<MonthlyAchievement[]> {
  try {
    const res = await fetch('/api/achievements/monthly');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.achievements)) {
        return data.achievements;
      }
    }
  } catch (err) {
    console.error('Failed to fetch monthly achievements from API', err);
  }
  return [];
}

export async function getEditorials(): Promise<Editorial[]> {
  try {
    const res = await fetch('/api/editorials');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.editorials)) {
        return data.editorials;
      }
    }
  } catch (err) {
    console.error('Failed to fetch editorials from API', err);
  }
  return [];
}

export async function getContests(): Promise<Contest[]> {
  try {
    const res = await fetch('/api/contests');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.contests)) {
        return data.contests;
      }
    }
  } catch (err) {
    console.error('Failed to fetch contests from API', err);
  }
  return [];
}

