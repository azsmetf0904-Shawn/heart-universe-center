import AdminGuard from '@/components/admin/AdminGuard'
import AdminNav from '@/components/admin/AdminNav'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-[var(--surface)] flex flex-col md:flex-row">
        <AdminNav />
        <main className="flex-1 p-4 md:p-8 overflow-auto">{children}</main>
      </div>
    </AdminGuard>
  )
}
