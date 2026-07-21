'use client'
import { useEffect } from 'react'

function daypartNow(): 'morning' | 'afternoon' | 'night' {
  const h = new Date().getHours()
  if (h >= 9 && h < 12) return 'morning'
  if (h >= 12 && h < 18) return 'afternoon'
  return 'night'
}

export function TimeAwareHero({ heroId }: { heroId: string }) {
  useEffect(() => {
    const el = document.getElementById(heroId)
    if (!el) return

    function apply() {
      el!.setAttribute('data-daypart', daypartNow())
    }
    apply()
    const id = setInterval(apply, 10 * 60 * 1000)
    return () => clearInterval(id)
  }, [heroId])

  return null
}
