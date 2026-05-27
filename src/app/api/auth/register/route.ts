import { attachSessionCookie, hashPassword } from '@/lib/auth'
import { error, json, options } from '@/lib/http'
import { prisma } from '@/lib/prisma'
import { serializeUser } from '@/lib/serializers'

export const OPTIONS = options

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { name?: string; email?: string; password?: string } | null
  const name = body?.name?.trim()
  const email = body?.email?.trim().toLowerCase()
  const password = body?.password?.trim()

  if (!name || !email || !password) {
    return error('Name, email, and password are required', 400)
  }

  if (password.length < 6) {
    return error('Password must be at least 6 characters long', 400)
  }

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return error('Email is already in use', 409)
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: await hashPassword(password),
    },
  })

  const response = json({
    user: serializeUser({ id: user.id, name: user.name, email: user.email, createdAt: user.createdAt, updatedAt: user.updatedAt }),
  })

  return attachSessionCookie(response, user.id)
}
