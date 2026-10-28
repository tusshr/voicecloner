'use client'

import { catchError, type ErrorInfo } from 'next/error'
import { SiteHeader } from '@/components/site-header'
import { CHROME } from '@/content/pages'
import type { Locale } from '@/lib/i18n'

/**
 * Wraps a tool so a crash in it keeps the rest of the page (header, article, footer).
 * The tool renders its own header, so the fallback brings the plain one back.
 * `reset` re-mounts the tool in the browser; `retry` would refetch the page, which fails offline (the app installs as a PWA).
 */
function ToolError({ lang, page }: { lang: Locale; page?: string }, { reset }: ErrorInfo) {
  const chrome = CHROME[lang]
  return (
    <>
      <SiteHeader lang={lang} page={page} />
      <section className="error-box" role="alert">
        <h2>{chrome.errorTitle}</h2>
        <p className="note">{chrome.errorText}</p>
        <button className="btn btn-primary" onClick={reset}>{chrome.tryAgain}</button>
      </section>
    </>
  )
}

export const ErrorBoundary = catchError(ToolError)
