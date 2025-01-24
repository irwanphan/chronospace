import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Define protected routes that need the main layout
  const isProtectedRoute = !path.startsWith('/login') && !path.startsWith('/register')

  // Add a custom header that we can check in the layout
  const headers = new Headers(request.headers)
  headers.set('x-use-layout', isProtectedRoute ? 'true' : 'false')

  return NextResponse.next({
    request: {
      headers: headers,
    },
  })
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 