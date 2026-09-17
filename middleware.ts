import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const pathname = req.nextUrl.pathname;

  // Allow public paths
  if (pathname.startsWith('/api/auth') || pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  // If not authenticated and trying to access protected routes
  if (!token && !pathname.startsWith('/login') && !pathname.startsWith('/signup') && !pathname.startsWith('/')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // If authenticated but profile incomplete, redirect to signup (unless already on auth pages)
  if (token && !token.profileComplete && !pathname.startsWith('/signup') && !pathname.startsWith('/login') && !pathname.startsWith('/api')) {
    return NextResponse.redirect(new URL('/signup', req.url));
  }

  // If authenticated with complete profile but on auth page, redirect to dashboard
  if (token && token.profileComplete && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|public|favicon.ico).*)',
  ],
};
