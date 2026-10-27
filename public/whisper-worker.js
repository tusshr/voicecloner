// Voice to text in a worker: Whisper (OpenAI, MIT license) through transformers.js, on the visitor's device.
// The library and the model download once and stay in the browser cache.
import { pipeline, env, WhisperTextStreamer } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.1/dist/transformers.min.js'

env.allowLocalModels = false

const MODEL = 'onnx-community/whisper-base'
let transcriber = null

async function load() {
  if (transcriber) return transcriber
  const files = new Map()
  transcriber = await pipeline('automatic-speech-recognition', MODEL, {
    dtype: 'q8',
    device: 'wasm',
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
  return transcriber
}

self.onmessage = async (event) => {
  const message = event.data
  try {
    if (message.type === 'load') {
      await load()
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
