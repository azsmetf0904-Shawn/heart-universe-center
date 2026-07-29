import { createAdminClient } from '@/lib/supabase/server'
import type { MetadataRoute } from 'next'
import { SITE_URL as SITE } from '@/lib/seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createAdminClient()

  const [{ data: venues, error: venuesError }, { data: events, error: eventsError }] = await Promise.all([
    supabase.from('venues').select('slug, created_at').eq('is_active', true),
    supabase.from('events').select('slug, created_at').neq('status', 'draft'),
  ])
  if (venuesError) console.error('[sitemap] venues query failed:', venuesError)
  if (eventsError) console.error('[sitemap] events query failed:', eventsError)

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE}/venues`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE}/events`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE}/community`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE}/charity`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE}/charity/donate`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE}/rent`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE}/news`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE}/showcase`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE}/availability`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.5 },
    { url: `${SITE}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]

  const venueRoutes: MetadataRoute.Sitemap = (venues ?? []).map(v => ({
    url: `${SITE}/venues/${v.slug}`,
    lastModified: v.created_at ? new Date(v.created_at) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const eventRoutes: MetadataRoute.Sitemap = (events ?? []).map(e => ({
    url: `${SITE}/events/${e.slug}`,
    lastModified: e.created_at ? new Date(e.created_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  const eventGalleryRoutes: MetadataRoute.Sitemap = (events ?? []).map(e => ({
    url: `${SITE}/events/${e.slug}/gallery`,
    lastModified: e.created_at ? new Date(e.created_at) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.5,
  }))

  return [...staticRoutes, ...venueRoutes, ...eventRoutes, ...eventGalleryRoutes]
}
