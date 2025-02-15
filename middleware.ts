import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    // Izinkan akses ke halaman login tanpa auth
    if (req.nextUrl.pathname === '/login') {
      return NextResponse.next();
    }

    const token = req.nextauth.token;
    if (!token?.sub) {
      const url = new URL('/login', req.url);
      url.searchParams.set('callbackUrl', req.url);
      return NextResponse.redirect(url);
    }

    // Cek akses menggunakan existing API
    const accessResponse = await fetch(`${req.nextUrl.origin}/api/users/${token.sub}/access`);
    if (!accessResponse.ok) {
      return NextResponse.redirect(new URL('/forbidden', req.url));
    }

    const access = await accessResponse.json();
    const { activityAccess } = access;

    // Cek akses specific route
    if (req.nextUrl.pathname.startsWith('/workspace-management')) {
      if (req.nextUrl.pathname.includes('/work-division')) {
        if (req.nextUrl.pathname.includes('/edit') && !activityAccess.editWorkDivision) {
          return NextResponse.redirect(new URL('/forbidden', req.url));
        }
        if (req.nextUrl.pathname.includes('/new') && !activityAccess.createWorkDivision) {
          return NextResponse.redirect(new URL('/forbidden', req.url));
        }
      }
      if (req.nextUrl.pathname.includes('/role')) {
        if (req.nextUrl.pathname.includes('/edit') && !activityAccess.editRole) {
          return NextResponse.redirect(new URL('/forbidden', req.url));
        }
        if (req.nextUrl.pathname.includes('/new') && !activityAccess.createRole) {
          return NextResponse.redirect(new URL('/forbidden', req.url));
        }
      }
      if (req.nextUrl.pathname.includes('/vendor')) {
        if (req.nextUrl.pathname.includes('/edit') && !activityAccess.editVendor) {
          return NextResponse.redirect(new URL('/forbidden', req.url));
        }
        if (req.nextUrl.pathname.includes('/new') && !activityAccess.createVendor) {
          return NextResponse.redirect(new URL('/forbidden', req.url));
        } 
      }
    }

    if (req.nextUrl.pathname.startsWith('/budget-planning')) {
      if (req.nextUrl.pathname.includes('/edit') && !activityAccess.editBudget) {
        return NextResponse.redirect(new URL('/forbidden', req.url));
      }
      if (req.nextUrl.pathname.includes('/new') && !activityAccess.createBudget) {
        return NextResponse.redirect(new URL('/forbidden', req.url));
      }
    }

    if (req.nextUrl.pathname.startsWith('/project-planning')) {
      if (req.nextUrl.pathname.includes('/edit') && !activityAccess.editProject) {
        return NextResponse.redirect(new URL('/forbidden', req.url));
      }
      if (req.nextUrl.pathname.includes('/new') && !activityAccess.createProject) {
        return NextResponse.redirect(new URL('/forbidden', req.url));
      }
    }

    if (req.nextUrl.pathname.startsWith('/user-management')) {
      if (req.nextUrl.pathname.includes('/edit') && !activityAccess.editUser) {
        return NextResponse.redirect(new URL('/forbidden', req.url));
      }
      if (req.nextUrl.pathname.includes('/new') && !activityAccess.createUser) {
        return NextResponse.redirect(new URL('/forbidden', req.url));
      }
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
  matcher: ['/((?!api|_next|favicon.ico|login|register|forbidden).*)'],
}; 