import { getSessionUser } from '@/lib/auth'
import { error, json, options } from '@/lib/http'
import { serializeUser } from '@/lib/serializers'

export const OPTIONS = options

export async function GET() {
  const user = await getSessionUser()
  if (!user) return error('Unauthorized', 401)
  return json({ user: serializeUser(user) })
}
