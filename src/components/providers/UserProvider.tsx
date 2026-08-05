'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CURRENT_USER as DEFAULT_USER } from '@/lib/constants';
import { UserProfile } from '@/types';

interface UserContextType {
  user: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage ONCE on mount (client only)
  useEffect(() => {
    const savedUser = localStorage.getItem('cybernix_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        // Merge with defaults so new fields always have values
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser({ ...DEFAULT_USER, ...parsed });
      } catch {
        // Corrupted data — fall back to defaults
      }
    }
    setIsHydrated(true);
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

  // Suppress rendering until client-side localStorage is loaded.
  // This prevents hydration mismatch: the server always renders DEFAULT_USER,
  // and we don't let React diff against a different client state.
  if (!isHydrated) {
    return (
      <UserContext.Provider value={{ user: DEFAULT_USER, updateUser }}>
        {children}
      </UserContext.Provider>
    );
  }

  return (
    <UserContext.Provider value={{ user, updateUser }}>
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
