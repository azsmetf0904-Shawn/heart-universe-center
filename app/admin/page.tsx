import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ClipboardList, CalendarDays, Users, Package } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const [
    { count: pendingRentals },
    { count: todayEvents },
    { count: totalRegistrations },
    { count: pendingAddons },
  ] = await Promise.all([
    supabase.from('rental_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('events').select('*', { count: 'exact', head: true }).gte('start_time', today).lt('start_time', today + 'T23:59:59'),
    supabase.from('event_registrations').select('*', { count: 'exact', head: true }).eq('status', 'registered'),
    supabase.from('rental_requests').select('*', { count: 'exact', head: true }).in('status', ['pending', 'confirmed']),
  ])

  const stats = [
    { label: '待確認租借', value: pendingRentals ?? 0, icon: ClipboardList, href: '/admin/rental-requests' },
    { label: '今日活動', value: todayEvents ?? 0, icon: CalendarDays, href: '/admin/events' },
    { label: '活動報名總數', value: totalRegistrations ?? 0, icon: Users, href: '/admin/events' },
    { label: '進行中租借', value: pendingAddons ?? 0, icon: Package, href: '/admin/rental-requests' },
  ]

  return (
    <div>
      <h1 className="font-serif text-2xl text-[var(--charcoal)] mb-8">總覽</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map(s => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-[var(--cream)] border border-[var(--border-color)] p-6 hover:border-[var(--gold)] transition-colors"
          >
            <s.icon size={18} className="text-[var(--gold)] mb-3" />
            <p className="text-2xl font-medium text-[var(--charcoal)] mb-1">{s.value}</p>
            <p className="text-xs text-[var(--gray)]">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[var(--cream)] border border-[var(--border-color)] p-6">
          <p className="label-tag mb-4">快速入口</p>
          <div className="flex flex-col gap-3">
            {[
              { href: '/admin/events', label: '新增活動' },
              { href: '/admin/rental-requests', label: '查看租借申請' },
              { href: '/admin/venues', label: '管理場地' },
              { href: '/admin/addons', label: '管理加購品項' },
            ].map(l => (
              <Link key={l.href} href={l.href} className="text-sm text-[var(--charcoal)] hover:text-[var(--gold)] transition-colors">
                → {l.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="bg-[var(--cream)] border border-[var(--border-color)] p-6">
          <p className="label-tag mb-4">前台連結</p>
          <div className="flex flex-col gap-3">
            {[
              { href: '/', label: '首頁' },
              { href: '/venues', label: '場地介紹' },
              { href: '/events', label: '活動課程' },
              { href: '/rent', label: '租借申請' },
            ].map(l => (
              <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--gray)] hover:text-[var(--charcoal)] transition-colors">
                ↗ {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
