import Link from 'next/link'
import { ViewTransition } from 'react'
import { InstallButton } from '@/components/install-button'
import { LanguageSwitcher } from '@/components/language-switcher'
import { UI_STRINGS } from '@/content/ui'
import { CHROME } from '@/content/pages'
import { localePath, type Locale } from '@/lib/i18n'
import { SITE_NAME } from '@/lib/site'

/** Every page's header: it stays still while the page cross-fades. */
export function PinnedHeader({ children }: { children: React.ReactNode }) {
  return <ViewTransition name="site-header" share="auto" default="none">{children}</ViewTransition>
}

/** `page` is set only for pages that exist in every language. */
export function SiteHeader({ lang, page }: { lang: Locale; page?: string }) {
  return (
    <PinnedHeader>
      <header className="topbar">
        <Link className="wordmark" href={localePath(lang)}><span className="wordmark-mark" aria-hidden />{SITE_NAME}</Link>
        <div className="topbar-actions">
          <InstallButton ui={UI_STRINGS[lang]} />
          <LanguageSwitcher lang={lang} page={page} label={CHROME[lang].language} />
        </div>
      </header>
    </PinnedHeader>
  )
}
