import { getApiAuthContext } from '@/lib/auth'
import { error, json, options } from '@/lib/http'
import { serializeUser } from '@/lib/serializers'

export const OPTIONS = options

export async function GET(request: Request) {
  const auth = await getApiAuthContext(request)
  if (!auth) return error('Unauthorized', 401)

  return json({
    user: serializeUser(auth.user),
    token: auth.token
      ? {
          ...auth.token,
          expiresAt: auth.token.expiresAt?.toISOString() ?? null,
          createdAt: auth.token.createdAt.toISOString(),
        }
      : null,
    tokenType: auth.tokenType,
  })
}
