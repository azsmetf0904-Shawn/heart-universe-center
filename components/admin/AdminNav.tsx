'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, Building2, Package, ClipboardList,
  CalendarDays, LogOut
} from 'lucide-react'

const navItems = [
  { href: '/admin', label: '總覽', icon: LayoutDashboard, exact: true },
  { href: '/admin/rental-requests', label: '租借申請', icon: ClipboardList },
  { href: '/admin/events', label: '活動管理', icon: CalendarDays },
  { href: '/admin/venues', label: '場地管理', icon: Building2 },
  { href: '/admin/addons', label: '加購品項', icon: Package },
]

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <>
      {/* 手機版：頂部 Header + 橫向 Tabs */}
      <div className="md:hidden flex flex-col" style={{ background: '#1C1008' }}>
        <div className="flex items-center justify-between px-4 py-3">
          <p className="font-serif text-sm tracking-widest" style={{ color: '#C4A038' }}>心宇宙後台</p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-[10px] transition-colors"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            <LogOut size={11} /> 登出
          </button>
        </div>
        <div className="flex overflow-x-auto" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', scrollbarWidth: 'none' }}>
          {navItems.map(item => {
            const active = isActive(item.href, item.exact)
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex-shrink-0 px-4 py-2.5 text-[11px] tracking-wide whitespace-nowrap transition-colors"
                style={{
                  color: active ? '#C4A038' : 'rgba(255,255,255,0.45)',
                  borderBottom: active ? '2px solid #C4A038' : '2px solid transparent',
                }}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* 桌機版：左側欄 */}
      <nav className="hidden md:flex w-52 min-h-screen bg-[var(--card-bg)] border-r border-[var(--border-color)] flex-col">
        <div className="p-6 border-b border-[var(--border-color)]">
          <p className="font-serif text-sm text-[var(--charcoal)]">心宇宙後台</p>
          <p className="text-[10px] text-[var(--gray)] tracking-widest mt-0.5">Admin Panel</p>
        </div>
        <div className="flex-1 py-4">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                isActive(item.href, item.exact)
                  ? 'text-[var(--gold)] bg-[var(--surface)]'
                  : 'text-[var(--gray)] hover:text-[var(--charcoal)]'
              }`}
            >
              <item.icon size={15} />
              {item.label}
            </Link>
          ))}
        </div>
        <div className="p-4 border-t border-[var(--border-color)]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs text-[var(--gray)] hover:text-red-500 transition-colors w-full"
          >
            <LogOut size={13} /> 登出
          </button>
        </div>
      </nav>
    </>
  )
}
