import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { rateLimit, requestIp } from '@/lib/rate-limit'

// Normalise Taiwanese phone to multiple candidate formats
function phoneVariants(input: string): string[] {
  const stripped = input.replace(/[\s-]/g, '')
  const digits = stripped.replace(/\D/g, '')
  const set = new Set<string>()
  if (!digits) return []

  set.add(digits)
  if (digits.startsWith('886') && digits.length >= 11) {
    const local = `0${digits.slice(3)}`
    set.add(local)
    if (local.startsWith('09') && local.length === 10) set.add(local.slice(1))
  }
  if (digits.startsWith('09') && digits.length === 10) set.add(digits.slice(1))
  if (digits.startsWith('9') && digits.length === 9) set.add(`0${digits}`)
  return Array.from(set)
}

export async function POST(req: NextRequest) {
  const limiter = rateLimit(`my-booking:${requestIp(req)}`, 5, 60_000)
  if (!limiter.allowed) {
    return NextResponse.json({ data: [], error: 'rate_limited' }, { status: 429, headers: { 'Retry-After': String(limiter.retryAfter) } })
  }

  const { query } = await req.json() as { query?: unknown }
  const trimmed = String(query ?? '').trim()
  if (!trimmed) return NextResponse.json({ data: [] })

  const supabase = await createAdminClient()
  const phones = phoneVariants(trimmed)
  const select = 'id, name, event_title, booking_date, time_slot, time_slots, session_count, layout_config, status, created_at, payment_reported_at, venue:venues(name)'
  const phoneQuery = phones.length
    ? supabase.from('rental_requests').select(select).in('phone', phones)
    : Promise.resolve({ data: [], error: null })
  const emailQuery = trimmed.includes('@')
    ? supabase.from('rental_requests').select(select).ilike('email', trimmed)
    : Promise.resolve({ data: [], error: null })
  const [{ data: phoneData }, { data: emailData }] = await Promise.all([phoneQuery, emailQuery])
  const data = [...(phoneData ?? []), ...(emailData ?? [])]
    .filter((row, index, all) => all.findIndex(other => other.id === row.id) === index)
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))

  return NextResponse.json({ data: data ?? [] })
}
