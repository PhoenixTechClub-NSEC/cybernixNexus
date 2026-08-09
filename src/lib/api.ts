import {
  UserProfile,
  Editorial,
  Contest,
  DepartmentStat,
  MonthlyAchievement,
} from '@/types';
import {
  LEADERBOARD_USERS,
  FAKE_EDITORIALS,
  FAKE_CONTESTS,
  DEPARTMENT_STATS,
  MONTHLY_ACHIEVEMENTS,
  CURRENT_USER,
} from './constants';

export async function getCurrentUser(): Promise<UserProfile> {
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
  return CURRENT_USER;
}

export async function getLeaderboard(): Promise<UserProfile[]> {
  try {
    const res = await fetch('/api/dashboard');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.students) && data.students.length > 0) {
        return data.students.map((s: any) => ({
          id: s.id,
          name: s.name || 'NSEC Programmer',
          username: s.email ? s.email.split('@')[0] : 'student',
          avatar: s.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          email: s.email || '',
          bio: `${s.department} '${String(s.graduationYear || 2026).slice(2)} @ NSEC`,
          department: s.department || 'CSE',
          year: `${2026 - (s.graduationYear - 4)}th Year`,
          collegeRank: s.rank || s.stats?.ranking || 1,
          deptRank: s.departmentRanking || s.stats?.departmentRanking || 1,
          level: Math.max(1, Math.min(100, Math.floor((s.stats?.totalScore || 0) / 500))),
          tier: (s.stats?.totalScore || 0) > 30000 ? 'Phoenix' : (s.stats?.totalScore || 0) > 10000 ? 'Flame' : (s.stats?.totalScore || 0) > 2000 ? 'Ember' : 'Spark',
          cpScore: s.stats?.totalScore || 0,
          nextTierScore: 26500,
          currentStreak: 14,
          maxStreak: 30,
          contestWinRate: 75,
          solvedByDifficulty: {
            easy: Math.round((s.stats?.leetcodeSolved || 0) * 0.4),
            medium: Math.round((s.stats?.leetcodeSolved || 0) * 0.5),
            hard: Math.round((s.stats?.leetcodeSolved || 0) * 0.1),
            total: s.stats?.leetcodeSolved || 0,
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
            {
              platform: 'GFG',
              handle: s.handles?.gfg || 'N/A',
              rating: s.stats?.gfgScore || 0,
              solvedCount: 0,
              weight: 1.0,
            },
          ],
          badges: [],
          dsaTopics: [],
          recentActivities: [],
        }));
      }
    }
  } catch (err) {
    console.error('Failed to fetch leaderboard from API', err);
  }
  return LEADERBOARD_USERS;
}

export async function getDepartmentStats(): Promise<DepartmentStat[]> {
  try {
    const res = await fetch('/api/dashboard');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.summary?.departmentStats) && data.summary.departmentStats.length > 0) {
        return data.summary.departmentStats.map((d: any, idx: number) => ({
          name: d.department,
          rank: idx + 1,
          averageRating: d.averageScore || 1500,
          totalSolved: d.totalSolved || 0,
          topCoderName: 'NSEC Student',
          topCoderScore: d.averageScore || 0,
          seasonalMultiplier: idx === 0 ? 2.0 : idx === 1 ? 1.75 : 1.5,
          activeStudentsCount: d.studentCount || 1,
        }));
      }
    }
  } catch (err) {
    console.error('Failed to fetch department stats from API', err);
  }
  return DEPARTMENT_STATS;
}

export async function getMonthlyAchievements(): Promise<MonthlyAchievement[]> {
  try {
    const res = await fetch('/api/achievements/monthly');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.achievements) && data.achievements.length > 0) {
        return data.achievements;
      }
    }
  } catch (err) {
    console.error('Failed to fetch monthly achievements from API', err);
  }
  return MONTHLY_ACHIEVEMENTS;
}

export async function getEditorials(): Promise<Editorial[]> {
  return FAKE_EDITORIALS;
}

export async function getContests(): Promise<Contest[]> {
  return FAKE_CONTESTS;
}
