import { NextResponse } from 'next/server'

import { attachSessionCookie } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')
  const redirectTo = url.searchParams.get('redirect') || '/calendar'

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const userToken = await prisma.userToken.findUnique({ where: { token }, include: { user: true } })
  if (!userToken || (userToken.expiresAt && userToken.expiresAt < new Date())) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const response = NextResponse.redirect(new URL(redirectTo, request.url))
  return attachSessionCookie(response, userToken.userId)
}
