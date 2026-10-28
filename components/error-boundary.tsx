'use client'

import { catchError, type ErrorInfo } from 'next/error'
import { ERRORS } from '@/content/errors'
import type { Locale } from '@/lib/i18n'

/**
 * Wraps a tool so a crash in it keeps the rest of the page (article, footer).
 * The tool renders its own header, so the page passes the plain one as `header` (rendered on the server,
 * which keeps the header's content files out of the browser bundle).
 * `reset` re-mounts the tool in the browser; `retry` would refetch the page, which fails offline (the app installs as a PWA).
 */
function ToolError({ lang, header }: { lang: Locale; header: React.ReactNode }, { reset }: ErrorInfo) {
  const text = ERRORS[lang]
  return (
    <>
      {header}
      <section className="error-box" role="alert">
        <h2>{text.title}</h2>
        <p className="note">{text.text}</p>
        <button className="btn btn-primary" onClick={reset}>{text.tryAgain}</button>
      </section>
    </>
  )
}

export const ErrorBoundary = catchError(ToolError)
