import { createClient } from '@/lib/supabase/server'
import RentalRequestsClient from './RentalRequestsClient'
import { AdminCalendar } from '@/components/AdminCalendar'

export default async function RentalRequestsPage() {
  const supabase = await createClient()
  const { data: requests } = await supabase
    .from('rental_requests')
    .select('*, venue:venues(name), rental_addons(*, venue_addons(name, price, unit))')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="font-serif text-2xl text-[var(--charcoal)] mb-8">租借申請管理</h1>

      {/* Calendar overview */}
      <div className="mb-10 p-6 border border-[var(--border-color)]" style={{ background: 'var(--cream)' }}>
        <p className="text-[10px] tracking-[0.4em] uppercase mb-4" style={{ color: 'var(--gold)' }}>月曆視圖</p>
        <AdminCalendar />
      </div>

      {/* List */}
      <p className="text-[10px] tracking-[0.4em] uppercase mb-4" style={{ color: 'var(--gold)' }}>申請列表</p>
      <RentalRequestsClient initialData={requests ?? []} />
    </div>
  )
}
