export type EventStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
export type CalendarView = 'month' | 'week' | 'day' | 'list'

export interface DailySchedule {
  active: boolean
  start?: string
  end?: string
}

export type WeeklySchedule = Record<string, DailySchedule>

export interface UserProfile {
  id: string
  name: string
  email: string
  createdAt?: string
  updatedAt?: string
}

export interface ServiceItem {
  id: string
  userId: string
  name: string
  description: string | null
  duration: number
  bufferTime: number
  color: string
  maxBookings: number
  isActive: boolean
  schedule: WeeklySchedule
  createdAt: string
  updatedAt: string
}

export interface CalendarEvent {
  id: string
  userId: string
  serviceId: string | null
  service?: ServiceItem | null
  title: string
  description: string | null
  startTime: string
  endTime: string
  attendeeName: string | null
  attendeeEmail: string | null
  attendeePhone: string | null
  status: EventStatus
  notes: string | null
  color: string | null
  createdAt: string
  updatedAt: string
}

export interface ApiTokenItem {
  id: string
  token: string
  label: string | null
  expiresAt: string | null
  createdAt: string
}

export interface AvailabilitySlot {
  start: string
  end: string
}
