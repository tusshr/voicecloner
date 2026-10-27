import type { MetadataRoute } from 'next'
import { LOCALES, localePath } from '@/lib/i18n'
import { SITE_URL } from '@/lib/site'

export const dynamic = 'force-static'

const abs = (path: string) => `${SITE_URL}${path === '/' ? '/' : path}`

export default function sitemap(): MetadataRoute.Sitemap {
  const translated = ['', 'voice-to-text', 'about', 'contact'].flatMap((page) =>
    LOCALES.map((lang) => ({
      url: abs(localePath(lang, page)),
      changeFrequency: 'monthly' as const,
      priority: page === '' ? 1 : page === 'voice-to-text' ? 0.9 : 0.4,
      alternates: {
        languages: Object.fromEntries([
          ...LOCALES.map((l) => [l, abs(localePath(l, page))]),
          ['x-default', abs(localePath('en', page))],
        ]),
      },
    })),
  )
  const english = ['privacy', 'terms'].map((page) => ({ url: abs(localePath('en', page)), changeFrequency: 'yearly' as const, priority: 0.2 }))
  return [...translated, ...english]
}
