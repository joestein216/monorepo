import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Execute redirect only for the exact root route
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/electronic-press-kit', request.url))
  }

  // Allow all other routes to pass through
  return NextResponse.next()
}

// Ensure the proxy execution is scoped only to the root route for performance
export const config = {
  matcher: '/',
}
