'use client'

import { useEffect, useRef } from 'react'
import { getAnalyser } from '@/lib/audio-stage'

export type WaveMode = 'idle' | 'live' | 'working'

/**
 * Mirrored bar waveform. "live" follows the shared analyser (mic or playback),
 * "working" is a slow travelling wave, "idle" is a calm static shape.
 */
export function Waveform({ mode, className }: { mode: WaveMode; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const modeRef = useRef(mode)
  modeRef.current = mode

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let heights: number[] = []
    let data = new Uint8Array(256)

    const draw = (time: number) => {
      const dpr = window.devicePixelRatio || 1
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr)
        canvas.height = Math.round(height * dpr)
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)

      const barWidth = 3
      const gap = 3
      const count = Math.max(12, Math.floor((width + gap) / (barWidth + gap)))
      if (heights.length !== count) heights = new Array(count).fill(0)
      const offsetX = (width - (count * (barWidth + gap) - gap)) / 2
      const mid = (count - 1) / 2
      const current = modeRef.current
      const analyser = getAnalyser()

      if (current === 'live' && analyser) {
        if (data.length !== analyser.frequencyBinCount) data = new Uint8Array(analyser.frequencyBinCount)
        analyser.getByteFrequencyData(data)
      }

      ctx.fillStyle = getComputedStyle(canvas).color
      for (let i = 0; i < count; i++) {
        const fromCenter = Math.abs(i - mid) / mid // 0 centre → 1 edge
        const envelope = Math.cos(fromCenter * Math.PI * 0.5) ** 1.4
        let target: number
        if (current === 'live' && analyser) {
          // Centre bars show low frequencies (where voice energy lives), edges show highs.
          const bin = Math.floor(fromCenter * data.length * 0.45)
          target = Math.max(0.04, (data[bin] / 255) ** 1.25) * (0.35 + 0.65 * envelope)
        } else if (current === 'working' && !reduceMotion) {
          const wave = Math.sin(i * 0.38 - time / 260) * 0.5 + 0.5
          target = (0.12 + 0.55 * wave) * envelope
        } else {
          target = 0.06 + 0.22 * envelope
        }
        heights[i] += (target - heights[i]) * (current === 'live' ? 0.35 : 0.12)
        const h = Math.max(barWidth, heights[i] * height)
        const x = offsetX + i * (barWidth + gap)
        const y = (height - h) / 2
        ctx.globalAlpha = 0.35 + 0.65 * Math.min(1, heights[i] * 2.2)
        ctx.beginPath()
        ctx.roundRect(x, y, barWidth, h, barWidth / 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [])

  return <canvas ref={canvasRef} aria-hidden className={className} />
}
