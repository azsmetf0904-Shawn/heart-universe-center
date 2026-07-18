import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import EventsAdminClient from './EventsAdminClient'

export default async function AdminEventsPage() {
  const supabase = await createClient()
  const { data: events } = await supabase
    .from('events')
    .select('*, venue:venues(name), event_registrations(id, status)')
    .order('start_time', { ascending: false })
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-2xl text-[var(--charcoal)]">活動管理</h1>
        <Link href="/admin/events/new" className="text-sm px-4 py-2 bg-[var(--gold)] text-white hover:bg-[var(--gold-dark)] transition-colors">
          + 新增活動
        </Link>
      </div>
      <EventsAdminClient initialData={events ?? []} />
    </div>
  )
}
