import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Izinkan akses ke halaman login tanpa auth
    if (req.nextUrl.pathname === '/login') {
      return NextResponse.next();
    }

    // Proteksi route lainnya
    const isAuth = !!req.nextauth.token;
    if (!isAuth) {
      const url = new URL('/login', req.url);
      url.searchParams.set('callbackUrl', req.url);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: [
    '/((?!api|_next|favicon.ico|login|register).*)',
  ],
}; 