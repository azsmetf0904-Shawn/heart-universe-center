'use client'
import Link from 'next/link'
import { MapPin, Sofa, Users, ArrowRight, ShieldCheck } from 'lucide-react'
import { CTA } from '@/lib/cta'

export function MobileBottomCTA() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden px-4" style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}>
      <div
        style={{
          borderRadius: 18,
          background: 'linear-gradient(180deg, rgba(251,247,240,0.98) 0%, rgba(244,236,224,0.98) 100%)',
          border: '1px solid rgba(196,160,56,0.22)',
          boxShadow: '0 14px 28px rgba(28,16,8,0.24)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', padding: '12px 12px 8px' }}>
          {[
            { icon: MapPin, label: '台北市中心' },
            { icon: Sofa, label: '質感空間' },
            { icon: Users, label: '專業團隊' },
          ].map(({ icon: Icon, label }, i) => (
            <div key={label} style={{ textAlign: 'center', position: 'relative' }}>
              {i < 2 && (
                <div
                  aria-hidden="true"
                style={{
                  position: 'absolute',
                    top: 8,
                    right: -1,
                    width: 1,
                    height: 38,
                    background: 'rgba(196,160,56,0.22)',
                  }}
                />
              )}
              <div
                style={{
                  width: 40,
                  height: 40,
                  margin: '0 auto 6px',
                  borderRadius: '50%',
                  background: 'rgba(196,160,56,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#9D7320',
                }}
              >
                <Icon size={20} strokeWidth={1.8} />
              </div>
              <div style={{ fontSize: 11, lineHeight: 1.3, color: '#4D3526', letterSpacing: '0.08em' }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: '0 14px 12px' }}>
          <Link
            href="/rent"
            className="block text-center"
            style={{
              padding: '14px 18px',
              borderRadius: 13,
              background: 'linear-gradient(180deg, #D8B24C 0%, #B98922 100%)',
              color: '#fff',
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: '0.12em',
              boxShadow: '0 10px 20px rgba(185,137,34,0.22)',
              textDecoration: 'none',
            }}
          >
            {CTA.home.startRental}
            <ArrowRight size={15} style={{ display: 'inline-block', marginLeft: 10, verticalAlign: '-2px' }} />
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 8, fontSize: 10, color: '#8D755B', letterSpacing: '0.08em' }}>
            <ShieldCheck size={12} style={{ color: '#C4A038' }} />
            專人聯繫・快速回覆・彈性方案
          </div>
        </div>
      </div>
    </div>
  )
}
