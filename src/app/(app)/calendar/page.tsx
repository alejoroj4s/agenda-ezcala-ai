import { endOfWeek, endOfMonth, startOfMonth, startOfWeek } from 'date-fns'

import { CalendarApp } from '@/components/calendar/calendar-app'
import { requireSessionUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { serializeEvent, serializeService, serializeUser } from '@/lib/serializers'

export default async function CalendarPage() {
  const user = await requireSessionUser()
  const now = new Date()
  const from = startOfWeek(startOfMonth(now), { weekStartsOn: 0 })
  const to = endOfWeek(endOfMonth(now), { weekStartsOn: 0 })

  const [services, events] = await Promise.all([
    prisma.service.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'asc' } }),
    prisma.event.findMany({
      where: { userId: user.id, startTime: { gte: from, lte: to } },
      include: { service: true },
      orderBy: { startTime: 'asc' },
    }),
  ])

  return (
    <CalendarApp
      initialEvents={events.map(serializeEvent)}
      initialServices={services.map(serializeService)}
      user={serializeUser(user)}
    />
  )
}
