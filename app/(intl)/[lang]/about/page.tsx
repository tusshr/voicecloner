import { SimplePage, simpleMetadata } from '@/components/pages'
import type { Locale } from '@/lib/i18n'

type Props = { params: Promise<{ lang: string }> }
export async function generateMetadata({ params }: Props) { return simpleMetadata((await params).lang as Locale, 'about') }
export default function Page({ params }: Props) { return params.then(({ lang }) => <SimplePage lang={lang as Locale} slug="about" />) }
