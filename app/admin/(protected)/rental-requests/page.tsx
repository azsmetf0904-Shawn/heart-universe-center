import { createClient } from '@/lib/supabase/server'
import RentalRequestsClient from './RentalRequestsClient'

export default async function RentalRequestsPage() {
  const supabase = await createClient()
  const { data: requests } = await supabase
    .from('rental_requests')
    .select('*, venue:venues(name), rental_addons(*, venue_addons(name, price, unit))')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="font-serif text-2xl text-[var(--charcoal)] mb-8">租借申請管理</h1>
      <RentalRequestsClient initialData={requests ?? []} />
    </div>
  )
}
