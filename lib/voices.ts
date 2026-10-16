// Sample voices from kyutai/tts-voices. Only permissively licensed, consenting speakers:
// alba-mackenna (voice actor, CC BY 4.0) and voice-zero (LibriVox readers, CC0).
const BASE = 'https://huggingface.co/kyutai/tts-voices/resolve/main/'

export type PresetStyle = 'casual' | 'announcer' | 'merchant' | 'gentle' | 'narrator'
export type Preset = { id: string; name: string; style: PresetStyle; url: string }

// Order matters: the first four show by default, so they are four different speakers.
export const PRESETS: Preset[] = [
  { id: 'alba-casual', name: 'Alba', style: 'casual', url: `${BASE}alba-mackenna/casual.wav` },
  { id: 'bill', name: 'Bill', style: 'narrator', url: `${BASE}voice-zero/bill_boerst.wav` },
  { id: 'caro', name: 'Caro', style: 'narrator', url: `${BASE}voice-zero/caro_davy.wav` },
  { id: 'peter', name: 'Peter', style: 'narrator', url: `${BASE}voice-zero/peter_yearsley.wav` },
  { id: 'alba-announcer', name: 'Alba', style: 'announcer', url: `${BASE}alba-mackenna/announcer.wav` },
  { id: 'stuart', name: 'Stuart', style: 'narrator', url: `${BASE}voice-zero/stuart_bell.wav` },
  { id: 'alba-merchant', name: 'Alba', style: 'merchant', url: `${BASE}alba-mackenna/merchant.wav` },
  { id: 'alba-gentle', name: 'Alba', style: 'gentle', url: `${BASE}alba-mackenna/a-moment-by.wav` },
]
