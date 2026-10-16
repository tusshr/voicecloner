import type { Viewport } from 'next'
import { Fraunces, Inter } from 'next/font/google'
import { Analytics } from '@/components/analytics'
import { CHROME } from '@/content/pages'
import type { Locale } from '@/lib/i18n'
import { GA_ID } from '@/lib/site'

const display = Fraunces({ subsets: ['latin'], weight: ['300', '400'], variable: '--font-display', display: 'swap' })
const body = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' })

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f5f5' },
    { media: '(prefers-color-scheme: dark)', color: '#0c0a09' },
  ],
}

export function RootDocument({ lang, children }: { lang: Locale; children: React.ReactNode }) {
  const chrome = CHROME[lang]
  return (
    <html lang={lang} className={`${display.variable} ${body.variable}`}>
      <body>
        {children}
        {/* Service worker: makes the site installable and lets it open without a connection. */}
        <script dangerouslySetInnerHTML={{ __html: "if('serviceWorker' in navigator)addEventListener('load',function(){navigator.serviceWorker.register('/sw.js')})" }} />
        {GA_ID && <Analytics id={GA_ID} text={chrome.cookieText} accept={chrome.accept} decline={chrome.decline} />}
      </body>
    </html>
  )
}
