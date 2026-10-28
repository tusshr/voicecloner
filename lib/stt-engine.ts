'use client'

import { WHISPER_LANGUAGE, type Locale } from '@/lib/i18n'

/**
 * Voice to text engines, both on the visitor's device:
 * - Whistle (Cactus Compute, Apache-2.0, ~18 MB): default for en, es, de, it (beta). Worker: public/whistle-worker.js.
 * - Whisper base (OpenAI, MIT, ~77 MB): Portuguese, and anyone who switches back. Worker: public/whisper-worker.js.
 * `?engine=mock` swaps in a fake transcriber for tests, like the speech engine.
 */
export type SttChunk = { text: string; start: number; end: number }
export type SttResult = { text: string; chunks: SttChunk[] }
export const STT_RATE = 16_000

type Pending = { resolve: (result: SttResult) => void; reject: (error: Error) => void; onPartial?: (text: string) => void }

export interface SttEngine {
  load(onProgress?: (value: number) => void): Promise<void>
  transcribe(audio: Float32Array, language: Locale, onPartial?: (text: string) => void): Promise<SttResult>
}

export type SttEngineKind = 'whistle' | 'whisper'
const WHISTLE_LANGUAGES: Locale[] = ['en', 'es', 'de', 'it']
/** Whistle where it speaks the language, unless the visitor chose Whisper. */
export const engineFor = (language: Locale, preferWhisper: boolean): SttEngineKind =>
  !preferWhisper && WHISTLE_LANGUAGES.includes(language) ? 'whistle' : 'whisper'

class WorkerEngine implements SttEngine {
  private worker: Worker
  private pending = new Map<number, Pending>()
  private nextId = 1
  private loading: Promise<void> | null = null
  private onProgress?: (value: number) => void

  constructor() {
    this.worker = new Worker('/whisper-worker.js', { type: 'module' })
    this.worker.onmessage = (event) => {
      const message = event.data
      if (message.type === 'progress') { this.onProgress?.(message.value); return }
      const job = this.pending.get(message.id)
      if (message.type === 'partial') { job?.onPartial?.(message.text); return }
      if (message.type === 'result' && job) { this.pending.delete(message.id); job.resolve({ text: message.text, chunks: message.chunks }); return }
      if (message.type === 'error' && job) { this.pending.delete(message.id); job.reject(new Error(message.message)) }
    }
  }

  load(onProgress?: (value: number) => void) {
    this.onProgress = onProgress
    if (!this.loading) {
      this.loading = new Promise<void>((resolve, reject) => {
        const onMessage = (event: MessageEvent) => {
          if (event.data.type === 'ready') { this.worker.removeEventListener('message', onMessage); resolve() }
          if (event.data.type === 'error' && event.data.id === undefined) { this.worker.removeEventListener('message', onMessage); this.loading = null; reject(new Error(event.data.message)) }
        }
        this.worker.addEventListener('message', onMessage)
        this.worker.onerror = () => { this.loading = null; reject(new Error('The speech model could not start.')) }
        this.worker.postMessage({ type: 'load', device: new URLSearchParams(location.search).get('device') })
      })
    }
    return this.loading
  }

  transcribe(audio: Float32Array, language: Locale, onPartial?: (text: string) => void) {
    const id = this.nextId++
    return new Promise<SttResult>((resolve, reject) => {
      this.pending.set(id, { resolve, reject, onPartial })
      const copy = audio.slice()
      this.worker.postMessage({ type: 'transcribe', id, audio: copy, language: WHISPER_LANGUAGE[language], stream: !!onPartial }, [copy.buffer])
    })
  }
}

/** For tests: "transcribes" any audio as a fixed sentence, a word at a time. */
class MockEngine implements SttEngine {
  async load(onProgress?: (value: number) => void) {
    for (let i = 1; i <= 5; i++) { await wait(150); onProgress?.(i / 5) }
  }
  async transcribe(audio: Float32Array, _language: Locale, onPartial?: (text: string) => void) {
    const seconds = audio.length / STT_RATE
    const words = 'This is a test transcript made by the mock engine for the voice to text tool.'.split(' ')
    const count = Math.max(3, Math.min(words.length, Math.round(seconds * 2.5)))
    let text = ''
    for (let i = 0; i < count; i++) { await wait(40); text += (i ? ' ' : '') + words[i]; onPartial?.(text) }
    return { text, chunks: [{ text, start: 0, end: Math.max(0.5, seconds) }] }
  }
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

type WhistleWord = { word: string; start: number; end: number }
type WhistleSession = { transcribe(audio: Float32Array, options: { language: string; wordTimestamps: boolean }): Promise<{ text: string; words?: WhistleWord[] }> }
const NEEDLE = 'https://cdn.jsdelivr.net/npm/cactus-needle@0.3.0'
const WHISTLE_MAX = 28 * STT_RATE // Whistle hears at most 30 s per call

class WhistleEngine implements SttEngine {
  private session: Promise<WhistleSession> | null = null
  private onProgress?: (value: number) => void

