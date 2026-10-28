import { SttPage, sttMetadata } from '@/components/pages'
import type { Locale } from '@/lib/i18n'

type Props = { params: Promise<{ lang: string }> }
export async function generateMetadata({ params }: Props) { return sttMetadata((await params).lang as Locale) }
export default function Page({ params }: Props) { return params.then(({ lang }) => <SttPage lang={lang as Locale} />) }
