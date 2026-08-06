'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CURRENT_USER as DEFAULT_USER } from '@/lib/constants';
import { UserProfile } from '@/types';

interface UserContextType {
  user: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => void;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [isHydrated, setIsHydrated] = useState(false);

  const fetchStudentProfile = async () => {
    try {
      const res = await fetch('/api/student');
      if (!res.ok) return;
      const data = await res.json();
      if (data.student) {
        const s = data.student;
        const dbImage = s.user?.image;
        setUser((prev) => ({
          ...prev,
          name: s.name || prev.name,
          email: s.user?.email || prev.email,
          avatar: dbImage || prev.avatar,
          department: s.department || prev.department,
          collegeRank: s.stats?.ranking ?? prev.collegeRank,
          deptRank: s.stats?.departmentRanking ?? prev.deptRank,
          cpScore: s.stats?.totalScore ?? prev.cpScore,
          platforms: [
            { platform: 'LeetCode' as const, handle: s.leetcode || '', rating: s.stats?.leetcodeRating || 0, solvedCount: s.stats?.leetcodeSolved || 0, weight: 1.0 },
            { platform: 'Codeforces' as const, handle: s.codeforces || '', rating: s.stats?.codeforcesRating || 0, solvedCount: 0, weight: 1.2 },
            { platform: 'GFG' as const, handle: s.gfg || '', rating: 0, solvedCount: s.stats?.gfgScore || 0, weight: 0.8 },
            { platform: 'CodeChef' as const, handle: s.codechef || '', rating: s.stats?.codechefRating || 0, solvedCount: 0, weight: 1.0 },
          ],
        }));
      }
    } catch {
      // Ignore if unauthorized or offline
    }
  };

  // Load from localStorage ONCE on mount (client only) and fetch DB profile
  useEffect(() => {
    const savedUser = localStorage.getItem('cybernix_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser({ ...DEFAULT_USER, ...parsed });
      } catch {
        // Corrupted data — fall back to defaults
      }
    }
    setIsHydrated(true);
    fetchStudentProfile();
  }, []);

  // Persist to localStorage whenever user changes (only after initial load)
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('cybernix_user', JSON.stringify(user));
    }
  }, [user, isHydrated]);

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  const refreshUser = async () => {
    await fetchStudentProfile();
  };

  if (!isHydrated) {
    return (
      <UserContext.Provider value={{ user: DEFAULT_USER, updateUser, refreshUser }}>
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
