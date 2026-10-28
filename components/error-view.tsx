'use client'

import { ERRORS } from '@/content/errors'
import { isLocale, localePath } from '@/lib/i18n'
import { SITE_NAME } from '@/lib/site'

export function ErrorView({ lang, reset }: { lang: string; reset: () => void }) {
  const locale = isLocale(lang) ? lang : 'en'
  const text = ERRORS[locale]
  return (
    <main className="shell">
      <header className="topbar"><a className="wordmark" href={localePath(locale)}>{SITE_NAME}</a></header>
      <section className="article prose" role="alert">
        <h1 className="page-title">{text.title}</h1>
        <p className="lede">{text.text}</p>
        <div className="btn-row">
          <button className="btn btn-primary" onClick={reset}>{text.tryAgain}</button>
          <a className="btn btn-outline" href={localePath(locale)}>{text.home}</a>
        </div>
      </section>
    </main>
  )
}
