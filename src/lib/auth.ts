import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/prisma';
import { revalidateTag, revalidatePath } from 'next/cache';
import { syncStudentStats } from '@/services/platforms/sync';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
      httpOptions: {
        timeout: 40000,
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 15 * 60, // Update token every 15 minutes to catch profile changes faster
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
        let student = null;
        if (user?.id) {
          student = await prisma.student.findUnique({
            where: { userId: user.id },
            select: { id: true, leetcode: true, codeforces: true, codechef: true },
          });
        }
        if (!student && user?.email) {
          student = await prisma.student.findFirst({
            where: { user: { email: user.email } },
            select: { id: true, leetcode: true, codeforces: true, codechef: true },
          });
        }

        const hasHandles = !!(student?.leetcode || student?.codeforces || student?.codechef);
        if (student && hasHandles) {
          console.log(`[NextAuth signIn] Fetching account data from external APIs for student ${student.id}...`);
          await syncStudentStats(student.id);
          try {
            revalidateTag('dashboard', { expire: 0 });
            revalidatePath('/dashboard');
          } catch {}
          console.log(`[NextAuth signIn] Finished updating account data for student ${student.id}`);
        }
      } catch (err) {
        console.error('[NextAuth signIn] Error updating user platform data upon login:', err);
      }
    },
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      // Auto-link Google account if user with same email already exists
      if (user?.email && account?.provider === 'google') {
        try {
          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: { accounts: true },
          });

          // If user exists but no Google account, create one (auto-link)
          if (existingUser && !existingUser.accounts.some(a => a.provider === 'google')) {
            try {
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  type: 'oauth',
                  provider: 'google',
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token || null,
                  token_type: account.token_type || null,
                  scope: account.scope || null,
                },
              });
              console.log(`[NextAuth] Auto-linked Google account for user ${user.email}`);
            } catch (err) {
              console.error('[NextAuth signIn] Failed to auto-link Google account:', err);
            }
          }
        } catch (err) {
          console.error('[NextAuth signIn] Account check error:', err);
        }
      }

      // Update profile picture
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
      try {
        if (token && session.user) {
          // Read identity from JWT — zero DB reads on hot path
          (session.user as any).id = token.sub;
          if (token.picture) {
            session.user.image = token.picture as string;
          }
          // profileComplete and studentId are stored in the JWT by the jwt callback
          (session.user as any).profileComplete = token.profileComplete ?? false;
          (session.user as any).studentId = token.studentId ?? null;

          // Only hit the DB when token.sub is absent (e.g. legacy session without it)
          if (!token.sub && session.user.email) {
            const dbUser = await prisma.user.findUnique({
              where: { email: session.user.email },
              select: { id: true, image: true, student: { select: { profileComplete: true, id: true } } },
            });
            if (dbUser) {
              (session.user as any).id = dbUser.id;
              (session.user as any).studentId = dbUser.student?.id ?? null;
              (session.user as any).profileComplete = dbUser.student?.profileComplete ?? false;
              if (dbUser.image) session.user.image = dbUser.image;
            }
          }
        }
      } catch (error) {
        console.error('[NextAuth session callback error]:', error);
      }
      return session;
    },
    async jwt({ token, user, profile, trigger }) {
      try {
        if (user) {
          // First login: resolve the canonical DB user ID and store profile state in token
          token.sub = user.id;
          const googlePicture = user.image || (profile as any)?.picture;
          if (googlePicture) token.picture = googlePicture;

          if (user.email) {
            try {
              const dbUser = await prisma.user.findUnique({
                where: { email: user.email },
                select: {
                  id: true,
                  image: true,
                  student: { select: { id: true, profileComplete: true } },
                },
              });
              if (dbUser) {
                token.sub = dbUser.id;
                token.profileComplete = dbUser.student?.profileComplete ?? false;
                token.studentId = dbUser.student?.id ?? null;
                if (dbUser.image) token.picture = dbUser.image;
                // Persist Google picture to DB on first login
                if (googlePicture && googlePicture !== dbUser.image) {
                  await prisma.user.updateMany({
                    where: { id: dbUser.id },
                    data: { image: googlePicture },
                  });
                }
              }
            } catch (e) {
              console.error('[NextAuth JWT] Error finding user by email:', e);
            }
          }
        } else if (trigger === 'update' && token.sub) {
          // Explicit session update (e.g. after profile completion) — refresh claims from DB
          try {
            const dbUser = await prisma.user.findUnique({
              where: { id: token.sub },
              select: { image: true, student: { select: { id: true, profileComplete: true } } },
            });
            if (dbUser) {
              token.profileComplete = dbUser.student?.profileComplete ?? false;
              token.studentId = dbUser.student?.id ?? null;
              if (dbUser.image) token.picture = dbUser.image;
            }
          } catch (e) {
            console.error('[NextAuth JWT Refresh] Error:', e);
          }
        }
        // On all other invocations (regular session reads), the token is returned as-is
        // with zero DB queries.
      } catch (error) {
        console.error('[NextAuth JWT callback error]:', error);
      }
      return token;
    },
  },
};
