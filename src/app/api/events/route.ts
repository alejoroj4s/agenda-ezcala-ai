import { ensureEventFitsService, buildEventWhere } from '@/lib/calendar-data'
import { getSessionUser } from '@/lib/auth'
import { error, json, options } from '@/lib/http'
import { prisma } from '@/lib/prisma'
import { serializeEvent } from '@/lib/serializers'
import { parseEventPayload } from '@/lib/validation'

export const OPTIONS = options

export async function GET(request: Request) {
  const user = await getSessionUser()
  if (!user) return error('Unauthorized', 401)

  const url = new URL(request.url)
  const where = buildEventWhere(user.id, {
    from: url.searchParams.get('from'),
    to: url.searchParams.get('to'),
    serviceId: url.searchParams.get('service_id') || url.searchParams.get('serviceId'),
    status: url.searchParams.get('status'),
  })

  const events = await prisma.event.findMany({ where, include: { service: true }, orderBy: { startTime: 'asc' } })
  return json({ events: events.map(serializeEvent) })
}

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) return error('Unauthorized', 401)

  try {
    const body = (await request.json()) as Record<string, unknown>
    const data = parseEventPayload(body)
    await ensureEventFitsService(user.id, data)
    const event = await prisma.event.create({ data: { ...data, userId: user.id }, include: { service: true } })
    return json({ event: serializeEvent(event) }, { status: 201 })
  } catch (cause) {
    return error(cause instanceof Error ? cause.message : 'Invalid event payload', 400)
  }
}
