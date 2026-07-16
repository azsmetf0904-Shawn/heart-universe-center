import Link from 'next/link'

type TabKey = 'events' | 'showcase' | 'news'

const tabs: Array<{ key: TabKey; href: string; label: string }> = [
  { key: 'events', href: '/events', label: '即將到來' },
  { key: 'showcase', href: '/showcase', label: '活動回顧' },
  { key: 'news', href: '/news', label: '媒體連結' },
]

export default function PageTabs({ active }: { active: TabKey }) {
  return (
    <div className="border-b border-[var(--border-color)] mb-8">
      <div className="container-narrow">
        <div className="flex gap-1">
          {tabs.map(tab => {
            const isActive = tab.key === active
            return (
              <Link
                key={tab.key}
                href={tab.href}
                className={`px-4 py-2 text-xs tracking-widest border-b-2 transition-colors ${
                  isActive
                    ? 'border-[var(--gold)] text-[var(--charcoal)]'
                    : 'border-transparent text-[var(--gray)] hover:border-[var(--border-color)]'
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
