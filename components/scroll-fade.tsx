'use client'

import { useCallback, useEffect, useRef, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * A scroll area with no scrollbar that fades out at an edge where more content is hidden.
 * It listens to scroll events (not scroll-driven animations), so the fade also works in Firefox.
 * Horizontal rails also get ‹ › buttons over the fades; swiping still works.
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
  const area = <div ref={ref} {...rest} className={`scroll-fade scroll-fade-${axis} ${className ?? ''}`} onScroll={update}>{children}</div>
  if (axis === 'y') return area

  const scrollBy = (direction: 1 | -1) => {
    const el = ref.current
    if (!el) return
    const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollBy({ left: direction * el.clientWidth * 0.7, behavior: smooth ? 'smooth' : 'auto' })
  }
  // The buttons repeat what swiping and Tab already do, so they stay out of the tab order and the accessibility tree.
  return (
    <div className="scroll-rail">
      {area}
      <button type="button" className="scroll-arrow is-start" tabIndex={-1} aria-hidden onClick={() => scrollBy(-1)}><ChevronLeft size={16} /></button>
      <button type="button" className="scroll-arrow is-end" tabIndex={-1} aria-hidden onClick={() => scrollBy(1)}><ChevronRight size={16} /></button>
    </div>
  )
}
