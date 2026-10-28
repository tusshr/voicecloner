# Times TTS (load, clone, generate) and Whisper (load, transcribe) in headless Chromium.
# usage: npm run build && npm run preview, then: uv run --with playwright python tools/bench.py <label> [runs] [tts]
# Models stay cached in ~/.cache/vocalis-bench, so only the first run downloads them (that run's numbers are not warm).
import json, sys, pathlib
from playwright.sync_api import sync_playwright

label = sys.argv[1]
runs = int(sys.argv[2]) if len(sys.argv) > 2 else 3
profile = pathlib.Path.home() / '.cache' / 'vocalis-bench'

JS = r"""
async ([runs, only]) => {
  const clips = ['bill','alba-casual','caro','peter','stuart','alba-gentle','alba-announcer','alba-merchant']
  async function decode(url, rate) {
    const buf = await (await fetch(url)).arrayBuffer()
    const ctx = new OfflineAudioContext(1, 1, rate)
    return (await ctx.decodeAudioData(buf)).getChannelData(0)
  }
  function concat(parts) {
    const out = new Float32Array(parts.reduce((s, p) => s + p.length, 0)); let o = 0
    for (const p of parts) { out.set(p, o); o += p.length }
    return out
  }
  const wait = (w, pred) => new Promise((res, rej) => {
    const h = (e) => { if (e.data.type === 'error') { w.removeEventListener('message', h); rej(new Error(e.data.error || e.data.message)) }
                       else if (pred(e.data)) { w.removeEventListener('message', h); res(e.data) } }
    w.addEventListener('message', h)
  })
  const r = { isolated: self.crossOriginIsolated, cores: navigator.hardwareConcurrency, tts: [], stt: [] }

  // Text to voice
  const ref = await decode('/demos/en/bill.mp3', 24000)
  const text = 'The morning light moves softly across the room. This is a short sample of my voice, spoken naturally and clearly. We will measure how long it takes to speak these sentences.'
  const tts = new Worker('/pocket-tts/inference-worker.js', { type: 'module' })
  let t = performance.now()
  tts.postMessage({ type: 'load', data: { language: 'en' } }); await wait(tts, d => d.type === 'loaded')
  r.tts_load_ms = performance.now() - t
  t = performance.now()
  tts.postMessage({ type: 'encode_voice', data: { audio: ref.slice(), name: 'b' } }); await wait(tts, d => d.type === 'voice_encoded')
  r.tts_clone_ms = Math.round(performance.now() - t); r.tts_load_ms = Math.round(r.tts_load_ms)
  for (let i = 0; i < runs; i++) {
    let samples = 0, first = null
    const on = (e) => { if (e.data.type === 'audio_chunk') { samples += e.data.data.length; first ??= performance.now() } }
    tts.addEventListener('message', on)
    t = performance.now()
    tts.postMessage({ type: 'generate', data: { text, voice: 'b' } }); await wait(tts, d => d.type === 'stream_ended')
    tts.removeEventListener('message', on)
    const ms = performance.now() - t
    r.tts.push({ ms: Math.round(ms), first_audio_ms: Math.round(first - t), audio_s: +(samples / 24000).toFixed(2), rtf: +((samples / 24000) / (ms / 1000)).toFixed(2) })
  }
  tts.terminate()

  if (only === 'tts') return r
  // Voice to text
  const audio = concat(await Promise.all(clips.map(c => decode(`/demos/en/${c}.mp3`, 16000))))
  const stt = new Worker('/whisper-worker.js', { type: 'module' })
  t = performance.now()
  stt.postMessage({ type: 'load' }); await wait(stt, d => d.type === 'ready')
  r.stt_load_ms = performance.now() - t
  for (let i = 0; i < runs; i++) {
    t = performance.now()
    stt.postMessage({ type: 'transcribe', id: i + 1, audio: audio.slice(), language: 'en', stream: false })
    const res = await wait(stt, d => d.type === 'result')
    const ms = performance.now() - t
    r.stt.push({ ms: Math.round(ms), audio_s: +(audio.length / 16000).toFixed(1), x_realtime: +((audio.length / 16000) / (ms / 1000)).toFixed(2), text: res.text.slice(0, 80) })
  }
  stt.terminate()
  r.stt_load_ms = Math.round(r.stt_load_ms)
  return r
}
"""

with sync_playwright() as p:
    ctx = p.chromium.launch_persistent_context(str(profile), headless=True)
    page = ctx.new_page()
    ctx.new_cdp_session(page).send('Network.clearBrowserCache')  # stale page copies without the new headers
    page.on('console', lambda m: m.type == 'error' and print('console:', m.text, file=sys.stderr))
    page.goto('http://localhost:4000/about', wait_until='load')
    page.set_default_timeout(0)
    result = page.evaluate(JS, [runs, sys.argv[3] if len(sys.argv) > 3 else ''])
    ctx.close()

result['label'] = label
print(json.dumps(result, indent=1))
