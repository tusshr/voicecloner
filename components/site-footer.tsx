import Link from 'next/link'
import { InstallButton } from '@/components/install-button'
import { CHROME } from '@/content/pages'
import { UI_STRINGS } from '@/content/ui'
import { STT } from '@/content/stt'
import { LANGUAGE_NAMES, LOCALES, localePath, type Locale } from '@/lib/i18n'

/** `page` is the current page slug when it exists in every language, so the switcher keeps you on it. */
export function SiteFooter({ lang, page = '' }: { lang: Locale; page?: string }) {
  const chrome = CHROME[lang]
  // Privacy and terms are English only; other languages link to them.
  const legal = (slug: 'privacy' | 'terms') => localePath('en', slug)
  // Language links stay plain <a>: each language has its own root layout, so that is a full page load anyway.
  return (
    <footer className="footer">
      <div className="footer-top">
        <p>{chrome.credits}</p>
        <InstallButton ui={UI_STRINGS[lang]} variant="footer" />
      </div>
      <nav className="footer-nav" aria-label="Tools">
        <Link href={localePath(lang)}>{STT[lang].ui.toolTts}</Link>
        <Link href={localePath(lang, 'voice-to-text')}>{STT[lang].ui.toolStt}</Link>
      </nav>
      <nav className="footer-nav" aria-label="Site">
        <Link href={localePath(lang, 'about')}>{chrome.about}</Link>
        <Link href={localePath(lang, 'contact')}>{chrome.contact}</Link>
        <Link href={legal('privacy')} hrefLang={lang === 'en' ? undefined : 'en'}>{chrome.privacy}</Link>
        <Link href={legal('terms')} hrefLang={lang === 'en' ? undefined : 'en'}>{chrome.terms}</Link>
      </nav>
      <nav className="footer-nav" aria-label={chrome.language}>
        {LOCALES.map((locale) => (
          <a key={locale} href={localePath(locale, page)} hrefLang={locale} lang={locale}
            aria-current={locale === lang ? 'page' : undefined}>
            {LANGUAGE_NAMES[locale]}
          </a>
        ))}
      </nav>
      <p className="footer-version">v{process.env.NEXT_PUBLIC_APP_VERSION}</p>
    </footer>
  )
}
