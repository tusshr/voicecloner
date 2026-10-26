'use client'


import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { Check, ChevronDown, Download, Languages, Mic, Pause, Play, Plus, RotateCcw, Share2, Square, Upload, X } from 'lucide-react'
import { Waveform, type WaveMode } from '@/components/waveform'
import { ScriptEditor } from '@/components/script-editor'
import { attachMic, decodeToMono24k, detachMic, encodeWav, formatTime, player, SAMPLE_RATE } from '@/lib/audio-stage'
import { applyGain, concat, fadeEdges, limitPeak, prepareVoiceSample, silence, timeStretch } from '@/lib/audio-fx'
import { MOODS, parseScript, SPEED_FACTOR, VOLUME_GAIN, type Mood } from '@/lib/script'
import { canRecord, createEngine, isLowPowerDevice, isSupported, StoppedError, type LoadProgress, type TTSEngine } from '@/lib/tts-engine'
import { ENGINE_LANGUAGE, fmt, isLocale, LANGUAGE_NAMES, LOCALES, type Locale } from '@/lib/i18n'
import { UI_STRINGS } from '@/content/ui'
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

  // The language the voice speaks. It starts as the page language, and people can change it (the choice is kept per page language).
  const [speechLang, setSpeechLang] = useState<Locale>(lang)
  const speechUi = UI_STRINGS[speechLang]
  const [script, setScript] = useState(ui.defaultScript)
  const [hydrated, setHydrated] = useState(false)
  const scriptKey = `script:${lang}`
  const speechKey = `speech-lang:${lang}`
  useEffect(() => {
    let saved: string | null = null
    let savedLang: string | null = null
    try { saved = localStorage.getItem(scriptKey); savedLang = localStorage.getItem(speechKey) } catch {}
    const next = savedLang && isLocale(savedLang) ? savedLang : lang
    setSpeechLang(next)
    setScript(saved ?? UI_STRINGS[next].defaultScript)
    setHydrated(true)
  }, [scriptKey, speechKey, lang])
  useEffect(() => {
    if (!hydrated) return
    try {
      if (script === UI_STRINGS[speechLang].defaultScript) localStorage.removeItem(scriptKey); else localStorage.setItem(scriptKey, script)
      if (speechLang === lang) localStorage.removeItem(speechKey); else localStorage.setItem(speechKey, speechLang)
    } catch {}
  }, [hydrated, script, scriptKey, speechLang, speechKey, lang])
  const [busy, setBusy] = useState<Busy>(null)
  const [genError, setGenError] = useState<string | null>(null)
  const [stopped, setStopped] = useState(false)
  const [takes, setTakes] = useState<Take[]>([])
  const [pendingGenerate, setPendingGenerate] = useState(false)

  const engineRef = useRef<TTSEngine | null>(null)
  const modelLangRef = useRef<Locale | null>(null) // language the engine has (or is loading); null when idle or failed
  const loadTokenRef = useRef(0) // a newer load makes an older one's result stale
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
  const consentMissing = usesOwnAudio && !consent

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

  /** Load the model for a language. A different language replaces the engine, because each language has its own model. */
  const loadModel = async (language: Locale = speechLang) => {
    if (modelLangRef.current === language) return
    if (modelLangRef.current) {
      engineRef.current?.terminate()
      engineRef.current = null
      encodedRef.current.clear()
    }
    modelLangRef.current = language
    const token = ++loadTokenRef.current
    setModel('loading')
    setModelError(null)
    setLoadProgress(null)
    try {
      await getEngine().loadModel((progress) => { if (token === loadTokenRef.current) setLoadProgress(progress) }, ENGINE_LANGUAGE[language])
      if (token !== loadTokenRef.current) return
      setModel('ready')
      // Installed apps ask the browser to keep the ~140 MB model (browsers can clear caches under storage pressure).
      if (matchMedia('(display-mode: standalone)').matches) void navigator.storage?.persist?.()
    } catch (error) {
      if (token !== loadTokenRef.current) return
      console.error('[vocalis] load', error)
      engineRef.current?.terminate()
      engineRef.current = null
      encodedRef.current.clear()
      modelLangRef.current = null
      setModelError(error instanceof Error ? error.message : 'unknown error')
      setModel('failed')
    }
  }

  const changeSpeechLang = (next: Locale) => {
    if (busy || next === speechLang) return
    // Swap the example script, but never replace text the person typed.
    if (script === UI_STRINGS[speechLang].defaultScript) setScript(UI_STRINGS[next].defaultScript)
    setSpeechLang(next)
    setGenError(null)
    // Load the new language only if a model is already in use, so changing the menu alone does not start a download.
    if (modelLangRef.current) void loadModel(next)
  }

  /* ---------------- generate ---------------- */
  const parsed = useMemo(() => parseScript(script), [script])
  const missingMoods = useMemo(() => {
    const used = new Set(parsed.segments.flatMap((segment) => (segment.kind === 'speech' && segment.mood ? [segment.mood] : [])))
    return [...used].filter((mood) => !moods[mood])
  }, [parsed, moods])

  const canGenerate = !busy && !voiceBlocked && !consentMissing && parsed.spokenLength > 0

  /** Generate now if the model is ready; otherwise load it and generate when it is. */
  const onGenerate = () => {
    if (!canGenerate) return
    if (model === 'ready') { void generate(); return }
    setPendingGenerate(true)
    void loadModel()
  }
  useEffect(() => {
    if (!pendingGenerate) return
    if (model === 'ready') { setPendingGenerate(false); void generate() }
    else if (model === 'failed') setPendingGenerate(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingGenerate, model])

  const generate = async () => {
    if (model !== 'ready' || busy || voiceBlocked || consentMissing) return
    const segments = parsed.segments
    if (!segments.some((segment) => segment.kind === 'speech')) return
    stopRequestedRef.current = false
    setStopped(false)
    setGenError(null)
    player.stop()
    const engine = getEngine()
    const voiceFor = (mood: Mood | null) => (mood && moods[mood] ? mood : 'base')

    try {
      // Text to voice without a chosen voice: use the first sample voice.
      let baseClip = base
      if (!baseClip) {
        setBusy({ label: ui.learning })
        const preset = PRESETS[0]
        baseClip = { audio: await loadPresetAudio(preset), source: 'preset', preset }
        setBase(baseClip)
      }
      // 1. Clone each voice this script needs, unless it's already cloned from the same audio.
      const needed = new Set(segments.flatMap((segment) => (segment.kind === 'speech' ? [voiceFor(segment.mood)] : [])))
      for (const name of needed) {
        const clip = name === 'base' ? baseClip : moods[name as Mood]!
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

  const ownClip = base && base.source !== 'preset' ? base : null
  const selectedPreset = base?.preset?.id ?? (base ? undefined : PRESETS[0].id)
  const modelLabel = pendingGenerate || model === 'loading' ? modelProgress : undefined
  const voiceSummary = base ? clipTitle(base) : presetLabel(PRESETS[0], ui)

  return (
    <div className="tool">
      <header className="topbar">
        <a className="wordmark" href={homeHref}><span className="wordmark-mark" aria-hidden />{SITE_NAME}</a>
        <div className="topbar-actions">
          {(base || takes.length > 0) && (
            <button className="btn btn-ghost btn-small" onClick={startOver} disabled={!!busy || voiceBlocked}><RotateCcw size={14} /> {ui.startOver}</button>
          )}
          <InstallButton ui={ui} />
          <LanguageSwitcher lang={lang} label={languageLabel} />
        </div>
      </header>

      <div className="hero">
        <h1 className="headline">{ui.headline}</h1>
        <p className="subhead">{ui.subhead}</p>
      </div>

      {!env.supported && <p className="note is-error">{ui.unsupported}</p>}

      <input ref={fileInputRef} type="file" accept="audio/*" className="sr-only" tabIndex={-1} aria-label={ui.upload}
        onChange={(event) => { void onFile(event.target.files?.[0]); event.target.value = '' }} />

      <div className="workspace">
        {/* ---------- text: what the voice says, and the result ---------- */}
        <section className="pane pane-text" aria-labelledby="pane-text-title">
          <div className="pane-head">
            <h2 id="pane-text-title" className="pane-title">{ui.textTitle}</h2>
            <label className="select">
              <Languages size={14} aria-hidden />
              <span className="sr-only">{ui.speechLanguage}</span>
              <select value={speechLang} disabled={!!busy} aria-label={ui.speechLanguage}
                onChange={(event) => changeSpeechLang(event.target.value as Locale)}>
                {LOCALES.map((locale) => <option key={locale} value={locale} lang={locale}>{LANGUAGE_NAMES[locale]}</option>)}
              </select>
              <ChevronDown size={14} aria-hidden />
            </label>
          </div>

          <div className="pane-body">
            <ScriptEditor ui={ui} value={script} onChange={setScript} disabled={!!busy} maxLength={SCRIPT_LIMIT} onSubmit={onGenerate}
              moodsWithClips={MOODS.filter((mood) => moods[mood])} onFocus={warmUp} />
            <div className="meta">
              <span>{script !== speechUi.defaultScript && <button className="link" onClick={() => setScript(speechUi.defaultScript)} disabled={!!busy}>{ui.resetExample}</button>}</span>
              <span>{script.length} / {SCRIPT_LIMIT}</span>
            </div>
            {speechLang !== lang && <p className="note">{ui.langNote}</p>}
            {missingMoods.length > 0 && (
              <p className="note is-warn">{fmt(ui.missingMoods, { moods: missingMoods.map((mood) => ui.moods[mood].toLowerCase()).join(', ') })}</p>
            )}
            {parsed.unknownTags.length > 0 && (
              <p className="note is-warn">{fmt(ui.unknownTags, { tags: parsed.unknownTags.join(', ') })}</p>
            )}
          </div>

          <div className="pane-foot">
            <button className="voice-chip" title={voiceSummary} aria-label={`${ui.stepVoice}: ${voiceSummary}`}
              onClick={() => document.getElementById('pane-voice-title')?.scrollIntoView({ block: 'start', behavior: 'smooth' })}>
              <span className={`dot tone-${Math.max(0, PRESETS.findIndex((preset) => preset.id === (base?.preset?.id ?? PRESETS[0].id))) % 4}${ownClip ? ' is-own' : ''}`} aria-hidden />
              <span className="voice-chip-text">{voiceSummary}</span>
            </button>
            {busy ? (
              <button className={ringClass('btn btn-outline', busy.progress)} style={ringStyle(busy.progress)} onClick={stopGenerating}>
                <Square size={14} /> {ui.stop}
              </button>
            ) : model === 'failed' ? (
              <button className="btn btn-primary" onClick={() => void loadModel()}><RotateCcw size={14} /> {ui.retryModel}</button>
            ) : modelLabel ? (
              <button className={ringClass('btn btn-outline is-waiting', modelLabel.value)} style={ringStyle(modelLabel.value)} disabled aria-live="polite">
                {modelLabel.label}
              </button>
            ) : (
              <button className="btn btn-primary" onClick={onGenerate} disabled={!canGenerate}>
                {ui.generate} <kbd className="kbd" aria-hidden>⌘↵</kbd>
              </button>
            )}
          </div>

          <div className="output" aria-live="polite">
            {busy && <p className="hint">{busy.label}</p>}
            {model === 'failed' && <p className="note is-error" role="alert">{fmt(ui.modelFailed, { error: modelError ?? '' })}</p>}
            {genError && <p className="note is-error" role="alert">{fmt(ui.genFailed, { error: genError })}</p>}
            {consentMissing && <p className="note is-warn">{ui.consentNeeded}</p>}
            {stopped && !busy && <p className="note">{ui.stopped}</p>}

            {takes.length > 0 ? (
              <>
                <div id="latest-take"><TakeRow ui={ui} take={takes[0]} playback={playback} primary /></div>
                {takes.length > 1 && (
                  <div className="history">
                    <h3 className="label">{ui.earlier}</h3>
                    {takes.slice(1).map((take) => <TakeRow ui={ui} key={take.id} take={take} playback={playback} />)}
                  </div>
                )}
              </>
            ) : (
              <div className="stage">
                <Waveform mode={stage.mode} className="stage-wave" />
                <div className="stage-status">{stage.text ?? (model === 'idle' ? `${ui.firstRun}${env.lowPower ? ` ${ui.laptop}` : ''}` : ui.outputEmpty)}</div>
              </div>
            )}
          </div>
        </section>

        {/* ---------- voice: clone one, or pick a sample ---------- */}
        <aside className="pane pane-voice" aria-labelledby="pane-voice-title">
          <div className="pane-head">
            <h2 id="pane-voice-title" className="pane-title">{ui.stepVoice}</h2>
          </div>

          <div className="pane-body">
            <section className="section">
              <h3 className="label">{ui.cloneTitle}</h3>
              {recording?.target === 'base' ? (
                <RecordingPanel ui={ui} text={speechUi.readAloud.base} elapsed={recording.elapsed} onStop={stopRecording} />
              ) : ownClip ? (
                <ClipRow ui={ui} id="clip-base" title={clipTitle(ownClip)} audio={ownClip.audio} playback={playback} onRemove={() => setClip('base', null)} disabled={voiceBlocked} />
              ) : (
                <>
                  <div className="btn-row">
                    <button className="btn btn-outline" onClick={() => startRecording('base')} disabled={voiceBlocked || !env.recordable}><Mic size={16} /> {ui.record}</button>
                    <button className="btn btn-outline" onClick={() => pickFile('base')} disabled={voiceBlocked}><Upload size={16} /> {ui.upload}</button>
                  </div>
                  <p className="hint">{ui.sampleHint}</p>
                </>
              )}
              {usesOwnAudio && (
                <label className="check">
                  <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
                  <span>{ui.consent}</span>
                </label>
              )}
              {voiceError && <p className="note is-error" role="alert">{voiceError}</p>}
            </section>

            {!ownClip && recording?.target !== 'base' && (
              <PresetList ui={ui} playback={playback} disabled={voiceBlocked || !!busy} selectedId={selectedPreset}
                onPreview={(preset) => void previewPreset(preset)} onUse={(preset) => void pickPreset(preset)} />
            )}

            <details className="moods" open={!!openMood || Object.values(moods).some(Boolean)}>
              <summary><span className="label">{ui.moodsTitle}</span><ChevronDown size={14} aria-hidden /></summary>
              <div className="section">
                <p className="hint">{ui.moodsHint}</p>
                <div className="pills">
                  {MOODS.map((mood) => (
                    <button key={mood} disabled={voiceBlocked} aria-expanded={openMood === mood}
                      className={moods[mood] ? 'pill is-set' : openMood === mood ? 'pill is-open' : 'pill'}
                      onClick={() => setOpenMood(openMood === mood ? null : mood)}>
                      {moods[mood] ? <Check size={12} /> : <Plus size={12} />} {ui.moods[mood]}
                    </button>
                  ))}
                </div>
                {openMood && (recording?.target === openMood ? (
                  <RecordingPanel ui={ui} text={speechUi.readAloud[openMood]} elapsed={recording.elapsed} onStop={stopRecording} mood={openMood} />
                ) : moods[openMood] ? (
                  <ClipRow ui={ui} id={`clip-${openMood}`} title={ui.moods[openMood]} audio={moods[openMood]!.audio} playback={playback}
                    onRemove={() => setClip(openMood, null)} disabled={voiceBlocked} />
                ) : (
                  <div className="section">
                    <p className="read-aloud">{speechUi.readAloud[openMood]}</p>
                    <p className="hint">{fmt(ui.readThis, { how: ui.moodHow[openMood] })}</p>
                    <div className="btn-row">
                      <button className="btn btn-outline" onClick={() => startRecording(openMood)} disabled={voiceBlocked || !env.recordable}><Mic size={16} /> {ui.record}</button>
                      <button className="btn btn-outline" onClick={() => pickFile(openMood)} disabled={voiceBlocked}><Upload size={16} /> {ui.upload}</button>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          </div>
        </aside>
      </div>

      <p className="privacy-line">{ui.privacyLine}</p>
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

function PresetList({ ui, playback, disabled, selectedId, onPreview, onUse }: {
  ui: UI; playback: Playback; disabled: boolean; selectedId?: string; onPreview: (preset: Preset) => void; onUse: (preset: Preset) => void
}) {
  const [showAll, setShowAll] = useState(false)
  const shown = showAll ? PRESETS : PRESETS.slice(0, FIRST_PRESETS)
  return (
    <section className="presets" aria-labelledby="presets-title">
      <h3 id="presets-title" className="label">{ui.sampleTitle}</h3>
      <ul className="preset-list">
        {shown.map((preset, index) => {
          const playing = playback.playingId === `preset-${preset.id}`
          const label = `${preset.name}, ${ui.styles[preset.style]}`
          return (
            <li key={preset.id} className={preset.id === selectedId ? 'preset is-selected' : 'preset'}>
              <button className={`preset-avatar tone-${index % 4}`} onClick={() => onPreview(preset)} disabled={disabled}
                aria-label={`${playing ? ui.pause : ui.play}: ${label}`}>
                {playing ? <Pause size={14} /> : <Play size={14} />}
              </button>
              <div className="preset-main">
                <span className="preset-name">{preset.name}</span>
                <span className="preset-tag">{ui.styles[preset.style]}</span>
              </div>
              {preset.id === selectedId ? (
                <span className="selected"><Check size={14} aria-hidden /> {ui.selected}</span>
              ) : (
                <button className="btn btn-ghost btn-small" onClick={() => onUse(preset)} disabled={disabled}
                  aria-label={`${ui.use}: ${label}`}>{ui.use}</button>
              )}
            </li>
          )
        })}
      </ul>
      {!showAll && (
        <button className="btn btn-ghost btn-small btn-more" onClick={() => setShowAll(true)}>{ui.showAll}</button>
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
    <div className="section recording">
      <div className="recording-head"><span className="rec-dot" />{formatTime(elapsed)}<Waveform mode="live" className="rec-wave" /></div>
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
      {playing ? <Pause size={16} /> : <Play size={16} />}
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
      <button className="icon-btn" aria-label={fmt(ui.remove, { title: title.toLowerCase() })} onClick={onRemove} disabled={disabled}><X size={16} /></button>
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
      {shareable && <button className="icon-btn" aria-label={ui.share} onClick={() => void share()}><Share2 size={16} /></button>}
      <button className="icon-btn" aria-label={ui.downloadWav} onClick={download}><Download size={16} /></button>
    </div>
  )
}
