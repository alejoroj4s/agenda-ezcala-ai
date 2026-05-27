import { EventStatus, Prisma } from '@prisma/client'

import { DEFAULT_SERVICE_COLOR } from './constants'
import { normalizeSchedule } from './utils'

function asString(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function asOptionalString(value: unknown) {
  const parsed = asString(value).trim()
  return parsed ? parsed : null
}

function asNumber(value: unknown, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function asBoolean(value: unknown, fallback: boolean) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    if (value === 'true') return true
    if (value === 'false') return false
  }
  return fallback
}

export function parseServicePayload(payload: Record<string, unknown>) {
  const name = asString(payload.name).trim()
  if (!name) throw new Error('Service name is required')

  return {
    name,
    description: asOptionalString(payload.description),
    duration: Math.max(15, asNumber(payload.duration, 60)),
    bufferTime: Math.max(0, asNumber(payload.bufferTime ?? payload.buffer_time, 0)),
    color: asString(payload.color).trim() || DEFAULT_SERVICE_COLOR,
    maxBookings: Math.max(1, asNumber(payload.maxBookings ?? payload.max_bookings_per_slot, 1)),
    isActive: asBoolean(payload.isActive ?? payload.is_active, true),
    schedule: normalizeSchedule(payload.schedule) as unknown as Prisma.InputJsonValue,
  }
}

export function parseEventPayload(payload: Record<string, unknown>) {
  const title = asString(payload.title).trim()
  if (!title) throw new Error('Event title is required')

  const startRaw = asString(payload.startTime ?? payload.start_time)
  const endRaw = asString(payload.endTime ?? payload.end_time)
  const startTime = new Date(startRaw)
  const endTime = new Date(endRaw)

  if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
    throw new Error('Valid start_time and end_time are required')
  }

  if (endTime <= startTime) {
    throw new Error('end_time must be after start_time')
  }

  const statusValue = asString(payload.status).toUpperCase() || EventStatus.SCHEDULED
  if (!Object.values(EventStatus).includes(statusValue as EventStatus)) {
    throw new Error('Invalid event status')
  }

  const serviceId = asOptionalString(payload.serviceId ?? payload.service_id)

  return {
    title,
    description: asOptionalString(payload.description),
    serviceId,
    startTime,
    endTime,
    attendeeName: asOptionalString(payload.attendeeName ?? payload.attendee_name),
    attendeeEmail: asOptionalString(payload.attendeeEmail ?? payload.attendee_email),
    attendeePhone: asOptionalString(payload.attendeePhone ?? payload.attendee_phone),
    status: statusValue as EventStatus,
    notes: asOptionalString(payload.notes),
    color: asOptionalString(payload.color),
  }
}
