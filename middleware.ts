import { withAuth } from 'next-auth/middleware';
import { NextRequest } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = (req as any).nextauth?.token;
    const pathname = req.nextUrl.pathname;

    // If user is authenticated but profile incomplete, redirect to signup
    if (token && !token.profileComplete && !pathname.startsWith('/signup') && !pathname.startsWith('/login') && !pathname.startsWith('/api')) {
      return Response.redirect(new URL('/signup', req.url));
    }

    // If user is on auth page but already authenticated with complete profile, redirect to dashboard
    if (token && token.profileComplete && (pathname === '/login' || pathname === '/signup')) {
      return Response.redirect(new URL('/dashboard', req.url));
    }

    return null;
  },
  {
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|public|favicon.ico).*)',
  ],
};
