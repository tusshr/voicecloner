export const LOCALES = ['en', 'es', 'pt', 'de', 'it'] as const
export type Locale = (typeof LOCALES)[number]
export const INTL_LOCALES = LOCALES.filter((l) => l !== 'en') as Exclude<Locale, 'en'>[]

export const LANGUAGE_NAMES: Record<Locale, string> = {
  en: 'English', es: 'Español', pt: 'Português', de: 'Deutsch', it: 'Italiano',
}

/** Pocket TTS language bundle used for each page language. */
export const ENGINE_LANGUAGE: Record<Locale, string> = {
  en: 'english_2026-04', es: 'spanish', pt: 'portuguese', de: 'german', it: 'italian',
}

/** Whisper language name for each speech language. */
export const WHISPER_LANGUAGE: Record<Locale, string> = { en: 'english', es: 'spanish', pt: 'portuguese', de: 'german', it: 'italian' }

export const isLocale = (value: string): value is Locale => (LOCALES as readonly string[]).includes(value)

/** Path for a page in a language: '' is home, otherwise e.g. 'about'. */
export function localePath(locale: Locale, page = '') {
  const prefix = locale === 'en' ? '' : `/${locale}`
  return page ? `${prefix}/${page}` : prefix || '/'
}

/** "Just now" under a minute, then the browser's own wording: "5 minutes ago", "2 hours ago", "yesterday", "3 days ago". */
export function timeAgo(ms: number, locale: Locale, justNow: string) {
  const minutes = Math.floor(ms / 60_000)
  if (minutes < 1) return justNow
  const format = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  if (minutes < 60) return format.format(-minutes, 'minute')
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return format.format(-hours, 'hour')
  const days = Math.floor(hours / 24)
  return days < 30 ? format.format(-days, 'day') : new Date(Date.now() - ms).toLocaleDateString(locale, { day: 'numeric', month: 'short' })
}

/** Fill {placeholders} in a UI string. */
export function fmt(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''))
}
