// Note: this Map is process-local. In Vercel serverless, each instance has its own
// copy, so limits are per-instance rather than global. For the email endpoint,
// booking-level validation in route.ts provides the real protection. This limiter
// still catches burst abuse within a single warm instance (e.g. the availability API).
const requests = new Map<string, { count: number; reset: number }>()
let lastCleanup = Date.now()

export function rateLimit(ip: string, limit = 10, windowMs = 60_000): { ok: boolean; remaining: number } {
  const now = Date.now()

  // Purge expired entries every 5 minutes to prevent unbounded memory growth
  if (now - lastCleanup > 300_000) {
    for (const [key, entry] of requests) {
      if (now > entry.reset) requests.delete(key)
    }
    lastCleanup = now
  }

  const entry = requests.get(ip)

  if (!entry || now > entry.reset) {
    requests.set(ip, { count: 1, reset: now + windowMs })
    return { ok: true, remaining: limit - 1 }
  }

  if (entry.count >= limit) {
    return { ok: false, remaining: 0 }
  }

  entry.count++
  return { ok: true, remaining: limit - entry.count }
}
