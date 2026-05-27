import { NextResponse } from 'next/server'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export function withCors(response: NextResponse) {
  Object.entries(CORS_HEADERS).forEach(([key, value]) => response.headers.set(key, value))
  return response
}

export function json(data: unknown, init?: ResponseInit) {
  return withCors(NextResponse.json(data, init))
}

export function error(message: string, status = 400, details?: unknown) {
  return json({ error: message, details }, { status })
}

export function options() {
  return withCors(new NextResponse(null, { status: 204 }))
}
