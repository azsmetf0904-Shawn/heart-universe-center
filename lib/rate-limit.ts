type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

/**
 * Small in-process limiter for public endpoints. Vercel may run more than one
 * instance, so this is intentionally a first line of defence; production can
 * swap the implementation for a shared store without changing callers.
 */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  const current = buckets.get(key)
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, ok: true, remaining: limit - 1, retryAfter: 0 }
  }
  if (current.count >= limit) {
    return { allowed: false, ok: false, remaining: 0, retryAfter: Math.ceil((current.resetAt - now) / 1000) }
  }
  current.count += 1
  return { allowed: true, ok: true, remaining: limit - current.count, retryAfter: 0 }
}

export function requestIp(req: Request) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? 'unknown'
}
