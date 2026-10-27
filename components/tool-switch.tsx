import { localePath, type Locale } from '@/lib/i18n'
import { STT } from '@/content/stt'

/** The two tools of the studio, as a two-part switch. Plain links, so each tool is its own page for search. */
export function ToolSwitch({ lang, active, className }: { lang: Locale; active: 'tts' | 'stt'; className?: string }) {
  const ui = STT[lang].ui
  return (
    <nav className={`tool-switch ${className ?? ''}`} aria-label="Tools">
      <a href={localePath(lang)} aria-current={active === 'tts' ? 'page' : undefined}>{ui.toolTts}</a>
      <a href={localePath(lang, 'voice-to-text')} aria-current={active === 'stt' ? 'page' : undefined}>{ui.toolStt}</a>
    </nav>
  )
}
