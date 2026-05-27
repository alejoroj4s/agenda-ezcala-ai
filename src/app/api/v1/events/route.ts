import { buildEventWhere, ensureEventFitsService } from '@/lib/calendar-data'
import { getApiAuthContext } from '@/lib/auth'
import { error, json, options } from '@/lib/http'
import { prisma } from '@/lib/prisma'
import { serializeEvent } from '@/lib/serializers'
import { parseEventPayload } from '@/lib/validation'

export const OPTIONS = options

export async function GET(request: Request) {
  const auth = await getApiAuthContext(request)
  if (!auth) return error('Unauthorized', 401)

  const url = new URL(request.url)
  const where = buildEventWhere(auth.user.id, {
    from: url.searchParams.get('from'),
    to: url.searchParams.get('to'),
    serviceId: url.searchParams.get('service_id'),
    status: url.searchParams.get('status'),
  })

  const events = await prisma.event.findMany({ where, include: { service: true }, orderBy: { startTime: 'asc' } })
  return json({ events: events.map(serializeEvent) })
}

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
