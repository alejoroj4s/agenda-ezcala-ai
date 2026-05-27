import { findOwnedEvent } from '@/lib/calendar-data'
import { getApiAuthContext } from '@/lib/auth'
import { error, json, options } from '@/lib/http'
import { prisma } from '@/lib/prisma'
import { serializeEvent } from '@/lib/serializers'

export const OPTIONS = options

// POST /api/v1/events/cancel?id=XXX
// PATCH /api/v1/events/cancel?id=XXX
async function cancelEvent(request: Request) {
  const auth = await getApiAuthContext(request)
  if (!auth) return error('Unauthorized', 401)

  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  if (!id) return error('id query param is required', 400)

  const existing = await findOwnedEvent(auth.user.id, id)
  if (!existing) return error('Event not found', 404)

  const event = await prisma.event.update({ where: { id }, data: { status: 'CANCELLED' }, include: { service: true } })
  return json({ event: serializeEvent(event) })
}

export const POST = cancelEvent
export const PATCH = cancelEvent
