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
          (session.user as any).id = token.sub;
          if (token.picture) {
            session.user.image = token.picture as string;
          }
          if (token.sub) {
            let dbUser = await prisma.user.findUnique({
              where: { id: token.sub },
              select: { id: true, image: true, student: { select: { profileComplete: true, id: true } } },
            });

            // Fallback: If token.sub didn't find a record, check by email
            if (!dbUser && session.user.email) {
              dbUser = await prisma.user.findUnique({
                where: { email: session.user.email },
                select: { id: true, image: true, student: { select: { profileComplete: true, id: true } } },
              });
              if (dbUser) {
                (session.user as any).id = dbUser.id;
              }
            }

            if (dbUser?.image) {
              session.user.image = dbUser.image;
            }
            (session.user as any).studentId = dbUser?.student?.id || null;
            (session.user as any).profileComplete = dbUser?.student?.profileComplete || false;
          }
        }
      } catch (error) {
        console.error('[NextAuth session callback error]:', error);
      }
      return session;
    },
    async jwt({ token, user, profile }) {
      try {
        if (user) {
          token.sub = user.id;
          // Verify if user exists in DB with actual cuid to avoid provider ID mismatch
          if (user.email) {
            try {
              const dbUser = await prisma.user.findUnique({
                where: { email: user.email },
                select: { id: true, student: { select: { profileComplete: true } } },
              });
              if (dbUser) {
                token.sub = dbUser.id;
                token.profileComplete = dbUser.student?.profileComplete || false;
              }
            } catch (e) {
              console.error('[NextAuth JWT] Error finding user by email:', e);
            }
          }
          const googlePicture = user.image || (profile as any)?.picture;
          if (googlePicture) {
            token.picture = googlePicture;
            try {
              await prisma.user.updateMany({
                where: { id: token.sub },
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
        } else if (token.sub) {
          // Refresh profileComplete status on subsequent token updates
          try {
            const dbUser = await prisma.user.findUnique({
              where: { id: token.sub },
              select: { student: { select: { profileComplete: true } } },
            });
            if (dbUser) {
              token.profileComplete = dbUser.student?.profileComplete || false;
            }
          } catch (e) {
            console.error('[NextAuth JWT Refresh] Error:', e);
          }
        }
      } catch (error) {
        console.error('[NextAuth JWT callback error]:', error);
      }
      return token;
    },
  },
};
