import type { Locale } from './i18n'
import type { Preset } from './voices'

/**
 * Pre-made demos: every sample voice reading one line in every language, made with the same model the tool uses.
 * People can hear how a voice sounds before the ~150 MB model downloads. Files: public/demos/<lang>/<preset id>.mp3
 * (made with tools/make-demos.py).
 */
export const DEMO_LINES: Record<Locale, string> = {
  en: 'Hi! This is how I sound. Type any text, and I will read it out loud for you.',
  es: '¡Hola! Así suena mi voz. Escribe cualquier texto y lo leeré en voz alta para ti.',
  pt: 'Olá! É assim que a minha voz soa. Digite qualquer texto e eu leio em voz alta para você.',
  de: 'Hallo! So klingt meine Stimme. Gib einen beliebigen Text ein, und ich lese ihn dir vor.',
  it: 'Ciao! Ecco come suona la mia voce. Scrivi un testo qualsiasi e lo leggerò ad alta voce per te.',
}

export const demoUrl = (lang: Locale, preset: Preset) => `/demos/${lang}/${preset.id}.mp3`
