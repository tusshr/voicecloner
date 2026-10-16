'use client'

export const SAMPLE_RATE = 24000
export const WORKER_PATH = '/pocket-tts/inference-worker.js'
export const defaultScript =
  'The morning light moves softly across the room. This is a short sample of my voice, spoken naturally and clearly.'


export type LoadProgress = {
  phase: 'download' | 'init'
  pct: number
  loadedMB: number
  totalMB: number
  label: string
}

export type TTSEngine = {
  loadModel(onProgress: (progress: LoadProgress) => void, language?: string): Promise<void>
  /** Clone a voice from 24 kHz mono audio and keep it in memory under `name`. */
  createVoice(audio: Float32Array, name: string): Promise<void>
  generate(text: string, voiceName: string): Promise<Float32Array>
  stop(): void
  terminate(): void
}

/** Thrown when the user presses Stop, so the UI can tell it apart from a real failure. */
export class StoppedError extends Error {
  constructor() {
    super('Generation stopped.')
    this.name = 'StoppedError'
  }
}

type WorkerEvent =
  | { type: 'download_progress'; loaded: number; total: number; label?: string }
  | { type: 'status'; status: string; state: string }
  | { type: 'loaded' | 'voice_encoded' | 'generation_started' | 'stream_ended' | 'voices_loaded' | 'bundle_loaded' | 'model_status' }
  | { type: 'audio_chunk'; data: Float32Array }
  | { type: 'error'; error: string }

type Kind = 'load' | 'clone' | 'generate'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const MB = 1024 * 1024

/* ------------------------------------------------------------------ */
/* Mock engine: ?engine=mock, plus ?fail=load|clone|generate           */
/* ------------------------------------------------------------------ */
export class MockEngine implements TTSEngine {
  private stopped = false
  private shouldFail(step: string) {
    return typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('fail') === step
  }
  async loadModel(onProgress: (progress: LoadProgress) => void) {
    for (let pct = 0; pct <= 100; pct += 10) {
      await wait(250)
      if (this.shouldFail('load') && pct === 50) throw new Error('Mock load failure')
      onProgress({ phase: 'download', pct, loadedMB: (146 * pct) / 100, totalMB: 146, label: 'Downloading model' })
    }
    onProgress({ phase: 'init', pct: 100, loadedMB: 146, totalMB: 146, label: 'Initializing models…' })
    await wait(600)
  }
  async createVoice() {
    await wait(800)
    if (this.shouldFail('clone')) throw new Error('Mock clone failure')
  }
  async generate(text: string) {
    this.stopped = false
    for (let i = 0; i < 10; i++) {
      await wait(150)
      if (this.stopped) throw new StoppedError()
    }
    if (this.shouldFail('generate')) throw new Error('Mock generate failure')
    const length = Math.min(96000, Math.max(24000, text.trim().length * 420))
    const output = new Float32Array(length)
    for (let i = 0; i < length; i++) output[i] = Math.sin((2 * Math.PI * 220 * i) / SAMPLE_RATE) * 0.12 * Math.exp(-i / length / 2)
    return output
  }
  stop() {
    this.stopped = true
  }
  terminate() {}
}

/* ------------------------------------------------------------------ */
/* Real engine: talks to public/pocket-tts/inference-worker.js         */
/* ------------------------------------------------------------------ */
export class PocketTTSEngine implements TTSEngine {
  private worker: Worker
  private pending: {
    kind: Kind
    resolve: (value: unknown) => void
    reject: (error: Error) => void
    chunks: Float32Array[]
    started?: boolean
    onProgress?: (progress: LoadProgress) => void
    lastProgress?: LoadProgress
  } | null = null

  constructor() {
    this.worker = new Worker(WORKER_PATH, { type: 'module' })
    this.worker.onmessage = (event: MessageEvent<WorkerEvent>) => this.handleMessage(event.data)
    this.worker.onerror = (event) => {
      console.error('[voice-clone] worker script error', event)
      this.fail(new Error('The voice engine could not start. Please reload the page and try again.'))
    }
  }

  loadModel(onProgress: (progress: LoadProgress) => void, language?: string) {
    return this.request('load', { type: 'load', data: { language } }, onProgress).then(() => undefined)
  }

