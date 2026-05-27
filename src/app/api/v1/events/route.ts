import { buildEventWhere, ensureEventFitsService, findOwnedEvent } from '@/lib/calendar-data'
import { getApiAuthContext } from '@/lib/auth'
import { error, json, options } from '@/lib/http'
import { prisma } from '@/lib/prisma'
import { serializeEvent } from '@/lib/serializers'
import { parseEventPayload } from '@/lib/validation'

export const OPTIONS = options

// GET /api/v1/events            → list events
// GET /api/v1/events?id=XXX     → get single event
export async function GET(request: Request) {
  const auth = await getApiAuthContext(request)
  if (!auth) return error('Unauthorized', 401)

  const url = new URL(request.url)
  const id = url.searchParams.get('id')

  if (id) {
    const event = await findOwnedEvent(auth.user.id, id)
    if (!event) return error('Event not found', 404)
    return json({ event: serializeEvent(event) })
  }

  const where = buildEventWhere(auth.user.id, {
    from: url.searchParams.get('from'),
    to: url.searchParams.get('to'),
    serviceId: url.searchParams.get('service_id'),
    status: url.searchParams.get('status'),
  })
  const events = await prisma.event.findMany({ where, include: { service: true }, orderBy: { startTime: 'asc' } })
  return json({ events: events.map(serializeEvent) })
}

// POST /api/v1/events  → create event
export async function POST(request: Request) {
  const auth = await getApiAuthContext(request)
  if (!auth) return error('Unauthorized', 401)

  try {
    const body = (await request.json()) as Record<string, unknown>
    const data = parseEventPayload(body)
    await ensureEventFitsService(auth.user.id, data)
    const event = await prisma.event.create({ data: { ...data, userId: auth.user.id }, include: { service: true } })
    return json({ event: serializeEvent(event) }, { status: 201 })
  } catch (cause) {
    return error(cause instanceof Error ? cause.message : 'Invalid event payload', 400)
  }
}

// PUT /api/v1/events?id=XXX  → update / reschedule event
export async function PUT(request: Request) {
  const auth = await getApiAuthContext(request)
  if (!auth) return error('Unauthorized', 401)

  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  if (!id) return error('id query param is required', 400)

  const existing = await findOwnedEvent(auth.user.id, id)
  if (!existing) return error('Event not found', 404)

  try {
    const body = (await request.json()) as Record<string, unknown>
    const data = parseEventPayload(body)
    await ensureEventFitsService(auth.user.id, data, id)
    const event = await prisma.event.update({ where: { id }, data, include: { service: true } })
    return json({ event: serializeEvent(event) })
  } catch (cause) {
    return error(cause instanceof Error ? cause.message : 'Invalid event payload', 400)
  }
}

// DELETE /api/v1/events?id=XXX  → delete event
export async function DELETE(request: Request) {
  const auth = await getApiAuthContext(request)
  if (!auth) return error('Unauthorized', 401)

  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  if (!id) return error('id query param is required', 400)

  const existing = await findOwnedEvent(auth.user.id, id)
  if (!existing) return error('Event not found', 404)

  await prisma.event.delete({ where: { id } })
  return json({ success: true })
}