  load(onProgress?: (value: number) => void) {
    this.onProgress = onProgress
    if (!this.session) {
      this.session = import(/* webpackIgnore: true */ /* turbopackIgnore: true */ `${NEEDLE}/dist/browser/index.js`).then(({ createWhistle }) =>
        createWhistle({
          workerUrl: '/whistle-worker.js', // must be same-origin; a copy of cactus-needle's dist/browser/worker.js
          wasmUrl: `${NEEDLE}/vendor/needle.wasm`,
          onDownloadProgress: ({ loaded, total }: { loaded: number; total?: number }) => { if (total) this.onProgress?.(loaded / total) },
        }))
      this.session.catch(() => { this.session = null })
    }
    return this.session.then(() => undefined)
  }

  async transcribe(audio: Float32Array, language: Locale, onPartial?: (text: string) => void) {
    const session = await this.session!
    const texts: string[] = []
    const words: WhistleWord[] = []
    for (const [from, to] of splitAudio(audio, WHISTLE_MAX)) {
      const result = await session.transcribe(audio.slice(from, to), { language, wordTimestamps: true })
      if (result.text.trim()) texts.push(result.text.trim())
      for (const w of result.words ?? []) words.push({ word: w.word.trim(), start: w.start + from / STT_RATE, end: w.end + from / STT_RATE })
      onPartial?.(texts.join(' '))
    }
    return { text: texts.join(' '), chunks: subtitleLines(words) }
  }
}

/** Cuts audio into parts of at most `max` samples, each at the quietest 0.1 s of its last 8 s, so words are rarely split. */
export function splitAudio(audio: Float32Array, max: number): [number, number][] {
  const frame = STT_RATE / 10
  const parts: [number, number][] = []
  let start = 0
  while (audio.length - start > max) {
    let cut = start + max
    let quietest = Infinity
    for (let at = start + max - 8 * STT_RATE; at + frame <= start + max; at += frame) {
      let energy = 0
      for (let i = at; i < at + frame; i++) energy += audio[i] * audio[i]
      if (energy < quietest) { quietest = energy; cut = at + frame / 2 }
    }
    parts.push([start, cut])
    start = cut
  }
  parts.push([start, audio.length])
  return parts
}

/** Groups words into subtitle lines: a line ends at . ? ! or after 12 words. */
function subtitleLines(words: WhistleWord[]): SttChunk[] {
  const lines: SttChunk[] = []
  let line: WhistleWord[] = []
  for (const w of words) {
    if (!w.word) continue
    line.push(w)
    if (/[.?!…]$/.test(w.word) || line.length >= 12) {
      lines.push({ text: line.map((x) => x.word).join(' '), start: line[0].start, end: line[line.length - 1].end })
      line = []
    }
  }
  if (line.length) lines.push({ text: line.map((x) => x.word).join(' '), start: line[0].start, end: line[line.length - 1].end })
  return lines
}

const engines: Partial<Record<SttEngineKind | 'mock', SttEngine>> = {}
/** One engine per kind, created on first use, so only the model a language needs is downloaded. */
export function getSttEngine(kind: SttEngineKind): SttEngine {
  const key = new URLSearchParams(window.location.search).get('engine') === 'mock' ? 'mock' : kind
  return engines[key] ??= key === 'mock' ? new MockEngine() : key === 'whistle' ? new WhistleEngine() : new WorkerEngine()
}

export const sttSupported = () => typeof window !== 'undefined' && 'Worker' in window && 'WebAssembly' in window && 'AudioContext' in window

/** Decode any audio file the browser can read into 16 kHz mono, as Whisper expects. */
export async function decodeTo16k(blob: Blob): Promise<Float32Array> {
  const decoder = new AudioContext()
  try {
    const decoded = await decoder.decodeAudioData(await blob.arrayBuffer())
    const offline = new OfflineAudioContext(1, Math.max(1, Math.ceil(decoded.duration * STT_RATE)), STT_RATE)
    const source = offline.createBufferSource()
    source.buffer = decoded
    source.connect(offline.destination)
    source.start()
    return (await offline.startRendering()).getChannelData(0).slice()
  } finally {
    void decoder.close()
  }
}

/** Linear resampling for microphone audio (recorded at the device rate). */
export function resampleTo16k(input: Float32Array, rate: number): Float32Array {
  if (rate === STT_RATE) return input
  const ratio = rate / STT_RATE
  const out = new Float32Array(Math.floor(input.length / ratio))
  for (let i = 0; i < out.length; i++) {
    const at = i * ratio
    const j = Math.floor(at)
    const f = at - j
    out[i] = input[j] * (1 - f) + (input[j + 1] ?? input[j]) * f
  }
  return out
}

/** Subtitles in SubRip (.srt) format. */
export function toSrt(chunks: SttChunk[]) {
  const time = (s: number) => {
    const ms = Math.round(s * 1000)
    const pad = (n: number, w = 2) => String(n).padStart(w, '0')
    return `${pad(Math.floor(ms / 3_600_000))}:${pad(Math.floor(ms / 60_000) % 60)}:${pad(Math.floor(ms / 1000) % 60)},${pad(ms % 1000, 3)}`
  }
  return chunks.filter((chunk) => chunk.text.trim()).map((chunk, i) => `${i + 1}\n${time(chunk.start)} --> ${time(Math.max(chunk.end ?? chunk.start + 2, chunk.start + 0.5))}\n${chunk.text.trim()}\n`).join('\n')
}
