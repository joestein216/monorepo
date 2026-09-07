import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest): NextResponse {
  const url: URL = request.nextUrl.clone()

  // Strict check ensures it only triggers on the absolute homepage
  if (url.pathname === '/') {
    url.pathname = '/electronic-press-kit'
    return NextResponse.redirect(url, 307)
  }

  return NextResponse.next()
}

// The matcher ensures this script never executes for /studio or api assets
export const config = {
  matcher: ['/'],
}
