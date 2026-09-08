import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { pathname } = req.nextUrl;

    const protectedRoutes = [
        "/dashboard",
        "/profile",
        "/settings",
        "/contests",
        "/editorials",
        "/rankings",
        "/signup",
    ];

    const isProtectedRoute = protectedRoutes.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
    );

    if (isProtectedRoute && !token) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (pathname === "/login" && token) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard",
        "/dashboard/:path*",
        "/profile",
        "/profile/:path*",
        "/settings",
        "/settings/:path*",
        "/contests",
        "/contests/:path*",
        "/editorials",
        "/editorials/:path*",
        "/rankings",
        "/rankings/:path*",
        "/signup",
        "/signup/:path*",
        "/login",
    ],
};

