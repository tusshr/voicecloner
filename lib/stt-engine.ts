'use client'

/**
 * Voice to text: a small client for public/whisper-worker.js (Whisper base through transformers.js).
 * `?engine=mock` swaps in a fake transcriber for tests, like the speech engine.
 */
export type SttChunk = { text: string; start: number; end: number }
export type SttResult = { text: string; chunks: SttChunk[] }
export const STT_RATE = 16_000

type Pending = { resolve: (result: SttResult) => void; reject: (error: Error) => void; onPartial?: (text: string) => void }

export interface SttEngine {
  load(onProgress?: (value: number) => void): Promise<void>
  transcribe(audio: Float32Array, language: string, onPartial?: (text: string) => void): Promise<SttResult>
}

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

  transcribe(audio: Float32Array, language: string, onPartial?: (text: string) => void) {
    const id = this.nextId++
    return new Promise<SttResult>((resolve, reject) => {
      this.pending.set(id, { resolve, reject, onPartial })
      const copy = audio.slice()
      this.worker.postMessage({ type: 'transcribe', id, audio: copy, language, stream: !!onPartial }, [copy.buffer])
    })
  }
}

/** For tests: "transcribes" any audio as a fixed sentence, a word at a time. */
class MockEngine implements SttEngine {
  async load(onProgress?: (value: number) => void) {
    for (let i = 1; i <= 5; i++) { await wait(150); onProgress?.(i / 5) }
  }
  async transcribe(audio: Float32Array, _language: string, onPartial?: (text: string) => void) {
    const seconds = audio.length / STT_RATE
    const words = 'This is a test transcript made by the mock engine for the voice to text tool.'.split(' ')
    const count = Math.max(3, Math.min(words.length, Math.round(seconds * 2.5)))
    let text = ''
    for (let i = 0; i < count; i++) { await wait(40); text += (i ? ' ' : '') + words[i]; onPartial?.(text) }
    return { text, chunks: [{ text, start: 0, end: Math.max(0.5, seconds) }] }
  }
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

let engine: SttEngine | null = null
export function getSttEngine(): SttEngine {
  if (!engine) {
    const mock = new URLSearchParams(window.location.search).get('engine') === 'mock'
    engine = mock ? new MockEngine() : new WorkerEngine()
  }
  return engine
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
