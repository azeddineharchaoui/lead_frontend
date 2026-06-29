/**
 * middleware.ts
 * Next.js middleware — redirect unauthenticated requests to /login.
 * The access token is kept in memory in the browser; we use the
 * httpOnly refresh_token cookie as the "is session active" signal.
 */

import { NextRequest, NextResponse } from 'next/server'

// Routes that do NOT require authentication
const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/embed',
  '/chat-widget-demo',
]

// Static / API routes that should always pass through
const BYPASS_PREFIXES = ['/_next/', '/api/', '/favicon', '/icon', '/apple-icon', '/manifest']

export function middleware(request: NextRequest) {
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl

  // Let static files and Next.js internals through
  if (BYPASS_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  )

  // Check for refresh_token cookie as a session indicator
  const hasSession = !!request.cookies.get('refresh_token')?.value

  // Unauthenticated user trying to access protected route
  if (!isPublic && !hasSession) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Authenticated user trying to access auth pages — redirect to dashboard
  if (isPublic && hasSession && pathname !== '/verify-email' && pathname !== '/reset-password') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  // Run middleware on all routes except static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
