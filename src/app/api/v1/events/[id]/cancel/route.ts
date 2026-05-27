import { findOwnedEvent } from '@/lib/calendar-data'
import { getApiAuthContext } from '@/lib/auth'
import { error, json, options } from '@/lib/http'
import { prisma } from '@/lib/prisma'
import { serializeEvent } from '@/lib/serializers'

export const OPTIONS = options

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getApiAuthContext(request)
  if (!auth) return error('Unauthorized', 401)
  const { id } = await params

  const existing = await findOwnedEvent(auth.user.id, id)
  if (!existing) return error('Event not found', 404)

  const event = await prisma.event.update({ where: { id }, data: { status: 'CANCELLED' }, include: { service: true } })
  return json({ event: serializeEvent(event) })
}
