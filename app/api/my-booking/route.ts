import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { rateLimit, requestIp } from '@/lib/rate-limit'

// ILIKE 的 % 和 _ 是萬用字元，使用者輸入必須跳脫成字面值，
// 否則送 "%@%" 這種字串會比對到資料表裡每一筆有 @ 的 email，
// 等於未經授權就能撈出全部客戶的預約紀錄。
function escapeIlike(input: string): string {
  return input.replace(/[\\%_]/g, ch => `\\${ch}`)
}

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
    ? supabase.from('rental_requests').select(select).ilike('email', escapeIlike(trimmed))
    : Promise.resolve({ data: [], error: null })
  const [{ data: phoneData, error: phoneError }, { data: emailData, error: emailError }] = await Promise.all([phoneQuery, emailQuery])
  if (phoneError) console.error('[my-booking] phone lookup failed:', phoneError)
  if (emailError) console.error('[my-booking] email lookup failed:', emailError)
  const data = [...(phoneData ?? []), ...(emailData ?? [])]
    .filter((row, index, all) => all.findIndex(other => other.id === row.id) === index)
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))

  return NextResponse.json({ data: data ?? [] })
}
