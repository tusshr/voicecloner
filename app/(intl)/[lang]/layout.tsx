import '../../globals.css'
import { notFound } from 'next/navigation'
import { RootDocument } from '@/components/root-document'
import { INTL_LOCALES, isLocale } from '@/lib/i18n'
import { baseMetadata } from '@/lib/seo'

export { viewport } from '@/components/root-document'
export const metadata = baseMetadata
export const dynamicParams = false
export function generateStaticParams() { return INTL_LOCALES.map((lang) => ({ lang })) }

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLocale(lang) || lang === 'en') notFound()
  return <RootDocument lang={lang}>{children}</RootDocument>
}