  createVoice(audio: Float32Array, name: string) {
    // Send a COPY: transferring the original would detach it and break "Retry".
    const copy = audio.slice()
    return this.request('clone', { type: 'encode_voice', data: { audio: copy, name } }, undefined, [copy.buffer]).then(() => undefined)
  }

  generate(text: string, voiceName: string) {
    return this.request('generate', { type: 'generate', data: { text, voice: voiceName } }) as Promise<Float32Array>
  }

  stop() {
    this.worker.postMessage({ type: 'stop' })
    if (this.pending?.kind === 'generate') {
      const { reject } = this.pending
      this.pending = null
      reject(new StoppedError())
    }
  }

  terminate() {
    this.worker.terminate()
    this.fail(new Error('The voice engine was reset.'))
  }

  private request(kind: Kind, message: unknown, onProgress?: (progress: LoadProgress) => void, transfer: Transferable[] = []) {
    if (this.pending) return Promise.reject(new Error('Please wait for the current step to finish.'))
    return new Promise<unknown>((resolve, reject) => {
      this.pending = { kind, resolve, reject, chunks: [], onProgress }
      this.worker.postMessage(message, transfer)
    })
  }

  private fail(error: Error) {
    const pending = this.pending
    this.pending = null
    pending?.reject(error)
  }

  private handleMessage(message: WorkerEvent) {
    const pending = this.pending
    switch (message.type) {
      case 'download_progress': {
        if (!pending?.onProgress) return
        const progress: LoadProgress = {
          phase: 'download',
          pct: message.total ? Math.min(100, Math.round((message.loaded / message.total) * 100)) : 0,
          loadedMB: message.loaded / MB,
          totalMB: message.total / MB,
          label: message.label?.includes('cache') ? 'Loading model from cache' : 'Downloading model',
        }
        pending.lastProgress = progress
        pending.onProgress(progress)
        return
      }
      case 'status': {
        if (pending?.kind === 'load' && pending.onProgress && /initializ/i.test(message.status)) {
          const last = pending.lastProgress
          pending.onProgress({ phase: 'init', pct: 100, loadedMB: last?.totalMB ?? 0, totalMB: last?.totalMB ?? 0, label: 'Initializing models…' })
        }
        return
      }
      case 'error': {
        console.error('[voice-clone] engine error:', message.error)
        this.fail(new Error(message.error))
        return
      }
      case 'generation_started': {
        if (pending?.kind === 'generate') pending.started = true
        return
      }
      case 'audio_chunk': {
        // Ignore leftover chunks from a stopped run that arrive before this run starts.
        if (pending?.kind === 'generate' && pending.started) pending.chunks.push(message.data)
        return
      }
      case 'loaded': {
        if (pending?.kind === 'load') { this.pending = null; pending.resolve(true) }
        return
      }
      case 'voice_encoded': {
        if (pending?.kind === 'clone') { this.pending = null; pending.resolve(true) }
        return
      }
      case 'stream_ended': {
        // The worker also sends stream_ended after an error; by then pending is already cleared.
        if (pending?.kind !== 'generate' || !pending.started) return
        this.pending = null
        const total = pending.chunks.reduce((sum, chunk) => sum + chunk.length, 0)
        if (total === 0) { pending.reject(new Error('The model produced no audio. Try a different script.')); return }
        const audio = new Float32Array(total)
        let offset = 0
        for (const chunk of pending.chunks) { audio.set(chunk, offset); offset += chunk.length }
        pending.resolve(audio)
        return
      }
      default:
        return
    }
  }
}

export function createEngine(): TTSEngine {
  const params = new URLSearchParams(window.location.search)
  return params.get('engine') === 'mock' ? new MockEngine() : new PocketTTSEngine()
}

export function isSupported() {
  return typeof window !== 'undefined' && 'Worker' in window && 'WebAssembly' in window && 'AudioContext' in window
}
export function canRecord() {
  return typeof window !== 'undefined' && 'MediaRecorder' in window && !!navigator.mediaDevices?.getUserMedia
}
export function isLowPowerDevice() {
  if (typeof window === 'undefined') return false
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
  return window.innerWidth < 640 || (memory !== undefined && memory <= 4)
}

