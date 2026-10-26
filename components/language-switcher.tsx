'use client'

import { Globe } from 'lucide-react'
import { LANGUAGE_NAMES, LOCALES, localePath, type Locale } from '@/lib/i18n'

/**
 * Pill with a globe icon. A transparent native <select> sits on top, so phones show their own picker.
 * `page` keeps you on the same page when it exists in every language; otherwise you go to that language's home.
 */
export function LanguageSwitcher({ lang, page = '', label }: { lang: Locale; page?: string; label: string }) {
  return (
    <label className="lang">
      <Globe size={14} aria-hidden />
      <span>{lang.toUpperCase()}</span>
      <select aria-label={label} value={lang}
        onChange={(event) => { window.location.href = localePath(event.target.value as Locale, page) }}>
        {LOCALES.map((locale) => (
          <option key={locale} value={locale} lang={locale}>{LANGUAGE_NAMES[locale]}</option>
        ))}
      </select>
    </label>
  )
}
