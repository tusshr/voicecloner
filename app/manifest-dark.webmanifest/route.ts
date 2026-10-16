import { buildManifest } from '@/lib/manifest'

export const dynamic = 'force-static'

export function GET() {
  return new Response(JSON.stringify(buildManifest('dark')), { headers: { 'Content-Type': 'application/manifest+json' } })
}
