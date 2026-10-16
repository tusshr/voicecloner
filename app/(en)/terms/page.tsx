import { LegalPage, legalMetadata } from '@/components/pages'

export const metadata = legalMetadata('terms')
export default function Page() { return <LegalPage slug="terms" /> }
