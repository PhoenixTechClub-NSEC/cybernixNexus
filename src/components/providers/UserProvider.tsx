'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '@/types';

const INITIAL_EMPTY_USER: UserProfile = {
  id: '',
  name: 'Programmer',
  username: 'student',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  email: '',
  bio: 'NSEC Student Programmer',
  department: 'CSE',
  year: '3rd Year',
  collegeRank: 0,
  deptRank: 0,
  level: 1,
  tier: 'Spark',
  cpScore: 0,
  nextTierScore: 2000,
  currentStreak: 0,
  maxStreak: 0,
  contestWinRate: 0,
  solvedByDifficulty: { easy: 0, medium: 0, hard: 0, total: 0 },
  platforms: [],
  badges: [],
  dsaTopics: [],
  recentActivities: [],
};

interface UserContextType {
  user: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => void;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile>(INITIAL_EMPTY_USER);
  const [isHydrated, setIsHydrated] = useState(false);

  const fetchStudentProfile = async () => {
    try {
      const res = await fetch('/api/student');
      if (!res.ok) return;
      const data = await res.json();
      if (data.student) {
        const s = data.student;
        const dbImage = s.user?.image || data.user?.image;
        const totalScore = s.stats?.totalScore ?? 0;
        const lcSolved = s.stats?.leetcodeSolved ?? 0;
        const cfSolved = s.stats?.codeforcesSolved ?? 0;
        const totalSolved = lcSolved + cfSolved;

        const level = Math.max(1, Math.min(100, Math.floor(totalScore / 500)));
        const tier = totalScore > 30000 ? 'Phoenix' : totalScore > 10000 ? 'Flame' : totalScore > 2000 ? 'Ember' : 'Spark';

        setUser({
          id: s.id,
          name: s.name || s.user?.email?.split('@')[0] || 'NSEC Student',
          username: s.user?.email ? s.user.email.split('@')[0] : 'student',
          avatar: dbImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          email: s.user?.email || '',
          bio: `${s.department} '${String(s.graduationYear || 2026).slice(2)} @ NSEC`,
          department: s.department || 'CSE',
          year: `${2026 - ((s.graduationYear || 2026) - 4)}th Year`,
          collegeRank: s.stats?.ranking ?? 0,
          deptRank: s.stats?.departmentRanking ?? 0,
          level,
          tier,
          cpScore: totalScore,
          nextTierScore: 26500,
          currentStreak: totalSolved > 0 ? 1 : 0,
          maxStreak: totalSolved > 0 ? 1 : 0,
          contestWinRate: 0,
          solvedByDifficulty: {
            easy: Math.round(lcSolved * 0.4),
            medium: Math.round(lcSolved * 0.5),
            hard: Math.round(lcSolved * 0.1),
            total: totalSolved,
          },
          platforms: [
            { platform: 'LeetCode' as const, handle: s.leetcode || '', rating: s.stats?.leetcodeRating || 0, solvedCount: lcSolved, weight: 1.0 },
            {
              platform: 'Codeforces' as const,
              handle: s.codeforces || '',
              rating: s.stats?.codeforcesRating || 0,
              solvedCount: cfSolved,
              weight: 1.2,
              profileUrl: s.codeforces ? `https://codeforces.com/profile/${s.codeforces}` : undefined,
              ...(s.stats?.codeforcesRank ? { cfRank: s.stats.codeforcesRank } : {}),
              ...(s.stats?.codeforcesMaxRank ? { cfMaxRank: s.stats.codeforcesMaxRank } : {}),
              ...(s.stats?.codeforcesAvatar ? { cfAvatar: s.stats.codeforcesAvatar } : {}),
              ...(s.stats?.codeforcesContribution != null ? { cfContribution: s.stats.codeforcesContribution } : {}),
            },
            { platform: 'GFG' as const, handle: s.gfg || '', rating: s.stats?.gfgScore || 0, solvedCount: 0, weight: 0.8 },
            { platform: 'CodeChef' as const, handle: s.codechef || '', rating: s.stats?.codechefRating || 0, solvedCount: 0, weight: 1.0 },
          ],
          badges: [],
          dsaTopics: [],
          recentActivities: [],
        });
      } else if (data.user?.image || data.user?.name || data.user?.email) {
        setUser((prev) => ({
          ...prev,
          name: data.user.name || data.user.email?.split('@')[0] || 'NSEC Student',
          email: data.user.email || '',
          avatar: data.user.image || prev.avatar,
        }));
      }
    } catch (err) {
      console.error('Failed to fetch student profile', err);
    }
  };

  useEffect(() => {
    try {
      localStorage.removeItem('cybernix_user');
    } catch {
      // Ignore
    }
    setIsHydrated(true);
    fetchStudentProfile();
  }, []);

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  const refreshUser = async () => {
    await fetchStudentProfile();
  };

  if (!isHydrated) {
    return (
      <UserContext.Provider value={{ user: INITIAL_EMPTY_USER, updateUser, refreshUser }}>
        {children}
      </UserContext.Provider>
    );
  }

  return (
    <UserContext.Provider value={{ user, updateUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
