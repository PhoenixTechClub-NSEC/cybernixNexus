import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/prisma';
import { syncStudentStats } from '@/services/platforms/sync';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      httpOptions: {
        timeout: 40000,
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update token every 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
  events: {
    async signIn({ user }) {
      try {
        let studentId: string | null = null;
        if (user?.id) {
          const student = await prisma.student.findUnique({
            where: { userId: user.id },
            select: { id: true, leetcode: true, codeforces: true, codechef: true },
          });
          // Only sync if the student has at least one platform handle configured
          const hasHandles = !!(student?.leetcode || student?.codeforces || student?.codechef);
          studentId = (student && hasHandles) ? student.id : null;
        } else if (user?.email) {
          const student = await prisma.student.findFirst({
            where: { user: { email: user.email } },
            select: { id: true, leetcode: true, codeforces: true, codechef: true },
          });
          const hasHandles = !!(student?.leetcode || student?.codeforces || student?.codechef);
          studentId = (student && hasHandles) ? student.id : null;
        }

        if (studentId) {
          // Trigger non-blocking stats sync upon login
          syncStudentStats(studentId).catch((err) => {
            console.error(`[NextAuth signIn Event] Sync error for student ${studentId}:`, err);
          });
        }
      } catch (err) {
        console.error('[NextAuth signIn Event] Error checking student for login sync:', err);
      }
    },
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      if (user?.email) {
        const googlePicture = user.image || (profile as any)?.picture;
        if (googlePicture) {
          try {
            await prisma.user.updateMany({
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
        if (token.picture) {
          session.user.image = token.picture as string;
        }
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
    async jwt({ token, user, profile }) {
      if (user) {
        token.sub = user.id;
        const googlePicture = user.image || (profile as any)?.picture;
        if (googlePicture) {
          token.picture = googlePicture;
          try {
            await prisma.user.updateMany({
              where: { id: user.id },
              data: { image: googlePicture },
            });
          } catch {
            if (user.email) {
              try {
                await prisma.user.updateMany({
                  where: { email: user.email },
                  data: { image: googlePicture },
                });
              } catch {}
            }
          }
        }
      }
      return token;
    },
  },
};
