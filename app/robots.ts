import type { MetadataRoute } from 'next'
import { SITE_URL as SITE } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/admin-calendar',
        '/api/',
        '/check-in',
        '/my-booking',
        '/liff/',
        '/events/*/register',
        '/events/*/check-in',
      ],
    },
    sitemap: `${SITE}/sitemap.xml`,
  }
}
