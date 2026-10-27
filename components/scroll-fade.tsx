'use client'

import { useCallback, useEffect, useRef, type ReactNode } from 'react'

/**
 * A scroll area with no scrollbar that fades out at an edge where more content is hidden.
 * It listens to scroll events (not scroll-driven animations), so the fade also works in Firefox.
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
  return <div ref={ref} {...rest} className={`scroll-fade scroll-fade-${axis} ${className ?? ''}`} onScroll={update}>{children}</div>
}
