import { createClient } from '@/lib/supabase/server'
import VenuesAdminClient from './VenuesAdminClient'

export default async function AdminVenuesPage() {
  const supabase = await createClient()
  const { data: venues } = await supabase
    .from('venues')
    .select('*, venue_photos(id, image_url, sort_order), venue_pricing(*)')
    .order('created_at')
  return (
    <div>
      <h1 className="font-serif text-2xl text-[var(--charcoal)] mb-8">場地管理</h1>
      <VenuesAdminClient initialData={venues ?? []} />
    </div>
  )
}
