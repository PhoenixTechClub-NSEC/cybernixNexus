import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow maintenance page
  if (pathname === "/maintenance" || pathname.startsWith("/maintenance/")) {
    return NextResponse.next();
  }

  // Allow static Next.js assets, favicons, fonts, and public media files
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    /\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|css|js)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // For API endpoints, return a 503 Service Unavailable maintenance response
  if (pathname.startsWith("/api/")) {
    // If request accepts HTML (e.g. user opening /api/xxx in browser), redirect to /maintenance
    const acceptHeader = req.headers.get("accept") || "";
    if (acceptHeader.includes("text/html")) {
      return NextResponse.redirect(new URL("/maintenance", req.url));
    }

    return NextResponse.json(
      {
        status: "maintenance",
        message: "Cybernix Nexus is currently undergoing scheduled maintenance.",
        expectedReturn: "2026-09-25T00:00:00+05:30",
        remainingHours: 48,
      },
      { status: 503 }
    );
  }

  // Redirect all other requests to /maintenance
  const maintenanceUrl = new URL("/maintenance", req.url);
  return NextResponse.redirect(maintenanceUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
