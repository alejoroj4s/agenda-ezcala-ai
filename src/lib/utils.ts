import { type ClassValue, clsx } from 'clsx'
import { format } from 'date-fns'
import { twMerge } from 'tailwind-merge'

import type { EventStatus, WeeklySchedule } from '@/types'
import { DEFAULT_SERVICE_COLOR } from './constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const weekDays = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

export const timeOptions = Array.from({ length: 24 * 2 }, (_, index) => {
  const hours = Math.floor(index / 2)
  const minutes = index % 2 === 0 ? '00' : '30'
  const value = `${String(hours).padStart(2, '0')}:${minutes}`

  return {
    value,
    label: format(new Date(`2000-01-01T${value}:00`), 'h:mm a'),
  }
})

export const defaultWeeklySchedule: WeeklySchedule = {
  '0': { active: false, start: '09:00', end: '17:00' },
  '1': { active: true, start: '09:00', end: '17:00' },
  '2': { active: true, start: '09:00', end: '17:00' },
  '3': { active: true, start: '09:00', end: '17:00' },
  '4': { active: true, start: '09:00', end: '17:00' },
  '5': { active: true, start: '09:00', end: '17:00' },
  '6': { active: false, start: '09:00', end: '17:00' },
}

export function cloneSchedule(schedule?: WeeklySchedule | null) {
  const source = schedule ?? defaultWeeklySchedule

  return Object.fromEntries(
    Object.entries(defaultWeeklySchedule).map(([day, value]) => {
      const current = source[day] ?? value
      return [day, { ...value, ...current }]
    }),
  ) as WeeklySchedule
}

export function normalizeSchedule(schedule: unknown): WeeklySchedule {
  if (!schedule || typeof schedule !== 'object' || Array.isArray(schedule)) {
    return cloneSchedule()
  }

  return cloneSchedule(schedule as WeeklySchedule)
}

export function parseTimeToMinutes(value?: string) {
  if (!value) return 0
  const [hours = '0', minutes = '0'] = value.split(':')
  return Number(hours) * 60 + Number(minutes)
}

export function combineDateAndTime(date: Date, time = '00:00') {
  const [hours = '0', minutes = '0'] = time.split(':')
  const next = new Date(date)
  next.setHours(Number(hours), Number(minutes), 0, 0)
  return next
}

export function toDatetimeLocal(date?: Date | string | null) {
  if (!date) return ''
  const value = typeof date === 'string' ? new Date(date) : date
  const offset = value.getTimezoneOffset()
  const local = new Date(value.getTime() - offset * 60_000)
  return local.toISOString().slice(0, 16)
}

export function fromDatetimeLocal(value: string) {
  return value ? new Date(value) : new Date()
}

export function formatDateTime(value?: Date | string | null, pattern = 'PPp') {
  if (!value) return ''
  return format(typeof value === 'string' ? new Date(value) : value, pattern)
}

export function formatTimeRange(start: Date | string, end: Date | string) {
  const startDate = typeof start === 'string' ? new Date(start) : start
  const endDate = typeof end === 'string' ? new Date(end) : end
  return `${format(startDate, 'p')} - ${format(endDate, 'p')}`
}

export function getEventColor(color?: string | null, fallback = DEFAULT_SERVICE_COLOR) {
  return color || fallback
}

export function getStatusBadgeVariant(status: EventStatus) {
  switch (status) {
    case 'COMPLETED':
      return 'secondary'
    case 'CANCELLED':
      return 'destructive'
    case 'NO_SHOW':
      return 'outline'
    default:
      return 'default'
  }
}

export function getInitials(name?: string | null) {
  if (!name) return 'AE'
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || 'AE'
}
