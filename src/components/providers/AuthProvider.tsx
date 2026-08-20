'use client';

import React, { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={true}>
      {children}
    </SessionProvider>
  );
}
