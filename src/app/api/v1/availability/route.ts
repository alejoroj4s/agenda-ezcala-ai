import { endOfDay, startOfDay } from 'date-fns'

import { getApiAuthContext } from '@/lib/auth'
import { calculateAvailability } from '@/lib/scheduling'
import { error, json, options } from '@/lib/http'
import { prisma } from '@/lib/prisma'

export const OPTIONS = options

export async function GET(request: Request) {
  const auth = await getApiAuthContext(request)
  if (!auth) return error('Unauthorized', 401)

  const url = new URL(request.url)
  const serviceId = url.searchParams.get('service_id')
  const dateParam = url.searchParams.get('date')

  if (!serviceId || !dateParam) {
    return error('service_id and date are required', 400)
  }

  const date = new Date(`${dateParam}T00:00:00`)
  if (Number.isNaN(date.getTime())) {
    return error('Invalid date format. Use YYYY-MM-DD', 400)
  }

  const service = await prisma.service.findFirst({ where: { id: serviceId, userId: auth.user.id } })
  if (!service) return error('Service not found', 404)

  const events = await prisma.event.findMany({
    where: {
      userId: auth.user.id,
      startTime: { lt: endOfDay(date) },
      endTime: { gt: startOfDay(date) },
    },
    select: { startTime: true, endTime: true, status: true },
  })

  return json({ slots: calculateAvailability(service, date, events) })
}
