import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'

import { AUTH_COOKIE_NAME } from './constants'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'your-secret-key'
const SESSION_MAX_AGE = 60 * 60 * 24 * 30

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect

export type SafeUser = Prisma.UserGetPayload<{ select: typeof safeUserSelect }>

type TokenContext = {
  user: SafeUser
  tokenType: 'jwt' | 'api-token' | 'cookie'
  token?: {
    id: string
    label: string | null
    expiresAt: Date | null
    createdAt: Date
  } | null
}

export function signToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' })
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  } catch {
    return null
  }
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  }
}

export function attachSessionCookie(response: NextResponse, userId: string) {
  response.cookies.set(AUTH_COOKIE_NAME, signToken(userId), getAuthCookieOptions())
  return response
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(AUTH_COOKIE_NAME, '', { ...getAuthCookieOptions(), maxAge: 0 })
  return response
}

async function findUserById(userId: string) {
  return prisma.user.findUnique({ where: { id: userId }, select: safeUserSelect })
}

async function resolveToken(token: string, source: TokenContext['tokenType']) {
  const dbToken = await prisma.userToken.findUnique({
    where: { token },
    include: { user: { select: safeUserSelect } },
  })

  if (dbToken) {
    if (dbToken.expiresAt && dbToken.expiresAt < new Date()) {
      return null
    }

    return {
      user: dbToken.user,
      tokenType: 'api-token' as const,
      token: {
        id: dbToken.id,
        label: dbToken.label,
        expiresAt: dbToken.expiresAt,
        createdAt: dbToken.createdAt,
      },
    }
  }

  const payload = verifyToken(token)
  if (!payload) return null

  const user = await findUserById(payload.userId)
  if (!user) return null

  return {
    user,
    tokenType: source,
    token: null,
  }
}

function getCookieValue(request: Request, name: string) {
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return null

  const pair = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))

  return pair ? decodeURIComponent(pair.slice(name.length + 1)) : null
}

export async function getApiAuthContext(request: Request): Promise<TokenContext | null> {
  const authHeader = request.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const context = await resolveToken(authHeader.slice(7), 'jwt')
    if (context) return context
  }

  const url = new URL(request.url)
  const urlToken = url.searchParams.get('token')
  if (urlToken) {
    const context = await resolveToken(urlToken, 'api-token')
    if (context) return context
  }

  const cookieToken = getCookieValue(request, AUTH_COOKIE_NAME)
  if (cookieToken) {
    const context = await resolveToken(cookieToken, 'cookie')
    if (context) return context
  }

  return null
}

export async function getAuthUser(request: Request) {
  const context = await getApiAuthContext(request)
  return context?.user ?? null
}

export async function getSessionUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload) return null

  return findUserById(payload.userId)
}

export async function requireSessionUser() {
  const user = await getSessionUser()
  if (!user) {
    redirect('/login')
  }
  return user
}
