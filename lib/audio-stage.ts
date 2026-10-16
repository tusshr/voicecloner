'use client'

// One AudioContext + analyser shared by the mic and the player, so a single waveform can show both.

export const SAMPLE_RATE = 24000

let context: AudioContext | null = null
let analyser: AnalyserNode | null = null
let micSource: MediaStreamAudioSourceNode | null = null

function graph() {
  if (!context) {
    context = new AudioContext()
    analyser = context.createAnalyser()
    analyser.fftSize = 512
    analyser.smoothingTimeConstant = 0.7
  }
  if (context.state === 'suspended') void context.resume()
  return { context, analyser: analyser! }
}

export const getAnalyser = () => analyser

export function attachMic(stream: MediaStream) {
  const { context, analyser } = graph()
  micSource?.disconnect()
  micSource = context.createMediaStreamSource(stream)
  micSource.connect(analyser) // not connected to speakers: no echo
}

export function detachMic() {
  micSource?.disconnect()
  micSource = null
}

type PlayerListener = (state: { playingId: string | null; position: number; duration: number }) => void

/** Plays Float32 audio through the analyser. Only one clip plays at a time. */
class Player {
  private source: AudioBufferSourceNode | null = null
  private startedAt = 0
  private offset = 0
  private buffer: AudioBuffer | null = null
  private id: string | null = null
  private listeners = new Set<PlayerListener>()
  private raf = 0

  subscribe(listener: PlayerListener) {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  get playingId() { return this.source ? this.id : null }

  toggle(id: string, samples: Float32Array) {
    if (this.source && this.id === id) this.pause()
    else this.play(id, samples, this.id === id ? this.offset : 0)
  }

  play(id: string, samples: Float32Array, from = 0) {
    const { context, analyser } = graph()
    this.stopSource()
    if (this.id !== id || !this.buffer) {
      this.buffer = context.createBuffer(1, samples.length, SAMPLE_RATE)
      this.buffer.copyToChannel(samples, 0)
    }
    this.id = id
    const source = context.createBufferSource()
    source.buffer = this.buffer
    source.connect(analyser)
    analyser.connect(context.destination)
    source.onended = () => {
      if (this.source !== source) return
      this.source = null
      this.offset = 0
      analyser.disconnect(context.destination)
      this.emit()
    }
    this.offset = from >= this.buffer.duration ? 0 : from
    this.startedAt = context.currentTime - this.offset
    source.start(0, this.offset)
    this.source = source
    this.tick()
  }

  seek(id: string, samples: Float32Array, fraction: number) {
    const duration = samples.length / SAMPLE_RATE
    if (this.id !== id) { this.buffer = null }
    this.play(id, samples, Math.max(0, Math.min(1, fraction)) * duration)
  }

  pause() {
    if (!this.source || !context) return
    this.offset = context.currentTime - this.startedAt
    this.stopSource()
    this.emit()
  }

  stop() {
    this.stopSource()
    this.offset = 0
    this.id = null
    this.buffer = null
    this.emit()
  }

  private stopSource() {
    if (!this.source) return
    const source = this.source
    this.source = null
    source.onended = null
    try { source.stop() } catch { /* already stopped */ }
    source.disconnect()
    try { analyser?.disconnect(context!.destination) } catch { /* not connected */ }
    cancelAnimationFrame(this.raf)
  }

  private tick = () => {
    this.emit()
    if (this.source) this.raf = requestAnimationFrame(this.tick)
  }

  private emit() {
    const duration = this.buffer?.duration ?? 0
    const position = this.source && context ? Math.min(duration, context.currentTime - this.startedAt) : this.offset
    for (const listener of this.listeners) listener({ playingId: this.playingId, position, duration })
  }
}

export const player = new Player()

/* ---------------- decoding ---------------- */

/** Decode any audio file/blob to 24 kHz mono, peak-normalized. */
export async function decodeToMono24k(blob: Blob): Promise<Float32Array> {
  const decoder = new AudioContext()
  try {
    const decoded = await decoder.decodeAudioData(await blob.arrayBuffer())
    const length = Math.max(1, Math.ceil(decoded.duration * SAMPLE_RATE))
    const offline = new OfflineAudioContext(1, length, SAMPLE_RATE)
    const source = offline.createBufferSource()
    source.buffer = decoded
    source.connect(offline.destination)
    source.start()
    const rendered = await offline.startRendering()
    return normalizePeak(rendered.getChannelData(0).slice())
  } finally {
    await decoder.close()
  }
}

function normalizePeak(samples: Float32Array, target = 0.9) {
  let peak = 0
  for (let i = 0; i < samples.length; i++) peak = Math.max(peak, Math.abs(samples[i]))
  if (peak > 0 && peak < target) {
    const gain = Math.min(target / peak, 8)
    for (let i = 0; i < samples.length; i++) samples[i] *= gain
  }
  return samples
}

export function encodeWav(samples: Float32Array, sampleRate = SAMPLE_RATE) {
  const buffer = new ArrayBuffer(44 + samples.length * 2)
  const view = new DataView(buffer)
  const write = (offset: number, text: string) => { for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i)) }
  write(0, 'RIFF'); view.setUint32(4, 36 + samples.length * 2, true); write(8, 'WAVE'); write(12, 'fmt ')
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true); view.setUint16(34, 16, true); write(36, 'data'); view.setUint32(40, samples.length * 2, true)
  for (let i = 0; i < samples.length; i++) view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, samples[i])) * 0x7fff, true)
  return new Blob([buffer], { type: 'audio/wav' })
}

export const formatTime = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`
