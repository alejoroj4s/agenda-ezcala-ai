import { getSessionUser } from '@/lib/auth'
import { error, json, options } from '@/lib/http'
import { prisma } from '@/lib/prisma'
import { serializeService } from '@/lib/serializers'
import { parseServicePayload } from '@/lib/validation'

export const OPTIONS = options

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser()
  if (!user) return error('Unauthorized', 401)
  const { id } = await params

  const service = await prisma.service.findFirst({ where: { id, userId: user.id } })
  if (!service) return error('Service not found', 404)
  return json({ service: serializeService(service) })
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser()
  if (!user) return error('Unauthorized', 401)
  const { id } = await params

  const service = await prisma.service.findFirst({ where: { id, userId: user.id } })
  if (!service) return error('Service not found', 404)

  try {
    const body = (await request.json()) as Record<string, unknown>
    const data = parseServicePayload(body)
    const updated = await prisma.service.update({ where: { id }, data })
    return json({ service: serializeService(updated) })
  } catch (cause) {
    return error(cause instanceof Error ? cause.message : 'Invalid service payload', 400)
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser()
  if (!user) return error('Unauthorized', 401)
  const { id } = await params

  const service = await prisma.service.findFirst({ where: { id, userId: user.id } })
  if (!service) return error('Service not found', 404)

  await prisma.service.delete({ where: { id } })
  return json({ success: true })
}
