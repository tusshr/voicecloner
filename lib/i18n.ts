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

export const isLocale = (value: string): value is Locale => (LOCALES as readonly string[]).includes(value)

/** Path for a page in a language: '' is home, otherwise e.g. 'about'. */
export function localePath(locale: Locale, page = '') {
  const prefix = locale === 'en' ? '' : `/${locale}`
  return page ? `${prefix}/${page}` : prefix || '/'
}

/** Fill {placeholders} in a UI string. */
export function fmt(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''))
}
