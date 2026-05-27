import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { AUTH_COOKIE_NAME } from '@/lib/constants'

const authPages = ['/login', '/register']

export function proxy(request: NextRequest) {
  const { nextUrl } = request
  const token = nextUrl.searchParams.get('token')
  const hasCookie = Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value)

  if (token && nextUrl.pathname !== '/api/auth/token') {
    const redirectTarget = nextUrl.clone()
    redirectTarget.searchParams.delete('token')
    const bridgeUrl = new URL('/api/auth/token', request.url)
    bridgeUrl.searchParams.set('token', token)
    bridgeUrl.searchParams.set('redirect', `${redirectTarget.pathname}${redirectTarget.search}` || '/calendar')
    return NextResponse.redirect(bridgeUrl)
  }

  if (authPages.some((path) => nextUrl.pathname.startsWith(path))) {
    if (hasCookie) {
      return NextResponse.redirect(new URL('/calendar', request.url))
    }

    return NextResponse.next()
  }

  if (nextUrl.pathname.startsWith('/calendar') && !hasCookie) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', `${nextUrl.pathname}${nextUrl.search}`)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/login', '/register', '/calendar/:path*'],
}
