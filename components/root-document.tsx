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
  // Edge-to-edge: the page draws behind Android's navigation bar, so the bar takes the page color in light and dark mode.
  viewportFit: 'cover',
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
        {/* Service worker (install and offline start), and keep the install prompt for the install button. */}
        <script dangerouslySetInnerHTML={{ __html: [
          "if('serviceWorker' in navigator)addEventListener('load',function(){navigator.serviceWorker.register('/sw.js')});",
          "addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.installPrompt=e;dispatchEvent(new Event('installready'))});",
          "addEventListener('appinstalled',function(){window.installPrompt=null});",
          "if(matchMedia('(prefers-color-scheme: dark)').matches){var m=document.querySelector('link[rel=manifest]');if(m)m.href='/manifest-dark.webmanifest'}",
        ].join('') }} />
        {GA_ID && <Analytics id={GA_ID} text={chrome.cookieText} accept={chrome.accept} decline={chrome.decline} />}
      </body>
    </html>
  )
}
