import type { Locale } from '@/lib/i18n'

/** Tool names and the card head buttons (each tool sizes its button to fit both labels). Client code imports this, so keep it small. */
export const TOOL_NAMES: Record<Locale, { tts: string; stt: string; demo: string; upload: string }> = {
  en: { tts: 'Text to voice', stt: 'Voice to text', demo: 'Hear a demo', upload: 'Upload audio' },
  es: { tts: 'Texto a voz', stt: 'Voz a texto', demo: 'Escuchar demo', upload: 'Subir audio' },
  pt: { tts: 'Texto para voz', stt: 'Voz para texto', demo: 'Ouvir demo', upload: 'Enviar áudio' },
  de: { tts: 'Text zu Sprache', stt: 'Sprache zu Text', demo: 'Demo anhören', upload: 'Audio laden' },
  it: { tts: 'Testo a voce', stt: 'Voce a testo', demo: 'Ascolta demo', upload: 'Carica audio' },
}
