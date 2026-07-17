import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

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
  const { query } = await req.json()
  const trimmed = String(query ?? '').trim()
  if (!trimmed) return NextResponse.json({ data: [] })

  const supabase = await createAdminClient()
  const filters: string[] = []

  const phones = phoneVariants(trimmed)
  phones.forEach(p => filters.push(`phone.eq.${p}`))

  if (trimmed.includes('@')) {
    filters.push(`email.eq.${trimmed}`)
    const lower = trimmed.toLowerCase()
    if (lower !== trimmed) filters.push(`email.eq.${lower}`)
  }

  if (filters.length === 0) {
    filters.push(`phone.eq.${trimmed}`, `email.eq.${trimmed}`)
  }

  const { data } = await supabase
    .from('rental_requests')
    .select('*, venue:venues(name)')
    .or(filters.join(','))
    .order('created_at', { ascending: false })

  return NextResponse.json({ data: data ?? [] })
}
