import { createClient } from '@/lib/supabase/server'
import AddonsClient from './AddonsClient'

export default async function AddonsPage() {
  const supabase = await createClient()
  const { data: addons, error } = await supabase
    .from('venue_addons')
    .select('*')
    .order('sort_order')
  if (error) console.error('[admin/addons] list query failed:', error)
  return (
    <div>
      <h1 className="font-serif text-2xl text-[var(--charcoal)] mb-8">加購品項管理</h1>
      <AddonsClient initialData={addons ?? []} />
    </div>
  )
}
