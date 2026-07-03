import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import RegistrationsClient from './RegistrationsClient'

export default async function RegistrationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const [{ data: event }, { data: regs }] = await Promise.all([
    supabase.from('events').select('title, capacity').eq('id', id).single(),
    supabase.from('event_registrations').select('*').eq('event_id', id).order('created_at'),
  ])
  if (!event) notFound()
  return (
    <div>
      <h1 className="font-serif text-2xl text-[var(--charcoal)] mb-2">{event.title}</h1>
      <p className="text-sm text-[var(--gray)] mb-8">報名名單</p>
      <RegistrationsClient eventId={id} initialData={regs ?? []} capacity={event.capacity} />
    </div>
  )
}
