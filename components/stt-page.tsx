import type { Metadata } from 'next'
import { ErrorBoundary } from '@/components/error-boundary'
import { HomeArticle } from '@/components/home-article'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { SttTool } from '@/components/stt-tool'
import { HOME } from '@/content/home'
import { CHROME } from '@/content/pages'
import { STT } from '@/content/stt'
import { TOOL_NAMES } from '@/content/tools'
import { localePath, type Locale } from '@/lib/i18n'
import { pageMetadata } from '@/lib/seo'
import { SITE_NAME, SITE_URL } from '@/lib/site'

export function sttMetadata(lang: Locale): Metadata {
  const content = STT[lang]
  return pageMetadata({ lang, page: 'voice-to-text', title: content.title, description: content.description, translated: true, absoluteTitle: true })
}

export function SttPage({ lang }: { lang: Locale }) {
  const content = STT[lang]
  const url = `${SITE_URL}${localePath(lang, 'voice-to-text')}`
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: `${SITE_NAME}: ${TOOL_NAMES[lang].stt}`,
      alternateName: content.headline,
      url,
      description: content.description,
      applicationCategory: 'MultimediaApplication',
      applicationSubCategory: 'Speech to text',
      operatingSystem: 'Any (web browser)',
      browserRequirements: 'Requires a modern browser with WebAssembly',
      inLanguage: lang,
      availableLanguage: ['en', 'es', 'pt', 'de', 'it'],
      isAccessibleForFree: true,
      image: `${SITE_URL}/og.png`,
      featureList: content.sections.map((section) => section.h),
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      inLanguage: lang,
      mainEntity: content.faq.map((item) => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })),
    },
  ]
  return (
    <main className="shell shell-home">
      <ErrorBoundary lang={lang} header={<SiteHeader lang={lang} page="voice-to-text" />}>
        <SttTool lang={lang} ui={content.ui} languageLabel={CHROME[lang].language} />
      </ErrorBoundary>
      <HomeArticle content={{ ...HOME[lang], sections: content.sections, faqTitle: content.faqTitle, faq: content.faq }} title={content.headline} lede={content.lede} />
      <SiteFooter lang={lang} page="voice-to-text" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
    </main>
  )
}
