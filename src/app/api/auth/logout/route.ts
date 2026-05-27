import { clearSessionCookie } from '@/lib/auth'
import { json, options } from '@/lib/http'

export const OPTIONS = options

export async function POST() {
  return clearSessionCookie(json({ success: true }))
}
