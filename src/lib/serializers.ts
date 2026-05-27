import type { Event, Service, UserToken } from '@prisma/client'

import { normalizeSchedule } from './utils'

export function serializeUser<T extends { createdAt?: Date; updatedAt?: Date }>(user: T) {
  return {
    ...user,
    createdAt: user.createdAt?.toISOString(),
    updatedAt: user.updatedAt?.toISOString(),
  }
}

export function serializeService(service: Service) {
  return {
    ...service,
    schedule: normalizeSchedule(service.schedule),
    createdAt: service.createdAt.toISOString(),
    updatedAt: service.updatedAt.toISOString(),
  }
}

export function serializeEvent(event: Event & { service?: Service | null }) {
  return {
    ...event,
    startTime: event.startTime.toISOString(),
    endTime: event.endTime.toISOString(),
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
    service: event.service ? serializeService(event.service) : event.service,
  }
}

export function serializeToken(token: UserToken) {
  return {
    ...token,
    expiresAt: token.expiresAt?.toISOString() ?? null,
    createdAt: token.createdAt.toISOString(),
  }
}
