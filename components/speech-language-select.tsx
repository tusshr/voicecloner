import { ChevronDown, Languages } from 'lucide-react'
import { LANGUAGE_NAMES, LOCALES, type Locale } from '@/lib/i18n'

/** Speech language menu (both tools). */
export function SpeechLanguageSelect({ value, onChange, disabled, label }: {
  value: Locale; onChange: (locale: Locale) => void; disabled?: boolean; label: string
}) {
  return (
    <label className="select">
      <Languages size={14} aria-hidden />
      <select value={value} disabled={disabled} aria-label={label} onChange={(event) => onChange(event.target.value as Locale)}>
        {LOCALES.map((locale) => <option key={locale} value={locale} lang={locale}>{LANGUAGE_NAMES[locale]}</option>)}
      </select>
      <ChevronDown size={14} aria-hidden />
    </label>
  )
}
