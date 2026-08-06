import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const email = credentials.email.toLowerCase().trim();

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          throw new Error('Invalid email or password');
        }

        const sha256Hash = hashPassword(credentials.password);
        let isValid = sha256Hash === user.password;

        if (!isValid && user.password.startsWith('$2')) {
          isValid = await bcrypt.compare(credentials.password, user.password);
        }

        if (!isValid) {
          throw new Error('Invalid email or password');
        }

        return user;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (user?.email) {
        const googlePicture = user.image || (profile as any)?.picture;
        if (googlePicture) {
          try {
            await prisma.user.update({
              where: { email: user.email },
              data: { image: googlePicture },
            });
          } catch (err) {
            console.error('[NextAuth signIn] Failed to save profile picture:', err);
          }
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.sub;
        if (token.sub) {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { image: true, student: { select: { profileComplete: true, id: true } } },
          });
          if (dbUser?.image) {
            session.user.image = dbUser.image;
          }
          (session.user as any).studentId = dbUser?.student?.id || null;
          (session.user as any).profileComplete = dbUser?.student?.profileComplete || false;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
};
