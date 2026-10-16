'use client'


import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { Check, Download, Mic, Pause, Play, Plus, RotateCcw, Share2, Square, Upload, X } from 'lucide-react'
import { Waveform, type WaveMode } from '@/components/waveform'
import { ScriptEditor } from '@/components/script-editor'
import { attachMic, decodeToMono24k, detachMic, encodeWav, formatTime, player, SAMPLE_RATE } from '@/lib/audio-stage'
import { applyGain, concat, fadeEdges, limitPeak, prepareVoiceSample, silence, timeStretch } from '@/lib/audio-fx'
import { MOODS, parseScript, SPEED_FACTOR, VOLUME_GAIN, type Mood } from '@/lib/script'
import { canRecord, createEngine, isLowPowerDevice, isSupported, StoppedError, type LoadProgress, type TTSEngine } from '@/lib/tts-engine'
import { ENGINE_LANGUAGE, fmt, type Locale } from '@/lib/i18n'
import { PRESETS, type Preset } from '@/lib/voices'
import type { UI } from '@/content/ui'
import { SITE_NAME } from '@/lib/site'
import { LanguageSwitcher } from '@/components/language-switcher'
import { InstallButton } from '@/components/install-button'
const MIN_SECONDS = 5
const MAX_SECONDS = 20 // recording cap; only the clearest 10 s is used for cloning
const SCRIPT_LIMIT = 700
const SEGMENT_GAP = 0.12


type Clip = { audio: Float32Array; source: 'preset' | 'mic' | 'file'; preset?: Preset }
type Target = 'base' | Mood
type Busy = { label: string; progress?: number } | null
type Take = { id: string; text: string; audio: Float32Array }

/** ONNX Runtime throws bare numbers (WASM pointers) on internal failures, which mean nothing to people. */
function friendlyError(error: unknown, ui: UI) {
  const message = error instanceof Error ? error.message : String(error)
  if (/^\d+$/.test(message.trim()) || /memory|allocat/i.test(message)) return ui.errMemory
  return message
}

const seconds = (audio: Float32Array) => audio.length / SAMPLE_RATE
const presetLabel = (preset: Preset, ui: UI) => `${preset.name}, ${ui.styles[preset.style]}`

