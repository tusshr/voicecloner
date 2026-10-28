import Link from 'next/link'
import { ViewTransition } from 'react'
import { localePath, type Locale } from '@/lib/i18n'
import { STT } from '@/content/stt'

/**
 * The two tools of the studio, as a two-part switch. Links, so each tool is its own page for search.
 * Switching here slides the pill to the other tool; the label sits above it. Names are per variant
 * because the header and inline switches are both in the DOM (CSS shows one).
 */
export function ToolSwitch({ lang, active, variant }: { lang: Locale; active: 'tts' | 'stt'; variant: 'header' | 'inline' }) {
  const ui = STT[lang].ui
  const tabs = [
    { id: 'tts', href: localePath(lang), label: ui.toolTts },
    { id: 'stt', href: localePath(lang, 'voice-to-text'), label: ui.toolStt },
  ] as const
  return (
    <nav className={`tool-switch tool-switch-${variant}`} aria-label="Tools">
      {tabs.map((tab) => (
        <Link key={tab.id} href={tab.href} transitionTypes={['tool-switch']} aria-current={active === tab.id ? 'page' : undefined}>
          {active === tab.id && (
            <ViewTransition name={`tool-pill-${variant}`} share={{ 'tool-switch': 'tool-pill', default: 'none' }} default="none">
              <span className="tool-pill" aria-hidden />
            </ViewTransition>
          )}
          <ViewTransition name={`tool-label-${variant}-${tab.id}`} share={{ 'tool-switch': 'auto', default: 'none' }} default="none">
            <span className="tool-label">{tab.label}</span>
          </ViewTransition>
        </Link>
      ))}
    </nav>
  )
}
