import type { Metadata } from 'next'
import { ProsePage } from '@/components/prose-page'
import { PRIVACY, TERMS, type LegalDoc } from '@/content/legal'
import { CHROME } from '@/content/pages'
import { fmt, type Locale } from '@/lib/i18n'
import { pageMetadata } from '@/lib/seo'
import { CONTACT_EMAIL, LEGAL_EMAIL, SITE_NAME, UPDATED } from '@/lib/site'

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
