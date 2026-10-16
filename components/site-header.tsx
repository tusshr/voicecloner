import { InstallButton } from '@/components/install-button'
import { LanguageSwitcher } from '@/components/language-switcher'
import { UI_STRINGS } from '@/content/ui'
import { CHROME } from '@/content/pages'
import { localePath, type Locale } from '@/lib/i18n'
import { SITE_NAME } from '@/lib/site'

/** `page` is set only for pages that exist in every language. */
export function SiteHeader({ lang, page }: { lang: Locale; page?: string }) {
  return (
    <header className="topbar">
      <a className="wordmark" href={localePath(lang)}>{SITE_NAME}</a>
      <div className="topbar-actions">
        <InstallButton ui={UI_STRINGS[lang]} />
        <LanguageSwitcher lang={lang} page={page} label={CHROME[lang].language} />
      </div>
    </header>
  )
}
