'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Copy, Download, FileText, Mic, Play, Plus, Square, Upload, Volume2, X } from 'lucide-react'
import { LanguageSwitcher } from '@/components/language-switcher'
import { SpeechLanguageSelect } from '@/components/speech-language-select'
import { ScrollFade } from '@/components/scroll-fade'
import { PinnedHeader } from '@/components/site-header'
import { ToolSwitch } from '@/components/tool-switch'
import { Waveform, type WaveMode } from '@/components/waveform'
import type { SttContent } from '@/content/stt'
import { TOOL_NAMES } from '@/content/tools'
import { attachMic, detachMic, formatTime } from '@/lib/audio-stage'
import { fmt, localePath, WHISPER_LANGUAGE, type Locale } from '@/lib/i18n'
import { SITE_NAME } from '@/lib/site'
import { decodeTo16k, getSttEngine, resampleTo16k, STT_RATE, sttSupported, toSrt, type SttChunk } from '@/lib/stt-engine'

type Entry = { id: string; text: string; chunks: SttChunk[]; seconds: number; at: number }
type Phase = 'idle' | 'recording' | 'finishing' | 'transcribing'
const HISTORY_KEY = 'stt-history'
const SEGMENT_SECONDS = 24 // Whisper hears 30 s at a time; a recording is split into parts a bit shorter than that
const LIVE_EVERY_MS = 3000

