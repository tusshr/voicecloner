'use client'

import { catchError, type ErrorInfo } from 'next/error'
import { ERRORS } from '@/content/errors'
import type { Locale } from '@/lib/i18n'

/** A crashed tool keeps the rest of the page. `reset`, not `retry`: retry refetches the page and fails offline. */
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
