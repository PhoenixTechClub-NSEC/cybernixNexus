'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { UserProfile, TierName } from '@/types';
import CapybaraLoader from '@/components/ui/CapybaraLoader';

const INITIAL_EMPTY_USER: UserProfile = {
  id: '',
  name: 'Programmer',
  username: 'student',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  email: '',
  bio: 'NSEC Student Programmer',
  department: 'CSE',
  year: '1st Year',
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
  logout: () => Promise<void>;
}

function getCodechefBadge(rating: number, stars?: string | null): string {
  if (!rating || rating === 0) return 'Unrated';
  let starStr = '1★';
  let div = 'Div 4';
  if (rating >= 2500) { starStr = '7★'; div = 'Div 1'; }
  else if (rating >= 2200) { starStr = '6★'; div = 'Div 1'; }
  else if (rating >= 2000) { starStr = '5★'; div = 'Div 1'; }
  else if (rating >= 1800) { starStr = '4★'; div = 'Div 2'; }
  else if (rating >= 1600) { starStr = '3★'; div = 'Div 2'; }
  else if (rating >= 1400) { starStr = '2★'; div = 'Div 3'; }
  else { starStr = '1★'; div = 'Div 4'; }

  const starDisplay = stars ? (stars.includes('★') ? stars : `${stars}★`) : starStr;
  return `${starDisplay} • ${div}`;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const [user, setUser] = useState<UserProfile>(INITIAL_EMPTY_USER);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const fetchStudentProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const res = await fetch('/api/student', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (data.student) {
        const s = data.student;
        const dbImage = s.user?.image || data.user?.image;
        const totalScore = s.stats?.totalScore ?? 0;
        const lcSolved = s.stats?.leetcodeSolved ?? 0;
        const cfSolved = s.stats?.codeforcesSolved ?? 0;
        const ccSolved = (s.stats as any)?.codechefSolved ?? 0;
        const totalSolved = lcSolved + cfSolved + ccSolved;

        const level = Math.max(1, Math.min(100, Math.floor(totalScore / 500)));
        const tier = (totalScore > 30000 ? 'Phoenix' : totalScore > 10000 ? 'Flame' : totalScore > 2000 ? 'Ember' : 'Spark') as TierName;

        let currentStreak = totalSolved > 0 ? 1 : 0;
        let maxStreak = totalSolved > 0 ? 1 : 0;

        try {
          const actRes = await fetch(`/api/student/activity?studentId=${s.id}`);
          if (actRes.ok) {
            const actData = await actRes.json();
            if (actData.success) {
              currentStreak = actData.currentStreak || currentStreak;
              maxStreak = actData.maxStreak || maxStreak;
            }
          }
        } catch {
          // Fallback gracefully
        }

        const gradYear = s.graduationYear || 2026;
        const currentYear = new Date().getFullYear();
        const calculatedYear = Math.max(1, Math.min(4, 5 - (gradYear - currentYear)));
        const yearString = `${calculatedYear === 1 ? '1st' : calculatedYear === 2 ? '2nd' : calculatedYear === 3 ? '3rd' : '4th'} Year`;

        const lcEasy = s.stats?.leetcodeEasySolved ?? Math.round(lcSolved * 0.4);
        const lcMedium = s.stats?.leetcodeMediumSolved ?? Math.round(lcSolved * 0.5);
        const lcHard = s.stats?.leetcodeHardSolved ?? Math.round(lcSolved * 0.1);

        const nextTierScore = totalScore < 2000 ? 2000 : totalScore < 10000 ? 10000 : totalScore < 30000 ? 30000 : 55500;

        const dsaTopics = [
          { topic: 'Arrays & Two Pointers', count: Math.round(totalSolved * 0.28), color: 'bg-tomato-jam' },
          { topic: 'Dynamic Programming', count: Math.round(totalSolved * 0.22), color: 'bg-pine-teal' },
          { topic: 'Trees & Graphs', count: Math.round(totalSolved * 0.18), color: 'bg-onyx' },
          { topic: 'Strings & HashMaps', count: Math.round(totalSolved * 0.15), color: 'bg-golden-sand' },
          { topic: 'Math & Greedy', count: Math.round(totalSolved * 0.17), color: 'bg-tomato-jam' },
        ];

        const newUserProfile = {
          id: s.id,
          name: s.name || s.user?.email?.split('@')[0] || 'NSEC Student',
          username: s.username || (s.user?.email ? s.user.email.split('@')[0] : 'student'),
          avatar: dbImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          email: s.user?.email || '',
          bio: s.bio || `${s.department} '${String(gradYear).slice(2)} @ NSEC`,
          department: s.department || 'CSE',
          year: yearString,
          rollNumber: s.rollNumber || '',
          graduationYear: gradYear,
          github: s.github || '',
          linkedin: s.linkedin || '',
          collegeRank: s.stats?.ranking ?? 0,
          deptRank: s.stats?.departmentRanking ?? 0,
          level,
          tier,
          cpScore: totalScore,
          nextTierScore,
          currentStreak,
          maxStreak,
          contestWinRate: 0,
          solvedByDifficulty: {
            easy: lcEasy,
            medium: lcMedium,
            hard: lcHard,
            total: totalSolved,
          },
          platforms: [
            {
              platform: 'LeetCode' as const,
              handle: s.leetcode || '',
              rating: s.stats?.leetcodeRating || 0,
              solvedCount: lcSolved,
              weight: 1.5,
              profileUrl: s.leetcode ? `https://leetcode.com/u/${s.leetcode}` : undefined,
            },
            {
              platform: 'Codeforces' as const,
              handle: s.codeforces || '',
              rating: s.stats?.codeforcesRating || 0,
              solvedCount: cfSolved,
              weight: 1.75,
              profileUrl: s.codeforces ? `https://codeforces.com/profile/${s.codeforces}` : undefined,
              ...(s.stats?.codeforcesRank ? { cfRank: s.stats.codeforcesRank } : {}),
              ...(s.stats?.codeforcesMaxRank ? { cfMaxRank: s.stats.codeforcesMaxRank } : {}),
              ...(s.stats?.codeforcesAvatar ? { cfAvatar: s.stats.codeforcesAvatar } : {}),
              ...(s.stats?.codeforcesContribution != null ? { cfContribution: s.stats.codeforcesContribution } : {}),
            },
            { 
              platform: 'CodeChef' as const, 
              handle: s.codechef || '', 
              rating: s.stats?.codechefRating || 0, 
              solvedCount: ccSolved, 
              weight: 1.25,
              profileUrl: s.codechef ? `https://www.codechef.com/users/${s.codechef}` : undefined,
              globalRank: (s.stats as any)?.codechefGlobalRank || null,
              badge: getCodechefBadge(s.stats?.codechefRating || 0, (s.stats as any)?.codechefStars),
            },
          ],
          badges: s.badges || [],
          dsaTopics,
          recentActivities: s.recentActivities || [],
        };

        setUser(newUserProfile);
        try {
          localStorage.setItem('cybernix_user_cache', JSON.stringify(newUserProfile));
        } catch (e) {}

        // Middleware now handles redirects server-side, no client-side redirects needed here
      } else if (data.user?.image || data.user?.name || data.user?.email) {
        setUser((prev) => {
          const updated = {
            ...prev,
            name: data.user.name || data.user.email?.split('@')[0] || 'NSEC Student',
            email: data.user.email || '',
            avatar: data.user.image || prev.avatar,
          };
          try {
            localStorage.setItem('cybernix_user_cache', JSON.stringify(updated));
          } catch (e) {}
          
          // Middleware handles redirects server-side
          return updated;
        });
      } else {
        // Middleware handles redirects server-side
      }
    } catch (err) {
      console.error('Failed to fetch student profile', err);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    try {
      const cached = localStorage.getItem('cybernix_user_cache');
      if (cached) {
        setUser(JSON.parse(cached));
      }
    } catch (e) {}

    setIsHydrated(true);
    if (status !== 'loading') {
      fetchStudentProfile();
    }
  }, [status]);

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  const refreshUser = async () => {
    await fetchStudentProfile();
  };

  const logout = async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // Ignore
    }
    setUser(INITIAL_EMPTY_USER);
    await signOut({ callbackUrl: '/login', redirect: true });
  };

  const isAuthPage = typeof window !== 'undefined' && (window.location.pathname === '/signup' || window.location.pathname === '/login');

  if (!isHydrated || status === 'loading' || (isLoadingProfile && user.id === '')) {
    return <CapybaraLoader />;
  }

  // Strictly block rendering of the app (dashboard, etc.) if authenticated but profile is missing/incomplete.
  if (status === 'authenticated' && user.id === '' && !isAuthPage) {
    return <CapybaraLoader />;
  }

  return (
    <UserContext.Provider value={{ user, updateUser, refreshUser, logout }}>
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