export function VoiceTool({ ui, lang, homeHref, languageLabel }: { ui: UI; lang: Locale; homeHref: string; languageLabel: string }) {
  const [step, setStep] = useState<'voice' | 'speak'>('voice')
  const [env, setEnv] = useState({ supported: true, recordable: true, lowPower: false })

  const [base, setBase] = useState<Clip | null>(null)
  const [moods, setMoods] = useState<Partial<Record<Mood, Clip>>>({})
  const [openMood, setOpenMood] = useState<Mood | null>(null)
  const [consent, setConsent] = useState(false)
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const [decoding, setDecoding] = useState<Target | null>(null)
  const [recording, setRecording] = useState<{ target: Target; elapsed: number } | null>(null)

  const [model, setModel] = useState<'idle' | 'loading' | 'ready' | 'failed'>('idle')
  const [loadProgress, setLoadProgress] = useState<LoadProgress | null>(null)
  const [modelError, setModelError] = useState<string | null>(null)

  const [script, setScript] = useState(ui.defaultScript)
  const scriptKey = `script:${lang}`
  useEffect(() => {
    try { const saved = localStorage.getItem(scriptKey); if (saved) setScript(saved) } catch {}
  }, [scriptKey])
  useEffect(() => {
    try { if (script === ui.defaultScript) localStorage.removeItem(scriptKey); else localStorage.setItem(scriptKey, script) } catch {}
  }, [script, scriptKey, ui.defaultScript])
  const [busy, setBusy] = useState<Busy>(null)
  const [genError, setGenError] = useState<string | null>(null)
  const [stopped, setStopped] = useState(false)
  const [takes, setTakes] = useState<Take[]>([])

  const engineRef = useRef<TTSEngine | null>(null)
  const encodedRef = useRef(new Map<string, Float32Array>()) // voice name -> audio it was cloned from
  const recorderRef = useRef<MediaRecorder | null>(null)
  const stopRequestedRef = useRef(false)
  const fileTargetRef = useRef<Target>('base')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const playback = usePlayback()

  useEffect(() => {
    setEnv({ supported: isSupported(), recordable: canRecord(), lowPower: isLowPowerDevice() })
    return () => { engineRef.current?.terminate(); player.stop(); recorderRef.current?.stop() }
  }, [])

  const usesOwnAudio = (!!base && base.source !== 'preset') || Object.values(moods).some((clip) => clip && clip.source !== 'preset')
  const voiceBlocked = !!recording || !!decoding
  const canContinue = !!base && (!usesOwnAudio || consent) && !voiceBlocked

  /* ---------------- clips ---------------- */
  const setClip = (target: Target, clip: Clip | null) => {
    player.stop()
    if (target === 'base') setBase(clip)
    else setMoods((current) => ({ ...current, [target]: clip ?? undefined }))
  }

  const acceptAudio = (target: Target, audio: Float32Array, source: Clip['source'], preset?: Preset) => {
    const length = seconds(audio)
    if (length < MIN_SECONDS) {
      setVoiceError(fmt(ui.errShort, { n: length.toFixed(1), min: MIN_SECONDS }))
      return
    }
    setVoiceError(null)
    setClip(target, { audio: length > MAX_SECONDS ? audio.slice(0, MAX_SECONDS * SAMPLE_RATE) : audio, source, preset })
  }

  /** Start the ~150 MB model download as soon as the person starts on a voice, so it is ready sooner. */
  const warmUp = () => { void loadModel() }

  const startRecording = async (target: Target) => {
    warmUp()
    setVoiceError(null)
    player.stop()
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
    } catch (error) {
      const name = error instanceof DOMException ? error.name : ''
      setVoiceError(name === 'NotFoundError' ? ui.errNoMic : ui.errMicBlocked)
      return
    }
    attachMic(stream)
    const recorder = new MediaRecorder(stream)
    const chunks: Blob[] = []
    const startedAt = Date.now()
    const timer = setInterval(() => {
      const elapsed = (Date.now() - startedAt) / 1000
      setRecording({ target, elapsed })
      if (elapsed >= MAX_SECONDS && recorder.state === 'recording') recorder.stop()
    }, 200)
    recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data) }
    recorder.onstop = async () => {
      clearInterval(timer)
      detachMic()
      stream.getTracks().forEach((track) => track.stop())
      recorderRef.current = null
      setRecording(null)
      setDecoding(target)
      try {
        acceptAudio(target, await decodeToMono24k(new Blob(chunks, { type: recorder.mimeType })), 'mic')
      } catch (error) {
        console.error('[vocalis] decode recording', error)
        setVoiceError(ui.errRecording)
      } finally {
        setDecoding(null)
      }
    }
    recorderRef.current = recorder
    setRecording({ target, elapsed: 0 })
    recorder.start(250)
  }

  const stopRecording = () => { if (recorderRef.current?.state === 'recording') recorderRef.current.stop() }

  const pickFile = (target: Target) => {
    warmUp()
    fileTargetRef.current = target
    fileInputRef.current?.click()
  }

  const onFile = async (file?: File) => {
    if (!file) return
    const target = fileTargetRef.current
    setVoiceError(null)
    setDecoding(target)
    try {
      acceptAudio(target, await decodeToMono24k(file), 'file')
    } catch (error) {
      console.error('[vocalis] decode file', error)
      setVoiceError(ui.errFile)
    } finally {
      setDecoding(null)
    }
  }

  const presetAudioRef = useRef(new Map<string, Float32Array>())

  /** Fetch and decode a sample voice once, then reuse it for preview and cloning. */
  const loadPresetAudio = async (preset: Preset) => {
    const cached = presetAudioRef.current.get(preset.id)
    if (cached) return cached
    const response = await fetch(preset.url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const audio = await decodeToMono24k(await response.blob())
    presetAudioRef.current.set(preset.id, audio)
    return audio
  }

  const previewPreset = async (preset: Preset) => {
    const id = `preset-${preset.id}`
    if (playback.playingId === id) { player.stop(); return }
    setVoiceError(null)
    if (!presetAudioRef.current.has(preset.id)) setDecoding('base')
    try {
      player.play(id, await loadPresetAudio(preset))
    } catch (error) {
      console.error('[vocalis] sample preview', error)
      setVoiceError(ui.errSample)
    } finally {
      setDecoding(null)
    }
  }

  const pickPreset = async (preset: Preset) => {
    warmUp()
    setVoiceError(null)
    setDecoding('base')
    try {
      acceptAudio('base', await loadPresetAudio(preset), 'preset', preset)
    } catch (error) {
      console.error('[vocalis] sample voice', error)
      setVoiceError(ui.errSample)
    } finally {
      setDecoding(null)
    }
  }

  /* ---------------- model ---------------- */
  const getEngine = () => (engineRef.current ??= createEngine())

  const loadModel = async () => {
    if (model === 'loading' || model === 'ready') return
    setModel('loading')
    setModelError(null)
    setLoadProgress(null)
    try {
      await getEngine().loadModel(setLoadProgress, ENGINE_LANGUAGE[lang])
      setModel('ready')
      // Installed apps ask the browser to keep the ~140 MB model (browsers can clear caches under storage pressure).
      if (matchMedia('(display-mode: standalone)').matches) void navigator.storage?.persist?.()
    } catch (error) {
      console.error('[vocalis] load', error)
      engineRef.current?.terminate()
      engineRef.current = null
      encodedRef.current.clear()
      setModelError(error instanceof Error ? error.message : 'unknown error')
      setModel('failed')
    }
  }

  const goToSpeak = () => {
    if (!canContinue) return
    player.stop()
    setOpenMood(null)
    setStep('speak')
    void loadModel()
  }

  /* ---------------- generate ---------------- */
  const parsed = useMemo(() => parseScript(script), [script])
  const missingMoods = useMemo(() => {
    const used = new Set(parsed.segments.flatMap((segment) => (segment.kind === 'speech' && segment.mood ? [segment.mood] : [])))
    return [...used].filter((mood) => !moods[mood])
  }, [parsed, moods])

  const generate = async () => {
    if (!base || model !== 'ready' || busy) return
    const segments = parsed.segments
    if (!segments.some((segment) => segment.kind === 'speech')) return
    stopRequestedRef.current = false
    setStopped(false)
    setGenError(null)
    player.stop()
    const engine = getEngine()
    const voiceFor = (mood: Mood | null) => (mood && moods[mood] ? mood : 'base')

    try {
      // 1. Clone each voice this script needs, unless it's already cloned from the same audio.
      const needed = new Set(segments.flatMap((segment) => (segment.kind === 'speech' ? [voiceFor(segment.mood)] : [])))
      for (const name of needed) {
        const clip = name === 'base' ? base : moods[name as Mood]!
        if (encodedRef.current.get(name) === clip.audio) continue
        setBusy({ label: name === 'base' ? ui.learning : fmt(ui.learningMood, { mood: ui.moods[name as Mood].toLowerCase() }) })
        await engine.createVoice(prepareVoiceSample(clip.audio), name)
        encodedRef.current.set(name, clip.audio)
        if (stopRequestedRef.current) throw new StoppedError()
      }

      // 2. Speak each part, shape it (speed, volume), and stitch the parts with pauses.
      const speechCount = segments.filter((segment) => segment.kind === 'speech').length
      const parts: Float32Array[] = []
      let spoken = 0
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i]
        if (segment.kind === 'pause') { parts.push(silence(segment.seconds)); continue }
        spoken += 1
        setBusy({ label: speechCount > 1 ? fmt(ui.speakingPart, { n: spoken, total: speechCount }) : ui.speaking, progress: (spoken - 1) / speechCount })
        let audio = await engine.generate(segment.text, voiceFor(segment.mood))
        if (stopRequestedRef.current) throw new StoppedError()
        audio = timeStretch(audio, SPEED_FACTOR[segment.speed])
        audio = applyGain(audio, VOLUME_GAIN[segment.volume])
        parts.push(fadeEdges(audio))
        if (segments[i + 1]?.kind === 'speech') parts.push(silence(SEGMENT_GAP))
      }

      const take: Take = { id: crypto.randomUUID(), text: script.trim(), audio: limitPeak(concat(parts)) }
      setTakes((current) => [take, ...current].slice(0, 5))
      requestAnimationFrame(() => document.getElementById('latest-take')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }))
      setBusy(null)
      player.play(take.id, take.audio)
    } catch (error) {
      setBusy(null)
      if (error instanceof StoppedError) { setStopped(true); return }
      console.error('[vocalis] generate', error)
      setGenError(friendlyError(error, ui))
    }
  }

  const stopGenerating = () => {
    stopRequestedRef.current = true
    engineRef.current?.stop()
  }

  const startOver = () => {
    if ((takes.length > 0 || usesOwnAudio) && !window.confirm(ui.confirmStartAgain)) return
    stopGenerating()
    player.stop()
    setBase(null); setMoods({}); setOpenMood(null); setConsent(false)
    setTakes([]); setGenError(null); setStopped(false); setVoiceError(null)
    setStep('voice')
  }

  /* ---------------- stage ---------------- */
  // The stage only talks about audio (recording time, playback time). Progress shows as a ring on the element it belongs to.
  type StageView = { mode: WaveMode; text: React.ReactNode }
  const stage: StageView = (() => {
    if (recording) return { mode: 'live', text: <><span className="rec-dot" />{recording.target === 'base' ? ui.recording : fmt(ui.recordingMood, { mood: ui.moods[recording.target].toLowerCase() })} {formatTime(recording.elapsed)}</> }
    if (playback.playingId) return { mode: 'live', text: <>{formatTime(playback.position)} / {formatTime(playback.duration)}</> }
    if (decoding || busy || model === 'loading') return { mode: 'working', text: null }
    return { mode: 'idle', text: null }
  })()

  /** Model download as ring progress: a value from 0 to 1, or undefined while the size is not known. */
  const modelProgress: Progress | undefined = model !== 'loading' ? undefined
    : !loadProgress || loadProgress.phase === 'init' ? { label: ui.modelInit }
    : { label: fmt(ui.preparing, { pct: loadProgress.pct }), value: loadProgress.pct / 100 }

  /* ---------------- render ---------------- */
  const clipTitle = (clip: Clip) => (clip.preset ? presetLabel(clip.preset, ui) : ui.yourVoice)

  return (
    <div className="tool">
      <header className="topbar">
        <a className="wordmark" href={homeHref}>{SITE_NAME}</a>
        <div className="topbar-actions">
          {base && (
            <button className="btn btn-ghost" onClick={startOver} disabled={!!busy || voiceBlocked}><RotateCcw size={16} /> {ui.startOver}</button>
          )}
          <InstallButton ui={ui} />
          <LanguageSwitcher lang={lang} label={languageLabel} />
        </div>
      </header>

      <h1 className={base ? 'sr-only' : 'headline'}>{ui.headline}</h1>

      <section className="stage" aria-live="polite">
        <Waveform mode={stage.mode} className="stage-wave" />
        <div className="stage-status">{stage.text}</div>
      </section>

      {!env.supported && <p className="note is-error">{ui.unsupported}</p>}

      {base && (
        <nav className="steps" aria-label="Steps">
          <button aria-current={step === 'voice' ? 'step' : undefined} onClick={() => setStep('voice')} disabled={!!busy}>{ui.stepVoice}</button>
          <button aria-current={step === 'speak' ? 'step' : undefined} onClick={goToSpeak} disabled={!canContinue || !!busy}>{ui.stepSpeak}</button>
        </nav>
      )}

      <input ref={fileInputRef} type="file" accept="audio/*" className="sr-only" tabIndex={-1} aria-label={ui.upload}
        onChange={(event) => { void onFile(event.target.files?.[0]); event.target.value = '' }} />

      {step === 'voice' && (
        <>
          <section className="section">
            {recording?.target === 'base' ? (
              <RecordingPanel ui={ui} text={ui.readAloud.base} elapsed={recording.elapsed} onStop={stopRecording} />
            ) : base ? (
              <ClipRow ui={ui} id="clip-base" title={clipTitle(base)} audio={base.audio} progress={modelProgress}
                playback={playback} onRemove={() => setClip('base', null)} disabled={voiceBlocked} />
            ) : (
              <>
                <div className="btn-row">
                  <button className="btn btn-primary" onClick={() => startRecording('base')} disabled={voiceBlocked || !env.recordable}><Mic size={18} /> {ui.record}</button>
                  <button className="btn btn-outline" onClick={() => pickFile('base')} disabled={voiceBlocked}><Upload size={18} /> {ui.upload}</button>
                </div>
                <p className="hint"><strong className="tip">{ui.tip}:</strong> {ui.sampleHint}</p>
                <PresetList ui={ui} playback={playback} disabled={voiceBlocked}
                  onPreview={(preset) => void previewPreset(preset)} onUse={(preset) => void pickPreset(preset)} />
              </>
            )}
            {voiceError && <p className="note is-error" role="alert">{voiceError}</p>}
          </section>

          {base && (
            <section className="section">
              <div>
                <h2 className="section-title">{ui.moodsTitle}</h2>
                <p className="hint">{ui.moodsHint}</p>
              </div>
              <div className="pills">
                {MOODS.map((mood) => (
                  <button key={mood} disabled={voiceBlocked} aria-expanded={openMood === mood}
                    className={moods[mood] ? 'pill is-set' : openMood === mood ? 'pill is-open' : 'pill'}
                    onClick={() => setOpenMood(openMood === mood ? null : mood)}>
                    {moods[mood] ? <Check size={14} /> : <Plus size={14} />} {ui.moods[mood]}
                  </button>
                ))}
              </div>
              {openMood && (recording?.target === openMood ? (
                <RecordingPanel ui={ui} text={ui.readAloud[openMood]} elapsed={recording.elapsed} onStop={stopRecording} mood={openMood} />
              ) : moods[openMood] ? (
                <ClipRow ui={ui} id={`clip-${openMood}`} title={ui.moods[openMood]} audio={moods[openMood]!.audio} playback={playback}
                  onRemove={() => setClip(openMood, null)} disabled={voiceBlocked} />
              ) : (
                <div className="section">
                  <p className="read-aloud">{ui.readAloud[openMood]}</p>
                  <p className="hint">{fmt(ui.readThis, { how: ui.moodHow[openMood] })}</p>
                  <div className="btn-row">
                    <button className="btn btn-primary" onClick={() => startRecording(openMood)} disabled={voiceBlocked || !env.recordable}><Mic size={18} /> {ui.record}</button>
                    <button className="btn btn-outline" onClick={() => pickFile(openMood)} disabled={voiceBlocked}><Upload size={18} /> {ui.upload}</button>
                  </div>
                </div>
              ))}
            </section>
          )}

          {base && (
            <section className="section">
              {usesOwnAudio && (
                <label className="check">
                  <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
                  <span>{ui.consent}</span>
                </label>
              )}
              <button className="btn btn-primary btn-wide" onClick={goToSpeak} disabled={!canContinue}>{ui.continue}</button>
              {model === 'idle' && <p className="hint">{ui.firstRun}{env.lowPower ? ` ${ui.laptop}` : ''}</p>}
            </section>
          )}
        </>
      )}

      {step === 'speak' && (
        <>
          <section className="section">
            <ScriptEditor ui={ui} value={script} onChange={setScript} disabled={!!busy} maxLength={SCRIPT_LIMIT} onSubmit={() => void generate()}
              moodsWithClips={MOODS.filter((mood) => moods[mood])} />
            <div className="meta">
              <span>{script !== ui.defaultScript && <button className="underline" onClick={() => setScript(ui.defaultScript)} disabled={!!busy}>{ui.resetExample}</button>}</span>
              <span>{script.length}/{SCRIPT_LIMIT}</span>
            </div>
            {missingMoods.length > 0 && (
              <p className="note is-warn">{fmt(ui.missingMoods, { moods: missingMoods.map((mood) => ui.moods[mood].toLowerCase()).join(', ') })}</p>
            )}
            {parsed.unknownTags.length > 0 && (
              <p className="note is-warn">{fmt(ui.unknownTags, { tags: parsed.unknownTags.join(', ') })}</p>
            )}
          </section>

          <section className="section">
            {busy ? (
              <>
                <button className={ringClass('btn btn-outline btn-wide', busy.progress)} style={ringStyle(busy.progress)} onClick={stopGenerating}>
                  <Square size={16} /> {ui.stop}
                </button>
                <p className="hint hint-center" aria-live="polite">{busy.label}</p>
              </>
            ) : model === 'failed' ? (
              <>
                <button className="btn btn-primary btn-wide" onClick={() => void loadModel()}><RotateCcw size={16} /> {ui.retryModel}</button>
                <p className="note is-error" role="alert">{fmt(ui.modelFailed, { error: modelError ?? '' })}</p>
              </>
            ) : modelProgress ? (
              <button className={ringClass('btn btn-outline btn-wide is-waiting', modelProgress.value)} style={ringStyle(modelProgress.value)} disabled aria-live="polite">
                {modelProgress.label}
              </button>
            ) : (
              <button className="btn btn-primary btn-wide" onClick={generate} disabled={model !== 'ready' || parsed.spokenLength === 0}>
                {ui.generate}
              </button>
            )}
            {genError && <p className="note is-error" role="alert">{fmt(ui.genFailed, { error: genError })}</p>}
            {stopped && !busy && <p className="note">{ui.stopped}</p>}
          </section>

          {takes.length > 0 && (
            <section className="section">
              <div id="latest-take"><TakeRow ui={ui} take={takes[0]} playback={playback} primary /></div>
              {takes.length > 1 && (
                <div className="history">
                  <h2 className="hint">{ui.earlier}</h2>
                  {takes.slice(1).map((take) => <TakeRow ui={ui} key={take.id} take={take} playback={playback} />)}
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  )
}

/* ---------------- pieces ---------------- */

/** "voice-clone-hello-i-recorded-this.wav": the first words of the script, without tags. */
function fileName(text: string) {
  const words = text.replace(/\[[^\]]*\]/g, ' ').toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []
  const slug = words.slice(0, 5).join('-').slice(0, 40)
  return `voice-clone${slug ? `-${slug}` : ''}.wav`
}

const FIRST_PRESETS = 4

function PresetList({ ui, playback, disabled, onPreview, onUse }: {
  ui: UI; playback: Playback; disabled: boolean; onPreview: (preset: Preset) => void; onUse: (preset: Preset) => void
}) {
  const [showAll, setShowAll] = useState(false)
  const shown = showAll ? PRESETS : PRESETS.slice(0, FIRST_PRESETS)
  return (
    <section className="presets" aria-labelledby="presets-title">
      <h2 id="presets-title" className="section-title">{ui.sampleTitle}</h2>
      <ul className="preset-list">
        {shown.map((preset, index) => {
          const playing = playback.playingId === `preset-${preset.id}`
          const label = `${preset.name}, ${ui.styles[preset.style]}`
          return (
            <li key={preset.id} className="preset">
              <button className={`preset-avatar tone-${index % 4}`} onClick={() => onPreview(preset)} disabled={disabled}
                aria-label={`${playing ? ui.pause : ui.play}: ${label}`}>
                {playing ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <div className="preset-main">
                <span className="preset-name">{preset.name}</span>
                <span className="preset-tag">{ui.styles[preset.style]}</span>
              </div>
              <button className="btn btn-outline btn-small" onClick={() => onUse(preset)} disabled={disabled}
                aria-label={`${ui.use}: ${label}`}>{ui.use}</button>
            </li>
          )
        })}
      </ul>
      {!showAll && (
        <button className="btn btn-ghost btn-more" onClick={() => setShowAll(true)}>{ui.showAll}</button>
      )}
    </section>
  )
}

function usePlayback() {
  const stateRef = useRef({ playingId: null as string | null, position: 0, duration: 0 })
  const subscribe = useCallback((notify: () => void) => player.subscribe((state) => {
    stateRef.current = state
    notify()
  }), [])
  return useSyncExternalStore(subscribe, () => stateRef.current, () => stateRef.current)
}

type Playback = ReturnType<typeof usePlayback>

function RecordingPanel({ ui, text, elapsed, onStop, mood }: { ui: UI; text: string; elapsed: number; onStop: () => void; mood?: Mood }) {
  const remaining = Math.ceil(MIN_SECONDS - elapsed)
  return (
    <div className="section">
      <p className="read-aloud">{text}</p>
      {mood && <p className="hint">{fmt(ui.readIt, { how: ui.moodHow[mood] })}</p>}
      <button className="btn btn-primary btn-wide" onClick={onStop} disabled={remaining > 0}>
        <Square size={16} /> {remaining > 0 ? fmt(ui.keepReading, { n: remaining }) : ui.stopRecording}
      </button>
    </div>
  )
}

function PlayButton({ ui, id, audio, playback, primary }: { ui: UI; id: string; audio: Float32Array; playback: Playback; primary?: boolean }) {
  const playing = playback.playingId === id
  return (
    <button className={primary ? 'icon-btn is-primary' : 'icon-btn'} aria-label={playing ? ui.pause : ui.play} onClick={() => player.toggle(id, audio)}>
      {playing ? <Pause size={18} /> : <Play size={18} />}
    </button>
  )
}

type Progress = { label: string; value?: number }

/** Border progress, like a file upload: `value` 0–1 fills the border, undefined spins. */
const ringClass = (base: string, value?: number) => `${base} ring${value === undefined ? ' is-indeterminate' : ''}`
const ringStyle = (value?: number) => (value === undefined ? undefined : ({ '--p': Math.max(0.02, value) } as React.CSSProperties))

function ClipRow({ ui, id, title, audio, playback, onRemove, disabled, progress }: {
  ui: UI; id: string; title: string; audio: Float32Array; playback: Playback; onRemove: () => void; disabled?: boolean; progress?: Progress
}) {
  return (
    <div className={progress ? ringClass('row', progress.value) : 'row'} style={progress ? ringStyle(progress.value) : undefined}>
      <PlayButton ui={ui} id={id} audio={audio} playback={playback} />
      <div className="row-main">
        <div className="row-title">{title}</div>
        <div className="row-sub" aria-live="polite">{progress ? progress.label : fmt(ui.seconds, { n: seconds(audio).toFixed(1) })}</div>
      </div>
      <button className="icon-btn" aria-label={fmt(ui.remove, { title: title.toLowerCase() })} onClick={onRemove} disabled={disabled}><X size={18} /></button>
    </div>
  )
}

function TakeRow({ ui, take, playback, primary }: { ui: UI; take: Take; playback: Playback; primary?: boolean }) {
  const duration = seconds(take.audio)
  const fraction = playback.playingId === take.id && playback.duration ? playback.position / playback.duration : 0

  const name = fileName(take.text)
  const download = () => {
    const url = URL.createObjectURL(encodeWav(take.audio))
    const link = document.createElement('a')
    link.href = url
    link.download = name
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  // Phones can send the file straight to WhatsApp, Telegram and other apps.
  const shareable = typeof navigator !== 'undefined' && !!navigator.canShare
    && navigator.canShare({ files: [new File([], name, { type: 'audio/wav' })] })
  const share = async () => {
    try {
      await navigator.share({ files: [new File([encodeWav(take.audio)], name, { type: 'audio/wav' })] })
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) download()
    }
  }

  if (!primary) {
    return (
      <div className="history-item">
        <PlayButton ui={ui} id={take.id} audio={take.audio} playback={playback} />
        <span>{take.text}</span>
      </div>
    )
  }

  return (
    <div className="row">
      <PlayButton ui={ui} id={take.id} audio={take.audio} playback={playback} primary />
      <div className="track" role="slider" aria-label={ui.seek} tabIndex={0}
        aria-valuemin={0} aria-valuemax={Math.round(duration)} aria-valuenow={Math.round(fraction * duration)}
        onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect()
          player.seek(take.id, take.audio, (event.clientX - rect.left) / rect.width)
        }}
        onKeyDown={(event) => {
          const delta = event.key === 'ArrowRight' ? 0.05 : event.key === 'ArrowLeft' ? -0.05 : 0
          if (delta) player.seek(take.id, take.audio, fraction + delta)
        }}>
        <div className="track-bar"><div className="track-fill" style={{ width: `${fraction * 100}%` }} /></div>
      </div>
      <span className="time">{formatTime(playback.playingId === take.id ? playback.position : duration)}</span>
      {shareable && <button className="icon-btn" aria-label={ui.share} onClick={() => void share()}><Share2 size={18} /></button>}
      <button className="icon-btn" aria-label={ui.downloadWav} onClick={download}><Download size={18} /></button>
    </div>
  )
}
