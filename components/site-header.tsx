import { SITE_NAME } from '@/lib/site'

export function SiteHeader({ homeHref }: { homeHref: string }) {
  return (
    <header className="topbar">
      <a className="wordmark" href={homeHref}>{SITE_NAME}</a>
    </header>
  )
}
