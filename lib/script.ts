// Parses scripts like: "Hi! [pause 1s] [happy] Great news. [slow] Listen carefully. [normal] Bye."
// Tags change the delivery of everything after them until another tag (or [normal]) changes it back.

export const MOODS = ['happy', 'sad', 'excited', 'calm', 'whisper'] as const
export type Mood = (typeof MOODS)[number]
export type Speed = 'slow' | 'normal' | 'fast'
export type Volume = 'soft' | 'normal' | 'loud'

export type Segment =
  | { kind: 'speech'; text: string; mood: Mood | null; speed: Speed; volume: Volume }
  | { kind: 'pause'; seconds: number }

export type ParsedScript = { segments: Segment[]; unknownTags: string[]; spokenLength: number }

const TAG_RE = /\[([^\]]*)\]/g
const DEFAULT_PAUSE = 0.6
const MAX_PAUSE = 5

export const SPEED_FACTOR: Record<Speed, number> = { slow: 0.85, normal: 1, fast: 1.18 }
export const VOLUME_GAIN: Record<Volume, number> = { soft: 0.5, normal: 1, loud: 1.5 }

function parsePause(arg: string | undefined): number | null {
  if (!arg) return DEFAULT_PAUSE
  const match = arg.trim().match(/^(\d+(?:\.\d+)?)\s*(ms|s)?$/i)
  if (!match) return null
  const value = Number(match[1])
  const seconds = match[2]?.toLowerCase() === 'ms' ? value / 1000 : value
  return Math.min(MAX_PAUSE, Math.max(0.05, seconds))
}

export function parseScript(rawInput: string): ParsedScript {
  // A blank line between paragraphs becomes a short breath.
  const input = rawInput.replace(/\n[ \t]*\n+/g, ' [pause 0.5s] ')
  const segments: Segment[] = []
  const unknownTags: string[] = []
  let mood: Mood | null = null
  let speed: Speed = 'normal'
  let volume: Volume = 'normal'
  let spokenLength = 0

  const pushText = (raw: string) => {
    const text = raw.replace(/\s+/g, ' ').trim()
    if (!/[\p{L}\p{N}]/u.test(text)) return
    spokenLength += text.length
    const last = segments[segments.length - 1]
    if (last?.kind === 'speech' && last.mood === mood && last.speed === speed && last.volume === volume) {
      last.text = `${last.text} ${text}`
    } else {
      segments.push({ kind: 'speech', text, mood, speed, volume })
    }
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
    const [name, ...rest] = match[1].trim().toLowerCase().split(/\s+/)
    const arg = rest.join(' ')

    if (name === 'pause') {
      const seconds = parsePause(arg)
      if (seconds === null) unknownTags.push(match[0])
      else pushPause(seconds)
    } else if ((MOODS as readonly string[]).includes(name)) mood = name as Mood
    else if (name === 'slow' || name === 'fast') speed = name
    else if (name === 'soft' || name === 'loud') volume = name
    else if (name === 'normal') { mood = null; speed = 'normal'; volume = 'normal' }
    else unknownTags.push(match[0])
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

export const isKnownTag = (tag: string) => {
  const [name, ...rest] = tag.slice(1, -1).trim().toLowerCase().split(/\s+/)
  if (name === 'pause') return parsePause(rest.join(' ')) !== null
  return (MOODS as readonly string[]).includes(name) || ['slow', 'fast', 'soft', 'loud', 'normal'].includes(name)
}
