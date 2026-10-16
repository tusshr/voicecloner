import type { MetadataRoute } from 'next'
import { SITE_NAME } from '@/lib/site'

export const dynamic = 'force-static'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME}: Free Voice Clone`,
    short_name: SITE_NAME,
    description: 'Clone a voice from a short recording and make it say anything, right in your browser.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f5f5f5',
    theme_color: '#0c0a09',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
