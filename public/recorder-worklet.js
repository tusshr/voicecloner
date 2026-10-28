// Voice to text recording on the audio thread (replaces ScriptProcessorNode, which runs on the main thread).
// Collects the microphone's 128-frame blocks and posts them to the page in batches of 2048 (~43 ms at 48 kHz).
const BATCH = 2048

class RecorderProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this.buffer = new Float32Array(BATCH)
    this.filled = 0
  }

  process(inputs) {
    const input = inputs[0][0]
    if (!input) return true
    let read = 0
    while (read < input.length) {
      const n = Math.min(input.length - read, BATCH - this.filled)
      this.buffer.set(input.subarray(read, read + n), this.filled)
      this.filled += n
      read += n
      if (this.filled === BATCH) {
        this.port.postMessage(this.buffer, [this.buffer.buffer])
        this.buffer = new Float32Array(BATCH)
        this.filled = 0
      }
    }
    return true
  }
}

registerProcessor('recorder', RecorderProcessor)
