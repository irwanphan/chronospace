import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Redirect /dashboard ke /workspace
    if (req.nextUrl.pathname === '/dashboard') {
      return NextResponse.redirect(new URL('/workspace', req.url));
    }

    // Biarkan akses ke /login dan /timeline
    if (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/timeline') {
      return NextResponse.next();
    }

    // Proteksi route lainnya
    if (!req.nextauth.token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // Bypass default authorization
    },
  }
);

export const config = {
  matcher: [
    '/((?!api|_next|login|timeline|favicon.ico).*)',
  ],
}; 