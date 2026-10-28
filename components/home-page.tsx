import type { Metadata } from 'next'
import { ErrorBoundary } from '@/components/error-boundary'
import { HomeArticle } from '@/components/home-article'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { VoiceTool } from '@/components/voice-tool'
import { HOME } from '@/content/home'
import { CHROME } from '@/content/pages'
import { UI_STRINGS } from '@/content/ui'
import { localePath, type Locale } from '@/lib/i18n'
import { pageMetadata } from '@/lib/seo'
import { SITE_NAME, SITE_URL } from '@/lib/site'

/* One module per tool page, so each page bundles only its own tool. */

export function homeMetadata(lang: Locale): Metadata {
  const content = HOME[lang]
  return pageMetadata({ lang, page: '', title: content.title, description: content.description, translated: true, absoluteTitle: true })
}

export function HomePage({ lang }: { lang: Locale }) {
  const content = HOME[lang]
  const url = `${SITE_URL}${localePath(lang) === '/' ? '' : localePath(lang)}`
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: SITE_NAME,
      alternateName: UI_STRINGS[lang].headline,
      url,
      description: content.description,
      applicationCategory: 'MultimediaApplication',
      applicationSubCategory: 'Text to speech and voice cloning',
      operatingSystem: 'Any (web browser)',
      browserRequirements: 'Requires a modern browser with WebAssembly',
      inLanguage: lang,
      availableLanguage: ['en', 'es', 'pt', 'de', 'it'],
      isAccessibleForFree: true,
      image: `${SITE_URL}/og.png`,
      screenshot: `${SITE_URL}/screenshots/desktop.webp`,
      featureList: content.sections.slice(0, 3).map((section) => section.h),
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: lang,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      inLanguage: lang,
      mainEntity: content.faq.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
  ]
  return (
    <main className="shell shell-home">
      <ErrorBoundary lang={lang} header={<SiteHeader lang={lang} />}>
        <VoiceTool ui={UI_STRINGS[lang]} lang={lang} homeHref={localePath(lang)} languageLabel={CHROME[lang].language} />
      </ErrorBoundary>
      <HomeArticle content={content} title={UI_STRINGS[lang].headline} lede={UI_STRINGS[lang].subhead} />
      <SiteFooter lang={lang} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
    </main>
  )
}
