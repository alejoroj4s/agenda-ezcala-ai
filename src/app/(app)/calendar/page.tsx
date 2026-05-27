import { CalendarApp } from '@/components/calendar/calendar-app'
import { requireSessionUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { serializeService, serializeUser } from '@/lib/serializers'

export default async function CalendarPage() {
  const user = await requireSessionUser()

  // Only SSR services (no timezone-sensitive data).
  // Events are always fetched client-side so date formatting
  // uses the user's local timezone instead of the server's UTC.
  const services = await prisma.service.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' },
  })

  return (
    <CalendarApp
      initialEvents={[]}
      initialServices={services.map(serializeService)}
      user={serializeUser(user)}
    />
  )
}
