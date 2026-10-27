import type { Metadata } from 'next'
import { HomeArticle } from '@/components/home-article'
import { ProsePage } from '@/components/prose-page'
import { SiteFooter } from '@/components/site-footer'
import { VoiceTool } from '@/components/voice-tool'
import { HOME } from '@/content/home'
import { PRIVACY, TERMS, type LegalDoc } from '@/content/legal'
import { CHROME } from '@/content/pages'
import { UI_STRINGS } from '@/content/ui'
import { fmt, localePath, type Locale } from '@/lib/i18n'
import { pageMetadata } from '@/lib/seo'
import { CONTACT_EMAIL, LEGAL_EMAIL, SITE_NAME, SITE_URL, UPDATED } from '@/lib/site'

/* ---------------- home ---------------- */

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
      url,
      description: content.description,
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Any (web browser)',
      inLanguage: lang,
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
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
      <VoiceTool ui={UI_STRINGS[lang]} lang={lang} homeHref={localePath(lang)} languageLabel={CHROME[lang].language} />
      <HomeArticle content={content} title={UI_STRINGS[lang].headline} lede={UI_STRINGS[lang].subhead} />
      <SiteFooter lang={lang} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
    </main>
  )
}

/* ---------------- about & contact (translated) ---------------- */

type Slug = 'about' | 'contact'
const pageOf = (lang: Locale, slug: Slug) => (slug === 'about' ? CHROME[lang].aboutPage : CHROME[lang].contactPage)

export function simpleMetadata(lang: Locale, slug: Slug): Metadata {
  const page = pageOf(lang, slug)
  return pageMetadata({ lang, page: slug, title: page.title, description: page.description, translated: true })
}

export function SimplePage({ lang, slug }: { lang: Locale; slug: Slug }) {
  const page = pageOf(lang, slug)
  const values = { email: CONTACT_EMAIL, legal: LEGAL_EMAIL }
  return (
    <ProsePage lang={lang} page={slug} title={page.title}>
      {page.body.map((text) => <p key={text}>{linkEmails(fmt(text, values))}</p>)}
    </ProsePage>
  )
}

/* ---------------- privacy & terms (English) ---------------- */

const LEGAL: Record<'privacy' | 'terms', LegalDoc> = { privacy: PRIVACY, terms: TERMS }
const legalValues = { site: SITE_NAME, email: CONTACT_EMAIL, legal: LEGAL_EMAIL, updated: UPDATED }

export function legalMetadata(slug: 'privacy' | 'terms'): Metadata {
  const doc = LEGAL[slug]
  return pageMetadata({ lang: 'en', page: slug, title: doc.title, description: doc.description, translated: false })
}

export function LegalPage({ slug }: { slug: 'privacy' | 'terms' }) {
  const doc = LEGAL[slug]
  return (
    <ProsePage lang="en" title={doc.title} intro={fmt(doc.intro, legalValues)}>
      {doc.sections.map((section) => (
        <section key={section.h}>
          <h2>{section.h}</h2>
          {section.p.map((text) => <p key={text}>{linkEmails(fmt(text, legalValues))}</p>)}
        </section>
      ))}
    </ProsePage>
  )
}

/** Turn email addresses in a sentence into mailto links. */
function linkEmails(text: string) {
  return text.split(/(\S+@\S+\.[a-z]{2,})/gi).map((part, index) =>
    index % 2 === 1 ? <a key={index} href={`mailto:${part}`}>{part}</a> : part,
  )
}
