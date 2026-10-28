'use client'

import { useCallback, useEffect, useRef, type ReactNode } from 'react'

/**
 * A scroll area with no scrollbar that fades out at an edge where more content is hidden.
 * It listens to scroll events (not scroll-driven animations), so the fade also works in Firefox.
 * Horizontal rails also scroll with the mouse wheel and by dragging with the mouse, like a swipe on a phone.
 */
export function ScrollFade({ className, children, axis = 'y', ...rest }: {
  className?: string; children: ReactNode; axis?: 'x' | 'y'
} & React.HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null)
  const update = useCallback(() => {
    const el = ref.current
    if (!el) return
    if (axis === 'y') {
      el.dataset.fadeStart = el.scrollTop > 2 ? 'true' : 'false'
      el.dataset.fadeEnd = el.scrollTop + el.clientHeight < el.scrollHeight - 2 ? 'true' : 'false'
    } else {
      el.dataset.fadeStart = el.scrollLeft > 2 ? 'true' : 'false'
      el.dataset.fadeEnd = el.scrollLeft + el.clientWidth < el.scrollWidth - 2 ? 'true' : 'false'
    }
  }, [axis])
  useEffect(() => {
    const el = ref.current
    if (!el) return
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    for (const child of Array.from(el.children)) observer.observe(child)
    return () => observer.disconnect()
  })

  useEffect(() => {
    const el = ref.current
    if (!el || axis !== 'x') return
    // Wheel: scroll sideways while the rail can move that way; at either end the page scrolls as usual.
    const onWheel = (event: WheelEvent) => {
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
      const max = el.scrollWidth - el.clientWidth
      if (max <= 1 || (delta < 0 && el.scrollLeft <= 1) || (delta > 0 && el.scrollLeft >= max - 1)) return
      event.preventDefault()
      el.scrollLeft += delta
    }
    // Mouse drag: past a few pixels it scrolls, and the click that ends the drag does not press a chip.
    let start: { x: number; left: number; id: number } | null = null
    let dragged = false
    const onDown = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return
      start = { x: event.clientX, left: el.scrollLeft, id: event.pointerId }
      dragged = false
    }
    const onMove = (event: PointerEvent) => {
      if (!start) return
      const dx = event.clientX - start.x
      if (!dragged && Math.abs(dx) < 5) return
      if (!dragged) { dragged = true; el.setPointerCapture(start.id); el.classList.add('is-dragging') }
      el.scrollLeft = start.left - dx
    }
    const onUp = () => { start = null; el.classList.remove('is-dragging') }
    const onClick = (event: MouseEvent) => { if (dragged) { event.stopPropagation(); event.preventDefault(); dragged = false } }
    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    el.addEventListener('click', onClick, true)
    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
      el.removeEventListener('click', onClick, true)
    }
  }, [axis])

  return <div ref={ref} {...rest} className={`scroll-fade scroll-fade-${axis} ${className ?? ''}`} onScroll={update}>{children}</div>
}
