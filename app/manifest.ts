import type { MetadataRoute } from 'next'
import { SITE_NAME } from '@/lib/site'

export const dynamic = 'force-static'

const shot = (name: string, label: string, wide = false) => ({
  src: `/screenshots/${name}.webp`,
  sizes: wide ? '1920x1080' : '1080x1920',
  type: 'image/webp',
  form_factor: wide ? ('wide' as const) : ('narrow' as const),
  label,
})

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: `${SITE_NAME}: Free Voice Clone`,
    short_name: SITE_NAME,
    description: 'Clone a voice from a 10-second recording. Type text and the voice speaks it. Your audio stays on your device.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#f5f5f5',
    theme_color: '#0c0a09',
    categories: ['music', 'productivity', 'utilities'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    // Shown in the install dialog on Android and desktop Chrome.
    screenshots: [
      shot('clone', 'Clone a voice from 10 seconds of speech'),
      shot('moods', 'Add moods to the voice'),
      shot('speak', 'Type text and hear the voice say it'),
      shot('desktop', 'Free voice clone in your browser', true),
    ],
  }
}
