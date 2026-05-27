import { ensureEventFitsService, findOwnedEvent } from '@/lib/calendar-data'
import { getSessionUser } from '@/lib/auth'
import { error, json, options } from '@/lib/http'
import { prisma } from '@/lib/prisma'
import { serializeEvent } from '@/lib/serializers'
import { parseEventPayload } from '@/lib/validation'

export const OPTIONS = options

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser()
  if (!user) return error('Unauthorized', 401)
  const { id } = await params

  const event = await findOwnedEvent(user.id, id)
  if (!event) return error('Event not found', 404)
  return json({ event: serializeEvent(event) })
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser()
  if (!user) return error('Unauthorized', 401)
  const { id } = await params

  const existing = await findOwnedEvent(user.id, id)
  if (!existing) return error('Event not found', 404)

  try {
    const body = (await request.json()) as Record<string, unknown>
    const data = parseEventPayload(body)
    await ensureEventFitsService(user.id, data, id)
    const event = await prisma.event.update({ where: { id }, data, include: { service: true } })
    return json({ event: serializeEvent(event) })
  } catch (cause) {
    return error(cause instanceof Error ? cause.message : 'Invalid event payload', 400)
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser()
  if (!user) return error('Unauthorized', 401)
  const { id } = await params

  const existing = await findOwnedEvent(user.id, id)
  if (!existing) return error('Event not found', 404)

  await prisma.event.delete({ where: { id } })
  return json({ success: true })
}
