import { getSessionUser } from '@/lib/auth'
import { error, json, options } from '@/lib/http'
import { prisma } from '@/lib/prisma'
import { serializeService } from '@/lib/serializers'
import { parseServicePayload } from '@/lib/validation'

export const OPTIONS = options

export async function GET() {
  const user = await getSessionUser()
  if (!user) return error('Unauthorized', 401)

  const services = await prisma.service.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'asc' } })
  return json({ services: services.map(serializeService) })
}

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) return error('Unauthorized', 401)

  try {
    const body = (await request.json()) as Record<string, unknown>
    const data = parseServicePayload(body)
    const service = await prisma.service.create({ data: { ...data, userId: user.id } })
    return json({ service: serializeService(service) }, { status: 201 })
  } catch (cause) {
    return error(cause instanceof Error ? cause.message : 'Invalid service payload', 400)
  }
}
