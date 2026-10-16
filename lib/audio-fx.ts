// Small offline audio effects applied after generation (all 24 kHz mono Float32Array).

/**
 * WSOLA time-stretch: changes speed without changing pitch.
 * speed > 1 = faster/shorter, speed < 1 = slower/longer.
 */
export function timeStretch(input: Float32Array, speed: number, sampleRate = 24000): Float32Array {
  if (Math.abs(speed - 1) < 0.01 || input.length < sampleRate * 0.1) return input
  const frame = Math.round(sampleRate * 0.03) // 30 ms
  const hopOut = Math.round(frame / 2)
  const hopIn = hopOut * speed
  const search = Math.round(sampleRate * 0.008) // ±8 ms alignment search
  const window = new Float32Array(frame)
  for (let i = 0; i < frame; i++) window[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (frame - 1))

  const outLength = Math.ceil(input.length / speed) + frame
  const output = new Float32Array(outLength)
  const norm = new Float32Array(outLength)
  let prevStart = 0
  let outPos = 0

  for (let k = 0; ; k++) {
    const nominal = Math.round(k * hopIn)
    if (nominal + frame + search >= input.length) break
    let best = nominal
    if (k > 0) {
      // Find the offset whose start best continues the previous frame's natural continuation.
      const target = prevStart + hopOut
      let bestScore = -Infinity
      for (let offset = -search; offset <= search; offset++) {
        const start = nominal + offset
        if (start < 0) continue
        let score = 0
        for (let i = 0; i < hopOut; i += 2) score += input[start + i] * input[target + i]
        if (score > bestScore) { bestScore = score; best = start }
      }
    }
    for (let i = 0; i < frame; i++) {
      output[outPos + i] += input[best + i] * window[i]
      norm[outPos + i] += window[i]
    }
    prevStart = best
    outPos += hopOut
  }
  const length = Math.min(outLength, outPos + frame)
  const result = new Float32Array(length)
  for (let i = 0; i < length; i++) result[i] = norm[i] > 1e-3 ? output[i] / norm[i] : 0
  return result
}

/** Gain with a gentle soft-clip so "loud" never distorts harshly. */
export function applyGain(input: Float32Array, gain: number): Float32Array {
  if (gain === 1) return input
  const output = new Float32Array(input.length)
  for (let i = 0; i < input.length; i++) {
    const v = input[i] * gain
    output[i] = gain > 1 ? Math.tanh(v) : v
  }
  return output
}

export function silence(seconds: number, sampleRate = 24000) {
  return new Float32Array(Math.round(seconds * sampleRate))
}

/** Short fade in/out so joined segments don't click. */
export function fadeEdges(input: Float32Array, ms = 8, sampleRate = 24000) {
  const n = Math.min(Math.round((ms / 1000) * sampleRate), Math.floor(input.length / 2))
  const output = input.slice()
  for (let i = 0; i < n; i++) {
    const g = i / n
    output[i] *= g
    output[output.length - 1 - i] *= g
  }
  return output
}

export function concat(parts: Float32Array[]) {
  const total = parts.reduce((sum, part) => sum + part.length, 0)
  const output = new Float32Array(total)
  let offset = 0
  for (const part of parts) { output.set(part, offset); offset += part.length }
  return output
}

/** Keep the final mix below clipping. */
export function limitPeak(input: Float32Array, ceiling = 0.97) {
  let peak = 0
  for (let i = 0; i < input.length; i++) peak = Math.max(peak, Math.abs(input[i]))
  if (peak <= ceiling) return input
  const gain = ceiling / peak
  return input.map((v) => v * gain)
}

/**
 * The model can only take ~10 s of reference audio (longer clips run it out of memory).
 * Trim silence at both ends, then keep the loudest (most speech-dense) window of up to maxSeconds.
 */
export function prepareVoiceSample(input: Float32Array, maxSeconds = 10, sampleRate = 24000): Float32Array {
  const frame = Math.round(sampleRate * 0.05) // 50 ms
  const frames = Math.floor(input.length / frame)
  if (frames === 0) return input
  const energy = new Float32Array(frames)
  let peakEnergy = 0
  for (let f = 0; f < frames; f++) {
    let sum = 0
    for (let i = f * frame; i < (f + 1) * frame; i++) sum += input[i] * input[i]
    energy[f] = Math.sqrt(sum / frame)
    peakEnergy = Math.max(peakEnergy, energy[f])
  }
  const threshold = peakEnergy * 0.05
  let first = 0
  while (first < frames - 1 && energy[first] < threshold) first++
  let last = frames - 1
  while (last > first && energy[last] < threshold) last--
  first = Math.max(0, first - 4) // keep ~200 ms of breath on each side
  last = Math.min(frames - 1, last + 4)

  const windowFrames = Math.floor((maxSeconds * sampleRate) / frame)
  let start = first
  let end = last + 1
  if (end - start > windowFrames) {
    let sum = 0
    for (let f = start; f < start + windowFrames; f++) sum += energy[f]
    let best = sum
    let bestStart = start
    for (let f = start + 1; f + windowFrames <= end; f++) {
      sum += energy[f + windowFrames - 1] - energy[f - 1]
      if (sum > best) { best = sum; bestStart = f }
    }
    start = bestStart
    end = bestStart + windowFrames
  }
  return fadeEdges(input.slice(start * frame, Math.min(input.length, end * frame)), 20, sampleRate)
}
