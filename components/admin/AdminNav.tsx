'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, Building2, Package, ClipboardList,
  CalendarDays, Users, ImageIcon, LogOut
} from 'lucide-react'

const navItems = [
  { href: '/admin', label: '總覽', icon: LayoutDashboard, exact: true },
  { href: '/admin/venues', label: '場地管理', icon: Building2 },
  { href: '/admin/addons', label: '加購品項', icon: Package },
  { href: '/admin/rental-requests', label: '租借申請', icon: ClipboardList },
  { href: '/admin/events', label: '活動管理', icon: CalendarDays },
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
    <nav className="w-52 min-h-screen bg-[var(--card-bg)] border-r border-[var(--border-color)] flex flex-col">
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
  )
}
