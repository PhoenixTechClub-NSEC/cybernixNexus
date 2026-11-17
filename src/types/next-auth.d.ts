import { DefaultSession } from 'next-auth';
import { Role } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: Role;
      studentId?: string | null;
      profileComplete?: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role?: Role;
    studentId?: string | null;
    profileComplete?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    sub?: string;
    role?: Role;
    studentId?: string | null;
    profileComplete?: boolean;
  }
}