/** Voice to text: record or upload, Whisper writes it down, then copy, download or read it aloud. */
export function SttTool({ lang, ui, languageLabel }: { lang: Locale; ui: SttContent['ui']; languageLabel: string }) {
  const [speechLang, setSpeechLang] = useState<Locale>(lang)
  const [phase, setPhase] = useState<Phase>('idle')
  const [model, setModel] = useState<'idle' | 'loading' | 'ready' | 'failed'>('idle')
  const [progress, setProgress] = useState<number | undefined>()
  const [elapsed, setElapsed] = useState(0)
  const [transcript, setTranscript] = useState('')
  const [chunks, setChunks] = useState<SttChunk[]>([])
  const [live, setLive] = useState('') // text heard so far that is not final yet
  const [committed, setCommitted] = useState('') // final text of this recording so far
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<Entry[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Recording state lives in refs: the audio callback and timers must not wait for renders.
  const rec = useRef<{ stream: MediaStream; ctx: AudioContext; proc: ScriptProcessorNode; rate: number; started: number } | null>(null)
  const samples = useRef<Float32Array[]>([])
  const total = useRef(0)
  const segStart = useRef(0)
  const busy = useRef(false)
  const parts = useRef<{ text: string; chunks: SttChunk[] }[]>([])
  const baseText = useRef('')

  useEffect(() => {
    try { setHistory(JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]')) } catch {}
    const timer = setInterval(() => setNow(Date.now()), 30_000)
    return () => {
      clearInterval(timer)
      // Free the mic when leaving by client navigation.
      const r = rec.current
      if (r) { r.stream.getTracks().forEach((track) => track.stop()); r.proc.disconnect(); detachMic(); void r.ctx.close() }
    }
  }, [])
  const saveHistory = (next: Entry[]) => {
    setHistory(next)
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next.slice(0, 20))) } catch {}
  }

  const ensureModel = useCallback(async () => {
    if (model === 'ready') return true
    setModel('loading')
    try {
      await getSttEngine().load((value) => setProgress(value))
      setModel('ready')
      return true
    } catch (err) {
      setModel('failed')
      setError(fmt(ui.failed, { error: err instanceof Error ? err.message : String(err) }))
      return false
    }
  }, [model, ui.failed])

  const audioBetween = (from: number, to: number) => {
    const out = new Float32Array(to - from)
    let at = 0
    let offset = 0
    for (const block of samples.current) {
      const end = at + block.length
      if (end > from && at < to) {
        const a = Math.max(from, at) - at
        const b = Math.min(to, end) - at
        out.set(block.subarray(a, b), offset)
        offset += b - a
      }
      at = end
    }
    return out
  }

  /** Transcribe from the start of the current part to `end`; a final part is kept, a live one only previews. */
  const transcribePart = async (end: number, final: boolean) => {
    const r = rec.current?.rate ?? 48_000
    const from = segStart.current
    if (end - from < r * 0.4) return
    if (final) segStart.current = end
    busy.current = true
    try {
      const audio = resampleTo16k(audioBetween(from, end), r)
      const result = await getSttEngine().transcribe(audio, WHISPER_LANGUAGE[speechLang])
      if (final) {
        const offset = from / r
        parts.current.push({ text: result.text, chunks: result.chunks.map((c) => ({ ...c, start: c.start + offset, end: (c.end ?? c.start) + offset })) })
        setCommitted(parts.current.map((p) => p.text).join(' ').trim())
        setLive('')
      } else if (segStart.current === from) setLive(result.text)
    } catch (err) {
      setError(fmt(ui.failed, { error: err instanceof Error ? err.message : String(err) }))
    } finally {
      busy.current = false
    }
  }

  // While recording: preview the current part every few seconds, and close it before it gets too long for Whisper.
  useEffect(() => {
    if (phase !== 'recording') return
    const timer = setInterval(() => {
      const r = rec.current
      if (!r) return
      setElapsed((performance.now() - r.started) / 1000)
    }, 250)
    const live = setInterval(() => {
      const r = rec.current
      if (!r || busy.current || model !== 'ready') return
      const end = total.current
      const seconds = (end - segStart.current) / r.rate
      void transcribePart(end, seconds > SEGMENT_SECONDS)
    }, LIVE_EVERY_MS)
    return () => { clearInterval(timer); clearInterval(live) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, model])

  const start = async () => {
    setError(null)
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } })
    } catch {
      setError(ui.noMic)
      return
    }
    void ensureModel()
    const ctx = new AudioContext()
    const source = ctx.createMediaStreamSource(stream)
    const proc = ctx.createScriptProcessor(4096, 1, 1)
    const mute = ctx.createGain()
    mute.gain.value = 0
    source.connect(proc); proc.connect(mute); mute.connect(ctx.destination)
    samples.current = []; total.current = 0; segStart.current = 0; parts.current = []
    proc.onaudioprocess = (event) => {
      const block = new Float32Array(event.inputBuffer.getChannelData(0))
      samples.current.push(block)
      total.current += block.length
    }
    attachMic(stream)
    rec.current = { stream, ctx, proc, rate: ctx.sampleRate, started: performance.now() }
    baseText.current = transcript.trim()
    setCommitted(''); setLive(''); setElapsed(0)
    setPhase('recording')
  }

  const stop = async () => {
    const r = rec.current
    if (!r) return
    r.stream.getTracks().forEach((track) => track.stop())
    r.proc.disconnect()
    detachMic()
    const seconds = total.current / r.rate
    setPhase('finishing')
    const ready = await ensureModel()
    while (busy.current) await new Promise((resolve) => setTimeout(resolve, 100))
    if (ready) await transcribePart(total.current, true)
    void r.ctx.close()
    rec.current = null
    const spoken = parts.current.map((p) => p.text).join(' ').trim()
    const shift = 0
    const newChunks = parts.current.flatMap((p) => p.chunks.map((c) => ({ ...c, start: c.start + shift, end: c.end + shift })))
    const text = [baseText.current, spoken].filter(Boolean).join(' ')
    setTranscript(text)
    setChunks(baseText.current ? [] : newChunks)
    setCommitted(''); setLive('')
    setPhase('idle')
    if (spoken) {
      const entry: Entry = { id: crypto.randomUUID(), text, chunks: baseText.current ? [] : newChunks, seconds, at: Date.now() }
      setActiveId(entry.id)
      saveHistory([entry, ...history.filter((e) => e.id !== activeId || !baseText.current)])
    }
  }

  const onFile = async (file: File | undefined) => {
    if (!file) return
    setError(null)
    setPhase('transcribing')
    setLive('')
    try {
      const [audio, ready] = await Promise.all([decodeTo16k(file), ensureModel()])
      if (!ready) { setPhase('idle'); return }
      const result = await getSttEngine().transcribe(audio, WHISPER_LANGUAGE[speechLang], (text) => setLive(text))
      setTranscript(result.text)
      setChunks(result.chunks)
      const entry: Entry = { id: crypto.randomUUID(), text: result.text, chunks: result.chunks, seconds: audio.length / STT_RATE, at: Date.now() }
      setActiveId(entry.id)
      saveHistory([entry, ...history])
    } catch (err) {
      setError(fmt(ui.failed, { error: err instanceof Error ? err.message : String(err) }))
    } finally {
      setLive('')
      setPhase('idle')
    }
  }

  const copy = async () => {
    try { await navigator.clipboard.writeText(transcript); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch {}
  }
  const download = (body: string, ext: string) => {
    const url = URL.createObjectURL(new Blob([body], { type: 'text/plain;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `${SITE_NAME.toLowerCase()}-transcript.${ext}`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  /** Read aloud: hand the text to the text to voice tool, in the language it was spoken in. */
  const readAloud = () => {
    try {
      localStorage.setItem(`script:${lang}`, transcript.slice(0, 700))
      if (speechLang === lang) localStorage.removeItem(`speech-lang:${lang}`); else localStorage.setItem(`speech-lang:${lang}`, speechLang)
    } catch {}
    router.push(localePath(lang))
  }

  const startNew = () => { setTranscript(''); setChunks([]); setActiveId(null); setError(null) }
  const open = (entry: Entry) => { setTranscript(entry.text); setChunks(entry.chunks); setActiveId(entry.id) }
  const remove = (entry: Entry) => {
    saveHistory(history.filter((e) => e.id !== entry.id))
    if (activeId === entry.id) setActiveId(null)
  }

  const working = phase !== 'idle' && phase !== 'recording'
  const hasText = phase === 'idle' && !!transcript.trim()
  const waveMode: WaveMode = phase === 'recording' ? 'live' : working || model === 'loading' ? 'working' : 'idle'
  const words = transcript.trim() ? transcript.trim().split(/\s+/).length : 0
  const supported = typeof window === 'undefined' || sttSupported()

  // The action button keeps one size; it changes its label and gets the running border while working.
  const loadingLabel = progress === undefined ? ui.loading : `${Math.round(progress * 100)}%`
  const action = phase === 'recording'
    ? { label: ui.stop, icon: <Square size={14} />, onClick: () => void stop(), working: true, disabled: false }
    : phase === 'finishing'
      ? { label: model === 'loading' ? loadingLabel : ui.finishing, icon: null, onClick: undefined, working: true, disabled: true }
      : phase === 'transcribing'
        ? { label: model === 'loading' ? loadingLabel : ui.transcribing, icon: null, onClick: undefined, working: true, disabled: true }
        : { label: transcript ? ui.recordMore : ui.record, icon: <Mic size={16} />, onClick: () => void start(), working: false, disabled: !supported }
  const ringValue = phase === 'finishing' || phase === 'transcribing' ? (model === 'loading' ? progress : undefined) : undefined
  const ring = action.working ? `progress-ring${ringValue === undefined ? ' is-indeterminate' : ''}` : ''

  return (
    <div className="tool">
      <PinnedHeader>
        <header className="topbar">
          <Link className="wordmark" href={localePath(lang)}><span className="wordmark-mark" aria-hidden />{SITE_NAME}</Link>
          <ToolSwitch lang={lang} active="stt" variant="header" />
          <div className="topbar-actions">
            <LanguageSwitcher lang={lang} page="voice-to-text" label={languageLabel} />
          </div>
        </header>
      </PinnedHeader>
      <ToolSwitch lang={lang} active="stt" variant="inline" />

      {!supported && <p className="note is-error">{ui.unsupported}</p>}
      <input ref={fileRef} type="file" accept="audio/*,video/*" className="sr-only" tabIndex={-1} aria-label={TOOL_NAMES[lang].upload}
        onChange={(event) => { void onFile(event.target.files?.[0]); event.target.value = '' }} />

      <div className="workspace">
        <section className="pane pane-text" aria-label={TOOL_NAMES[lang].stt}>
          <div className="pane-head">
            <SpeechLanguageSelect value={speechLang} onChange={setSpeechLang} disabled={phase !== 'idle'} label={ui.speechLanguage} />
            <button className="btn btn-outline btn-small" onClick={() => fileRef.current?.click()} disabled={phase !== 'idle' || !supported}>
              {/* Sized to fit the demo button's label too, so the button keeps its width when you switch tools. */}
              <span className="swap is-first">
                <span className="swap-a"><Upload size={14} /> {TOOL_NAMES[lang].upload}</span>
                <span className="swap-sizer" aria-hidden><Play size={14} /> {TOOL_NAMES[lang].demo}</span>
              </span>
            </button>
          </div>

          <div className="output" aria-live="polite">
            <div className={phase === 'recording' ? 'stage is-recording' : working ? 'stage is-working' : 'stage'} aria-hidden>
              {phase === 'recording' && <span className="stage-rec"><span className="rec-dot" />{formatTime(elapsed)}</span>}
              <Waveform mode={waveMode} className="stage-wave" />
            </div>
            {error && <p className="note is-error" role="alert">{error}</p>}
          </div>

          <div className="pane-body">
            {phase === 'idle' ? (
              <textarea className="stt-text" value={transcript} placeholder={ui.placeholder} aria-label={TOOL_NAMES[lang].stt}
                onChange={(event) => setTranscript(event.target.value)} spellCheck />
            ) : (
              <div className="stt-text is-live" aria-live="polite">
                {[baseText.current, committed].filter(Boolean).join(' ')}{' '}
                <span className="stt-pending">{live}</span>
                <span className="stt-caret" aria-hidden />
              </div>
            )}
            <div className="effects-row">
              <button type="button" className="effects-all" aria-label={ui.newTranscript} title={ui.newTranscript} disabled={!hasText} onClick={startNew}>
                <Plus size={16} />
              </button>
              <ScrollFade axis="x" className="chips" role="toolbar" aria-label={ui.moreActions}>
                <button type="button" className="chip chip-icon-text" disabled={!hasText} onClick={() => void copy()}>
                  <Copy size={14} aria-hidden />
                  <span className={copied ? 'swap' : 'swap is-first'}><span className="swap-a">{ui.copy}</span><span className="swap-b">{ui.copied}</span></span>
                </button>
                <button type="button" className="chip chip-icon-text" disabled={!hasText} onClick={readAloud}><Volume2 size={14} aria-hidden /> {ui.readAloud}</button>
                <button type="button" className="chip chip-icon-text" title={ui.downloadTxt} aria-label={ui.downloadTxt} disabled={!hasText} onClick={() => download(transcript, 'txt')}>
                  <FileText size={14} aria-hidden /> .txt
                </button>
                {hasText && chunks.length > 0 && (
                  <button type="button" className="chip chip-icon-text" title={ui.downloadSrt} aria-label={ui.downloadSrt} onClick={() => download(toSrt(chunks), 'srt')}>
                    <Download size={14} aria-hidden /> .srt
                  </button>
                )}
              </ScrollFade>
              <span className="char-count">{fmt(ui.words, { n: words })}</span>
            </div>
          </div>

          <div className="pane-foot">
            <div className="voice-chip stt-status">
              {phase === 'recording'
                ? <><span className="rec-dot" /> <span className="voice-chip-text">{ui.listening} · {formatTime(elapsed)}</span></>
                : <><span className="chip-icon"><Mic size={14} /></span><span className="voice-chip-text">{working ? ui.transcribing : ui.microphone}</span></>}
            </div>
            <button className={`action-btn ${action.working ? 'is-working' : ''} ${ring}`} data-state={action.working ? 'busy' : 'idle'}
              style={ringValue !== undefined ? ({ '--p': ringValue } as React.CSSProperties) : undefined}
              onClick={action.onClick} disabled={action.disabled}>
              {action.icon}<span className="action-label">{action.label}</span>
            </button>
          </div>
        </section>

        <aside className={history.length ? 'pane pane-side' : 'pane pane-side is-empty'} aria-labelledby="transcripts-title">
          <div className="pane-head"><h2 id="transcripts-title" className="pane-title">{ui.transcripts}</h2><span className="hint">{history.length || ''}</span></div>
          <div className="side-list">
            {history.length === 0 && <p className="hint">{ui.emptyHistory}</p>}
            {history.map((entry) => {
              const minutes = Math.floor((now - entry.at) / 60_000)
              return (
                <article key={entry.id} className={entry.id === activeId ? 'generation is-loaded' : 'generation'}>
                  <button className="transcript-open" onClick={() => open(entry)} disabled={phase !== 'idle'} aria-label={`${ui.open}: ${entry.text.slice(0, 40)}`}>
                    <p className="generation-text">{entry.text}</p>
                  </button>
                  <p className="generation-meta">
                    <span>{formatTime(entry.seconds)}</span>
                    <span>{minutes < 1 ? ui.justNow : fmt(ui.minAgo, { n: minutes })}</span>
                    <button className="icon-btn transcript-remove" aria-label={ui.remove} onClick={() => remove(entry)}><X size={14} /></button>
                  </p>
                </article>
              )
            })}
          </div>
        </aside>
      </div>
    </div>
  )
}
