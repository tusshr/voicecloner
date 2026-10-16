import '../globals.css'
import { RootDocument } from '@/components/root-document'
import { baseMetadata } from '@/lib/seo'

export { viewport } from '@/components/root-document'
export const metadata = baseMetadata

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return <RootDocument lang="en">{children}</RootDocument>
}
