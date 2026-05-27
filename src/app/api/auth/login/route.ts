import { attachSessionCookie, comparePassword } from '@/lib/auth'
import { error, json, options } from '@/lib/http'
import { prisma } from '@/lib/prisma'
import { serializeUser } from '@/lib/serializers'

export const OPTIONS = options

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: string; password?: string } | null
  const email = body?.email?.trim().toLowerCase()
  const password = body?.password?.trim()

  if (!email || !password) {
    return error('Email and password are required', 400)
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return error('Invalid credentials', 401)
  }

  const passwordMatches = await comparePassword(password, user.password)
  if (!passwordMatches) {
    return error('Invalid credentials', 401)
  }

  const response = json({
    user: serializeUser({ id: user.id, name: user.name, email: user.email, createdAt: user.createdAt, updatedAt: user.updatedAt }),
  })

  return attachSessionCookie(response, user.id)
}
