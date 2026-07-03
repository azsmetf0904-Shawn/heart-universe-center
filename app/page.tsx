import Link from 'next/link'
import { ArrowRight, MapPin, Users, Clock } from 'lucide-react'

const features = [
  { icon: MapPin, title: '台北八德路', desc: '交通便利，捷運步行可達' },
  { icon: Users, title: '多元空間', desc: '大教室 · 活動空間，彈性佈置' },
  { icon: Clock, title: '彈性時段', desc: '依需求選定日期與時段，人工確認' },
]

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center bg-[var(--surface)]">
        <div className="container-narrow w-full py-24">
          <p className="label-tag mb-6">Heart Universe Business Center</p>
          <h1 className="text-5xl md:text-7xl text-[var(--charcoal)] leading-tight mb-6">
            心宇宙<br />商務中心
          </h1>
          <div className="gold-divider" />
          <p className="text-[var(--gray)] text-lg leading-relaxed mt-6 mb-10 max-w-md">
            台北八德路精品場地空間<br />
            場地租借 · 課程活動 · 活動紀錄
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/rent"
              className="inline-flex items-center gap-2 px-8 py-3 bg-[var(--gold)] text-white text-sm tracking-widest hover:bg-[var(--gold-dark)] transition-colors"
            >
              租借申請 <ArrowRight size={14} />
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-8 py-3 border border-[var(--charcoal)] text-[var(--charcoal)] text-sm tracking-widest hover:bg-[var(--charcoal)] hover:text-white transition-all"
            >
              活動課程 <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-[var(--cream)]">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map(f => (
              <div key={f.title} className="flex flex-col">
                <f.icon size={20} className="text-[var(--gold)] mb-4" />
                <h3 className="text-lg text-[var(--charcoal)] mb-2">{f.title}</h3>
                <p className="text-sm text-[var(--gray)] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Space teaser */}
      <section className="py-24 bg-[var(--card-bg)]">
        <div className="container-narrow">
          <p className="label-tag mb-4">Venue</p>
          <h2 className="text-3xl md:text-4xl mb-4">精品場地空間</h2>
          <div className="gold-divider" />
          <p className="text-[var(--gray)] text-sm leading-relaxed mt-6 mb-8 max-w-lg">
            寬敞明亮的多功能空間，提供彈性座位配置，適合課程講座、企業培訓、小型展覽、社群聚會。
          </p>
          <Link
            href="/venues"
            className="inline-flex items-center gap-2 text-sm text-[var(--gold)] tracking-widest hover:gap-4 transition-all"
          >
            了解場地 <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Events teaser */}
      <section className="py-24 bg-[var(--cream)]">
        <div className="container-narrow">
          <p className="label-tag mb-4">Events</p>
          <h2 className="text-3xl md:text-4xl mb-4">近期活動課程</h2>
          <div className="gold-divider" />
          <p className="text-[var(--gray)] text-sm leading-relaxed mt-6 mb-8">
            瑜伽課、親密關係課、學習活動、健康講座，在這裡發生。
          </p>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-sm text-[var(--gold)] tracking-widest hover:gap-4 transition-all"
          >
            查看所有活動 <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[var(--charcoal)] text-white">
        <div className="container-narrow text-center">
          <p className="label-tag mb-4" style={{ color: 'var(--gold-light)' }}>Reservation</p>
          <h2 className="text-3xl md:text-4xl mb-4">預約您的專屬場地</h2>
          <div className="gold-divider mx-auto" />
          <p className="text-white/60 text-sm leading-relaxed mt-6 mb-10">
            填寫租借申請，我們將於一個工作日內與您確認
          </p>
          <Link
            href="/rent"
            className="inline-flex items-center gap-2 px-10 py-3 border border-[var(--gold)] text-[var(--gold)] text-sm tracking-widest hover:bg-[var(--gold)] hover:text-white transition-all"
          >
            立即申請 <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </>
  )
}
