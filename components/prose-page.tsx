import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import type { Locale } from '@/lib/i18n'

export function ProsePage({ lang, page, title, intro, children }: {
  lang: Locale; page?: string; title: string; intro?: string; children: React.ReactNode
}) {
  return (
    <main className="shell">
      <SiteHeader lang={lang} page={page} />
      <article className="article prose">
        <h1 className="page-title">{title}</h1>
        {intro && <p className="lede">{intro}</p>}
        {children}
      </article>
      <SiteFooter lang={lang} page={page} />
    </main>
  )
}
