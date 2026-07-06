import { createClient } from '@/lib/supabase/server'
import EventForm from '../EventForm'

export default async function NewEventPage() {
  const supabase = await createClient()
  const { data: venues } = await supabase.from('venues').select('id, name').eq('is_active', true)
  return (
    <div>
      <h1 className="font-serif text-2xl text-[var(--charcoal)] mb-8">新增活動</h1>
      <EventForm venues={venues ?? []} />
    </div>
  )
}
