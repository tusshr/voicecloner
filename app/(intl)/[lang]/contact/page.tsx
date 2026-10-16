import { SimplePage, simpleMetadata } from '@/components/pages'
import type { Locale } from '@/lib/i18n'

type Props = { params: Promise<{ lang: string }> }
export async function generateMetadata({ params }: Props) { return simpleMetadata((await params).lang as Locale, 'contact') }
export default async function Page({ params }: Props) { return <SimplePage lang={(await params).lang as Locale} slug="contact" /> }
