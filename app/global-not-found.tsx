import './globals.css'
import type { Metadata } from 'next'
import { RootDocument } from '@/components/root-document'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { CHROME } from '@/content/pages'
import { LANGUAGE_NAMES, LOCALES, localePath } from '@/lib/i18n'
import { SITE_NAME } from '@/lib/site'

export const metadata: Metadata = { title: `${CHROME.en.notFoundTitle} | ${SITE_NAME}`, robots: { index: false } }

export default function GlobalNotFound() {
  const chrome = CHROME.en
  return (
    <RootDocument lang="en">
      <main className="shell">
        <SiteHeader lang="en" />
        <section className="article prose">
          <h1 className="page-title">{chrome.notFoundTitle}</h1>
          <p className="lede">{chrome.notFoundText}</p>
          <p><a className="btn btn-primary" href="/">{chrome.backHome}</a></p>
          <ul className="plain-list">
            {LOCALES.filter((l) => l !== 'en').map((locale) => (
              <li key={locale} lang={locale}><a href={localePath(locale)}>{CHROME[locale].backHome}</a> ({LANGUAGE_NAMES[locale]})</li>
            ))}
          </ul>
        </section>
        <SiteFooter lang="en" />
      </main>
    </RootDocument>
  )
}
