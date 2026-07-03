'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`)
      } else {
        setChecking(false)
      }
    })
  }, [pathname, router])

  if (checking) return (
    <div className="min-h-screen flex items-center justify-center text-[var(--gray)] text-sm">
      驗證中…
    </div>
  )
  return <>{children}</>
}
