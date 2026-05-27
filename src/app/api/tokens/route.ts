import { randomBytes } from 'crypto'

import { getSessionUser } from '@/lib/auth'
import { error, json, options } from '@/lib/http'
import { prisma } from '@/lib/prisma'
import { serializeToken } from '@/lib/serializers'

export const OPTIONS = options

export async function GET() {
  const user = await getSessionUser()
  if (!user) return error('Unauthorized', 401)

  const tokens = await prisma.userToken.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } })
  return json({ tokens: tokens.map(serializeToken) })
}

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) return error('Unauthorized', 401)

  const body = (await request.json().catch(() => ({}))) as { label?: string; expiresAt?: string | null }
  const expiresAt = body.expiresAt ? new Date(body.expiresAt) : null

  if (body.expiresAt && Number.isNaN(expiresAt?.getTime() ?? NaN)) {
    return error('Invalid expiration date', 400)
  }

  const token = await prisma.userToken.create({
    data: {
      userId: user.id,
      label: body.label?.trim() || null,
      expiresAt,
      token: randomBytes(32).toString('hex'),
    },
  })

  return json({ token: serializeToken(token) }, { status: 201 })
}
