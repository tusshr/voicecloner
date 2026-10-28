import { ChevronDown, Languages } from 'lucide-react'
import { LANGUAGE_NAMES, LOCALES, type Locale } from '@/lib/i18n'

/** Speech language menu. Phones show the code (EN) so the card head fits at 360 px; the native list shows full names. */
export function SpeechLanguageSelect({ value, onChange, disabled, label }: {
  value: Locale; onChange: (locale: Locale) => void; disabled?: boolean; label: string
}) {
  return (
    <label className="select">
      <Languages size={14} aria-hidden />
      <span className="select-full" aria-hidden>{LANGUAGE_NAMES[value]}</span>
      <span className="select-short" aria-hidden>{value.toUpperCase()}</span>
      <select value={value} disabled={disabled} aria-label={label} onChange={(event) => onChange(event.target.value as Locale)}>
        {LOCALES.map((locale) => <option key={locale} value={locale} lang={locale}>{LANGUAGE_NAMES[locale]}</option>)}
      </select>
      <ChevronDown size={14} aria-hidden />
    </label>
  )
}
