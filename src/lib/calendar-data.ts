import { addMinutes, isSameDay } from 'date-fns'
import type { Event, Prisma, Service } from '@prisma/client'

import { prisma } from './prisma'
import { combineDateAndTime, normalizeSchedule } from './utils'

export async function findOwnedService(userId: string, serviceId: string) {
  return prisma.service.findFirst({ where: { id: serviceId, userId } })
}

export async function findOwnedEvent(userId: string, eventId: string) {
  return prisma.event.findFirst({ where: { id: eventId, userId }, include: { service: true } })
}

export function buildEventWhere(
  userId: string,
  filters: {
    from?: string | null
    to?: string | null
    serviceId?: string | null
    status?: string | null
  },
): Prisma.EventWhereInput {
  const where: Prisma.EventWhereInput = { userId }

  if (filters.serviceId) where.serviceId = filters.serviceId
  if (filters.status) where.status = filters.status as Prisma.EnumEventStatusFilter['equals']

  if (filters.from || filters.to) {
    where.startTime = {}
    if (filters.from) where.startTime.gte = new Date(filters.from)
    if (filters.to) where.startTime.lte = new Date(filters.to)
  }

  return where
}

export async function ensureEventFitsService(
  userId: string,
  data: { serviceId: string | null; startTime: Date; endTime: Date },
  excludeEventId?: string,
): Promise<Service | null> {
  if (!data.serviceId) return null

  const service = await findOwnedService(userId, data.serviceId)
  if (!service) throw new Error('Service not found')
  if (!service.isActive) throw new Error('Service is inactive')

  const schedule = normalizeSchedule(service.schedule)
  const dayConfig = schedule[String(data.startTime.getDay())]

  if (!dayConfig?.active || !dayConfig.start || !dayConfig.end) {
    throw new Error('Service is not available on the selected day')
  }

  if (!isSameDay(data.startTime, data.endTime)) {
    throw new Error('Events must start and end on the same day')
  }

  const dayStart = combineDateAndTime(data.startTime, dayConfig.start)
  const dayEnd = combineDateAndTime(data.startTime, dayConfig.end)
  const eventBlockedEnd = addMinutes(data.endTime, service.bufferTime)

  if (data.startTime < dayStart || eventBlockedEnd > dayEnd) {
    throw new Error('Event is outside the service schedule')
  }

  const overlapCount = await prisma.event.count({
    where: {
      userId,
      id: excludeEventId ? { not: excludeEventId } : undefined,
      status: { not: 'CANCELLED' },
      startTime: { lt: eventBlockedEnd },
      endTime: { gt: data.startTime },
    },
  })

  if (overlapCount >= service.maxBookings) {
    throw new Error('Selected slot is no longer available')
  }

  return service
}

export function sortEvents(events: Pick<Event, 'startTime'>[]) {
  return [...events].sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
}
