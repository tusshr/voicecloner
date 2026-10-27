// Scripts mark effects in square brackets.
//
//   [😊: I won the prize!]          an emotion, for the text inside only
//   [slow: Listen carefully.]       delivery: slow, fast, soft, loud
//   [😊, slow: Two at once.]        effects combine
//   [pause 1s]                      a pause (0.05 to 5 s)
//
// Words work as well as emoji, in every page language ([happy: …], [feliz: …]); the editor turns mood words into
// their emoji as you type. The older style, where a tag like [slow] changes everything after it until [normal],
// still works, so saved scripts keep their meaning.

export const MOODS = ['happy', 'sad', 'excited', 'calm', 'whisper'] as const
export type Mood = (typeof MOODS)[number]
export const MOOD_EMOJI: Record<Mood, string> = { happy: '😊', sad: '😢', excited: '🤩', calm: '😌', whisper: '🤫' }
export type Speed = 'slow' | 'normal' | 'fast'
export type Volume = 'soft' | 'normal' | 'loud'
export const DELIVERY = ['slow', 'fast', 'soft', 'loud'] as const
export type Delivery = (typeof DELIVERY)[number]

export type Segment =
  | { kind: 'speech'; text: string; mood: Mood | null; speed: Speed; volume: Volume }
  | { kind: 'pause'; seconds: number }

export type ParsedScript = { segments: Segment[]; unknownTags: string[]; spokenLength: number }

const DEFAULT_PAUSE = 0.6
const MAX_PAUSE = 5

export const SPEED_FACTOR: Record<Speed, number> = { slow: 0.85, normal: 1, fast: 1.18 }
export const VOLUME_GAIN: Record<Volume, number> = { soft: 0.5, normal: 1, loud: 1.5 }

/** Words people may type for each effect, in the five page languages. */
const WORDS: Record<Mood | Delivery | 'pause' | 'normal', string[]> = {
  happy: ['happy', 'feliz', 'fröhlich', 'glücklich', 'felice', 'contento', 'contenta'],
  sad: ['sad', 'triste', 'traurig'],
  excited: ['excited', 'emocionado', 'emocionada', 'animado', 'animada', 'aufgeregt', 'emozionato', 'emozionata', 'entusiasta'],
  calm: ['calm', 'tranquilo', 'tranquila', 'calmo', 'calma', 'ruhig'],
  whisper: ['whisper', 'whispers', 'susurro', 'susurrar', 'sussurro', 'sussurrar', 'flüstern', 'geflüstert', 'sussurrare'],
  slow: ['slow', 'lento', 'lenta', 'langsam'],
  fast: ['fast', 'rápido', 'rápida', 'rapido', 'rapida', 'schnell', 'veloce'],
  soft: ['soft', 'suave', 'leise', 'piano', 'sottovoce'],
  loud: ['loud', 'fuerte', 'forte', 'laut'],
  pause: ['pause', 'pausa'],
  normal: ['normal', 'normale'],
}
const WORD_TO: Record<string, keyof typeof WORDS> = {}
for (const [effect, words] of Object.entries(WORDS)) for (const word of words) WORD_TO[word] = effect as keyof typeof WORDS
const EMOJI_TO: Record<string, Mood> = Object.fromEntries(MOODS.map((mood) => [MOOD_EMOJI[mood], mood]))

/** Matches a scoped tag "[effects: text]" or a plain tag "[word]". Group 1: the part before a colon; group 2: the text after it. */
export const TAG_RE = /\[([^\]\[:]*)(?::([^\]\[]*))?\]/g

type Effects = { mood?: Mood; speed?: Speed; volume?: Volume; normal?: boolean; pause?: number | null }

/** Read the effect part of a tag ("😊, slow", "pause 1s", "happy"). Null when something in it is not an effect. */
export function readEffects(part: string): Effects | null {
  const found: Effects = {}
  let rest = part
  for (const [emoji, mood] of Object.entries(EMOJI_TO)) {
    if (rest.includes(emoji)) { found.mood = mood; rest = rest.split(emoji).join(' ') }
  }
  const words = rest.toLowerCase().replace(/[\uFE0F\u200D]/g, '').split(/[\s,;+]+/).filter(Boolean)
  for (let i = 0; i < words.length; i++) {
    const effect = WORD_TO[words[i]]
    if (!effect) return null
    if (effect === 'pause') {
      found.pause = parsePause(words[i + 1])
      if (words[i + 1]) i++
    } else if (effect === 'normal') found.normal = true
    else if (effect === 'slow' || effect === 'fast') found.speed = effect
    else if (effect === 'soft' || effect === 'loud') found.volume = effect
    else found.mood = effect
  }
  if (!found.mood && !found.speed && !found.volume && !found.normal && found.pause === undefined) return null
  if (found.pause === null) return null
  return found
}

function parsePause(arg: string | undefined): number | null {
  if (!arg) return DEFAULT_PAUSE
  const match = arg.trim().match(/^(\d+(?:\.\d+)?)\s*(ms|s)?$/i)
  if (!match) return null
  const value = Number(match[1])
  const seconds = match[2]?.toLowerCase() === 'ms' ? value / 1000 : value
  return Math.min(MAX_PAUSE, Math.max(0.05, seconds))
}

