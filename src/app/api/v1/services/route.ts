import { getApiAuthContext } from '@/lib/auth'
import { error, json, options } from '@/lib/http'
import { prisma } from '@/lib/prisma'
import { serializeService } from '@/lib/serializers'

export const OPTIONS = options

export async function GET(request: Request) {
  const auth = await getApiAuthContext(request)
  if (!auth) return error('Unauthorized', 401)

  const services = await prisma.service.findMany({ where: { userId: auth.user.id }, orderBy: { createdAt: 'asc' } })
  return json({ services: services.map(serializeService) })
}
