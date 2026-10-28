import Link from 'next/link'
import { InstallButton } from '@/components/install-button'
import { CHROME } from '@/content/pages'
import { UI_STRINGS } from '@/content/ui'
import { TOOL_NAMES } from '@/content/tools'
import { LANGUAGE_NAMES, LOCALES, localePath, type Locale } from '@/lib/i18n'
import { SITE_NAME } from '@/lib/site'

/** `page` is the current page slug when it exists in every language, so the switcher keeps you on it. */
export function SiteFooter({ lang, page = '' }: { lang: Locale; page?: string }) {
  const chrome = CHROME[lang]
  // Privacy and terms are English only; other languages link to them.
  const legal = (slug: 'privacy' | 'terms') => localePath('en', slug)
  return (
    <footer className="footer">
      <div className="footer-top">
        <Link className="wordmark" href={localePath(lang)}><span className="wordmark-mark" aria-hidden />{SITE_NAME}</Link>
        <InstallButton ui={UI_STRINGS[lang]} variant="footer" />
      </div>
      <nav className="footer-nav" aria-label="Site">
        <Link href={localePath(lang)}>{TOOL_NAMES[lang].tts}</Link>
        <Link href={localePath(lang, 'voice-to-text')}>{TOOL_NAMES[lang].stt}</Link>
        <Link href={localePath(lang, 'about')}>{chrome.about}</Link>
        <Link href={localePath(lang, 'contact')}>{chrome.contact}</Link>
        <Link href={legal('privacy')} hrefLang={lang === 'en' ? undefined : 'en'}>{chrome.privacy}</Link>
        <Link href={legal('terms')} hrefLang={lang === 'en' ? undefined : 'en'}>{chrome.terms}</Link>
      </nav>
      <div className="footer-fine">
        <p>{chrome.credits}</p>
        <div className="footer-bottom">
          <nav className="footer-langs" aria-label={chrome.language}>
            {LOCALES.map((locale) => (
              <a key={locale} href={localePath(locale, page)} hrefLang={locale} lang={locale}
                aria-current={locale === lang ? 'page' : undefined}>
                {LANGUAGE_NAMES[locale]}
              </a>
            ))}
          </nav>
          <span className="footer-version">v{process.env.NEXT_PUBLIC_APP_VERSION}</span>
        </div>
      </div>
    </footer>
  )
}
