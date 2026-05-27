import { getSessionUser } from '@/lib/auth'
import { error, json, options } from '@/lib/http'
import { prisma } from '@/lib/prisma'

export const OPTIONS = options

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser()
  if (!user) return error('Unauthorized', 401)
  const { id } = await params

  const token = await prisma.userToken.findFirst({ where: { id, userId: user.id } })
  if (!token) return error('Token not found', 404)

  await prisma.userToken.delete({ where: { id } })
  return json({ success: true })
}
