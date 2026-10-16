'use client'

import { CHROME } from '@/content/pages'
import { isLocale, localePath } from '@/lib/i18n'
import { SITE_NAME } from '@/lib/site'

export function ErrorView({ lang, reset }: { lang: string; reset: () => void }) {
  const locale = isLocale(lang) ? lang : 'en'
  const chrome = CHROME[locale]
  return (
    <main className="shell">
      <header className="topbar"><a className="wordmark" href={localePath(locale)}>{SITE_NAME}</a></header>
      <section className="article prose" role="alert">
        <h1 className="page-title">{chrome.errorTitle}</h1>
        <p className="lede">{chrome.errorText}</p>
        <div className="btn-row">
          <button className="btn btn-primary" onClick={reset}>{chrome.tryAgain}</button>
          <a className="btn btn-outline" href={localePath(locale)}>{chrome.home}</a>
        </div>
      </section>
    </main>
  )
}
