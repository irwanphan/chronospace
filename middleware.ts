import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    return;
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: [
    "/(protected)/:path*",
  ],
}; 