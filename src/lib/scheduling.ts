import { addMinutes, isBefore, isEqual } from 'date-fns'
import type { Event, Service } from '@prisma/client'

import type { AvailabilitySlot } from '@/types'
import { combineDateAndTime, normalizeSchedule } from './utils'

function overlaps(start: Date, end: Date, compareStart: Date, compareEnd: Date) {
  return start < compareEnd && compareStart < end
}

export function calculateAvailability(
  service: Pick<Service, 'duration' | 'bufferTime' | 'maxBookings' | 'schedule'>,
  date: Date,
  events: Pick<Event, 'startTime' | 'endTime' | 'status'>[],
): AvailabilitySlot[] {
  const schedule = normalizeSchedule(service.schedule)
  const day = schedule[String(date.getDay())]

  if (!day?.active || !day.start || !day.end) {
    return []
  }

  const dayStart = combineDateAndTime(date, day.start)
  const dayEnd = combineDateAndTime(date, day.end)
  const slots: AvailabilitySlot[] = []

  let cursor = new Date(dayStart)

  while (isBefore(cursor, dayEnd) || isEqual(cursor, dayEnd)) {
    const slotEnd = addMinutes(cursor, service.duration)
    const blockedUntil = addMinutes(slotEnd, service.bufferTime)

    if (blockedUntil > dayEnd) {
      break
    }

    const overlapping = events.filter((event) => {
      if (event.status === 'CANCELLED') return false
      const eventBlockedUntil = addMinutes(new Date(event.endTime), service.bufferTime)
      return overlaps(cursor, blockedUntil, new Date(event.startTime), eventBlockedUntil)
    })

    if (overlapping.length < service.maxBookings) {
      slots.push({
        start: cursor.toISOString(),
        end: slotEnd.toISOString(),
      })
    }

    cursor = addMinutes(cursor, service.duration)
  }

  return slots
}