/** How a tag looks in the editor: which mood colors it, or a neutral effect, or not understood. */
export function tagLook(tag: string): { kind: 'mood'; mood: Mood } | { kind: 'effect' } | { kind: 'bad' } {
  const match = /^\[([^\]\[:]*)(?::[^\]\[]*)?\]$/.exec(tag)
  const effects = match ? readEffects(match[1]) : null
  if (!effects) return { kind: 'bad' }
  return effects.mood ? { kind: 'mood', mood: effects.mood } : { kind: 'effect' }
}
export const isKnownTag = (tag: string) => tagLook(tag).kind !== 'bad'
export const tagMood = (tag: string): Mood | null => { const look = tagLook(tag); return look.kind === 'mood' ? look.mood : null }

/**
 * Turn mood words at the start of a scoped tag into their emoji: "[happy: hi]" → "[😊: hi]", "[feliz, slow: …]" →
 * "[😊, slow: …]". Only tags that already have their colon, so typing is never interrupted.
 */
export function emojifyTags(text: string): string {
  return text.replace(/\[([^\]\[:]*):/g, (whole, part: string) => {
    if (!readEffects(part)) return whole
    let changed = false
    const pieces = part.split(/(\s*,\s*|\s+)/).map((piece) => {
      const effect = WORD_TO[piece.toLowerCase()]
      if (effect && (MOODS as readonly string[]).includes(effect)) { changed = true; return MOOD_EMOJI[effect as Mood] }
      return piece
    })
    if (!changed) return whole
    // "😊 happy" (emoji plus its own word) becomes just the emoji.
    const joined = pieces.join('').replace(/(\p{Extended_Pictographic}\uFE0F?)\s+\1/gu, '$1').trim()
    return `[${joined}:`
  })
}

export function parseScript(rawInput: string): ParsedScript {
  // A blank line between paragraphs becomes a short breath.
  const input = rawInput.replace(/\n[ \t]*\n+/g, ' [pause 0.5s] ')
  const segments: Segment[] = []
  const unknownTags: string[] = []
  // The older, open-ended style sets these until changed.
  let mood: Mood | null = null
  let speed: Speed = 'normal'
  let volume: Volume = 'normal'
  let spokenLength = 0

  const pushText = (raw: string, scoped?: Effects) => {
    const text = raw.replace(/\s+/g, ' ').trim()
    if (!/[\p{L}\p{N}]/u.test(text)) return
    spokenLength += text.length
    const m = scoped?.mood ?? mood
    const sp = scoped?.speed ?? speed
    const vol = scoped?.volume ?? volume
    const last = segments[segments.length - 1]
    if (last?.kind === 'speech' && last.mood === m && last.speed === sp && last.volume === vol) last.text = `${last.text} ${text}`
    else segments.push({ kind: 'speech', text, mood: m, speed: sp, volume: vol })
  }
  const pushPause = (seconds: number) => {
    const last = segments[segments.length - 1]
    if (last?.kind === 'pause') last.seconds = Math.min(MAX_PAUSE, Math.round((last.seconds + seconds) * 100) / 100)
    else segments.push({ kind: 'pause', seconds })
  }

  let cursor = 0
  for (const match of input.matchAll(TAG_RE)) {
    pushText(input.slice(cursor, match.index))
    cursor = (match.index ?? 0) + match[0].length
    const effects = readEffects(match[1])
    const scopedText = match[2]
    if (!effects) {
      unknownTags.push(match[0])
      if (scopedText !== undefined) pushText(scopedText) // still say the words
      continue
    }
    if (effects.pause !== undefined && effects.pause !== null) pushPause(effects.pause)
    if (scopedText !== undefined) {
      pushText(scopedText, effects) // effects for this text only
    } else if (effects.normal) {
      mood = null; speed = 'normal'; volume = 'normal'
    } else {
      if (effects.mood) mood = effects.mood
      if (effects.speed) speed = effects.speed
      if (effects.volume) volume = effects.volume
    }
  }
  pushText(input.slice(cursor))
  return { segments: trimPauses(segments), unknownTags, spokenLength }
}

function trimPauses(segments: Segment[]) {
  const result = [...segments]
  while (result[0]?.kind === 'pause') result.shift()
  while (result[result.length - 1]?.kind === 'pause') result.pop()
  return result
}

/**
 * Split speech into sentences, so each one is generated on its own and the read-along knows where it starts.
 * Very short sentences ("Hi!") join the next one, so the voice keeps its flow.
 */
export function splitSentences(text: string, locale: string): string[] {
  let parts: string[]
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    parts = [...new Intl.Segmenter(locale, { granularity: 'sentence' }).segment(text)].map((part) => part.segment.trim())
  } else {
    parts = text.split(/(?<=[.!?…])\s+/).map((part) => part.trim())
  }
  const result: string[] = []
  let carry = ''
  for (const part of parts.filter(Boolean)) {
    const joined = carry ? `${carry} ${part}` : part
    if (joined.length < 24) carry = joined
    else { result.push(joined); carry = '' }
  }
  if (carry) {
    if (result.length) result[result.length - 1] += ` ${carry}`
    else result.push(carry)
  }
  return result
}
