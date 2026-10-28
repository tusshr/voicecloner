import type { Locale } from '@/lib/i18n'

/** Names of the two tools (tool switch, footer). Small on purpose: the tool switch loads in the browser. */
export const TOOL_NAMES: Record<Locale, { tts: string; stt: string }> = {
  en: { tts: 'Text to voice', stt: 'Voice to text' },
  es: { tts: 'Texto a voz', stt: 'Voz a texto' },
  pt: { tts: 'Texto para voz', stt: 'Voz para texto' },
  de: { tts: 'Text zu Sprache', stt: 'Sprache zu Text' },
  it: { tts: 'Testo a voce', stt: 'Voce a testo' },
}
