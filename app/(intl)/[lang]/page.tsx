import { HomePage, homeMetadata } from '@/components/pages'
import type { Locale } from '@/lib/i18n'

type Props = { params: Promise<{ lang: string }> }
export async function generateMetadata({ params }: Props) { return homeMetadata((await params).lang as Locale) }
export default function Page({ params }: Props) { return params.then(({ lang }) => <HomePage lang={lang as Locale} />) }
