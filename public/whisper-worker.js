// Voice to text in a worker: Whisper (OpenAI, MIT license) through transformers.js, on the visitor's device.
// The library and the model download once and stay in the browser cache.
import { pipeline, env, WhisperTextStreamer } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.1/dist/transformers.min.js'

env.allowLocalModels = false

const MODEL = 'onnx-community/whisper-base'
let transcriber = null

// WebAssembly (CPU) by default. WebGPU only on request (?device=webgpu): on a test laptop (Intel UHD 620)
// it loaded but never finished a 5 s clip, so it is not safe as a default until measured on real phones.
const OPTIONS = {
  webgpu: { device: 'webgpu', dtype: { encoder_model: 'fp32', decoder_model_merged: 'q4' } },
  wasm: { device: 'wasm', dtype: 'q8' },
}

async function load(device = 'wasm') {
  if (transcriber) return transcriber
  if (!OPTIONS[device]) device = 'wasm'
  try {
    transcriber = await create(OPTIONS[device])
  } catch (error) {
    if (device === 'wasm') throw error
    console.warn('[whisper] WebGPU failed, using WebAssembly:', error)
    device = 'wasm'
    transcriber = await create(OPTIONS.wasm)
  }
  self.postMessage({ type: 'device', device })
  return transcriber
}

function create(options) {
  const files = new Map()
  return pipeline('automatic-speech-recognition', MODEL, {
    ...options,
    progress_callback: (info) => {
      // Report the total over all files, so the bar only moves forward.
      if (info.status === 'progress' && info.total) {
        files.set(info.file, { loaded: info.loaded, total: info.total })
        let loaded = 0, total = 0
        for (const file of files.values()) { loaded += file.loaded; total += file.total }
        self.postMessage({ type: 'progress', value: total ? loaded / total : 0 })
      }
    },
  })
}

self.onmessage = async (event) => {
  const message = event.data
  try {
    if (message.type === 'load') {
      await load(message.device)
      self.postMessage({ type: 'ready' })
      return
    }
    if (message.type === 'transcribe') {
      const model = await load()
      let streamed = ''
      const streamer = message.stream
        ? new WhisperTextStreamer(model.tokenizer, {
          skip_prompt: true,
          callback_function: (text) => { streamed += text; self.postMessage({ type: 'partial', id: message.id, text: streamed }) },
        })
        : undefined
      const output = await model(message.audio, {
        language: message.language,
        task: 'transcribe',
        chunk_length_s: 30,
        stride_length_s: 5,
        return_timestamps: true,
        streamer,
      })
      const chunks = (output.chunks || []).map((chunk) => ({ text: chunk.text, start: chunk.timestamp[0], end: chunk.timestamp[1] }))
      self.postMessage({ type: 'result', id: message.id, text: (output.text || '').trim(), chunks })
    }
  } catch (error) {
    self.postMessage({ type: 'error', id: message.id, message: error && error.message ? error.message : String(error) })
  }
}
