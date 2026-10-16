import type { Metadata } from 'next'
import { INTL_LOCALES, LOCALES, localePath, type Locale } from '@/lib/i18n'
import { INDEXABLE, SITE_NAME, SITE_URL } from '@/lib/site'

const OG_LOCALE: Record<Locale, string> = { en: 'en_US', es: 'es_ES', pt: 'pt_BR', de: 'de_DE', it: 'it_IT' }

/**
 * Metadata for one page. `page` is '' for home or a slug like 'about'.
 * `translated` = the page exists in every language (adds hreflang alternates).
 */
export function pageMetadata({ lang, page, title, description, translated, absoluteTitle }: {
  lang: Locale; page: string; title: string; description: string; translated: boolean; absoluteTitle?: boolean
}): Metadata {
  const path = localePath(lang, page)
  const languages: Record<string, string> = {}
  if (translated) {
    for (const locale of LOCALES) languages[locale] = localePath(locale, page)
    languages['x-default'] = localePath('en', page)
  }
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path, languages: translated ? languages : undefined },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title,
      description,
      url: path,
      locale: OG_LOCALE[lang],
      alternateLocale: translated ? INTL_LOCALES.concat().filter((l) => l !== lang).map((l) => OG_LOCALE[l]).concat(lang === 'en' ? [] : [OG_LOCALE.en]) : undefined,
      images: [{ url: '/og.png', width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: ['/og.png'] },
  }
}

export const baseMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  applicationName: SITE_NAME,
  robots: INDEXABLE ? { index: true, follow: true } : { index: false, follow: false },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: SITE_NAME, statusBarStyle: 'default' },
  formatDetection: { telephone: false },
}
