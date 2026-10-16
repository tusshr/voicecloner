'use client'

import './globals.css'
import { ErrorView } from '@/components/error-view'

// Last-resort error screen when even the layout fails.
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  const lang = typeof document !== 'undefined' ? document.documentElement.lang || 'en' : 'en'
  return (
    <html lang={lang}>
      <body><ErrorView lang={lang} reset={reset} /></body>
    </html>
  )
}
