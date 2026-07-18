import { createHmac, timingSafeEqual } from 'crypto'

const CALENDAR_TOKEN_TTL_MS = 24 * 60 * 60 * 1000

function secret() {
  return process.env.LINE_NOTIFY_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
}

export function signCalendarToken(): { token: string; expires: number } | null {
  const key = secret()
  if (!key) return null
  const expires = Date.now() + CALENDAR_TOKEN_TTL_MS
  const token = createHmac('sha256', key).update(`calendar:${expires}`).digest('hex')
  return { token, expires }
}

export function verifyCalendarToken(token: string | undefined, expires: string | undefined): boolean {
  const key = secret()
  if (!key || !token || !expires) return false
  const expiresNum = Number(expires)
  if (!Number.isFinite(expiresNum) || expiresNum < Date.now()) return false
  const expected = createHmac('sha256', key).update(`calendar:${expiresNum}`).digest('hex')
  if (token.length !== expected.length) return false
  return timingSafeEqual(Buffer.from(token), Buffer.from(expected))
}
