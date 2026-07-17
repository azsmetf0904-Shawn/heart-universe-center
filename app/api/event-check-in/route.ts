import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { eventSlug, query } = await req.json()
  if (!eventSlug || !query?.trim()) {
    return NextResponse.json({ result: 'notfound' })
  }

  const supabase = await createAdminClient()

  const { data: event } = await supabase
    .from('events').select('id').eq('slug', eventSlug).single()
  if (!event) return NextResponse.json({ result: 'notfound' })

  const q = query.trim()
  const { data: reg } = await supabase
    .from('event_registrations')
    .select('id, name, checked_in, status')
    .eq('event_id', event.id)
    .eq('status', 'registered')
    .or(`phone.eq.${q},email.eq.${q}`)
    .maybeSingle()

  if (!reg) return NextResponse.json({ result: 'notfound' })
  if (reg.checked_in) return NextResponse.json({ result: 'already', name: reg.name })

  await supabase
    .from('event_registrations')
    .update({ checked_in: true, checked_in_at: new Date().toISOString() })
    .eq('id', reg.id)

  return NextResponse.json({ result: 'success', name: reg.name })
}
