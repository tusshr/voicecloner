'use client'

import { useEffect } from 'react'

/** Keeps the screen on while `active` (Screen Wake Lock API; does nothing where it is missing). */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return
    let lock: WakeLockSentinel | null = null
    let done = false
    // The browser drops the lock when the tab is hidden; take it again when the tab comes back.
    const request = () => {
      if (document.visibilityState !== 'visible') return
      navigator.wakeLock.request('screen').then((next) => { if (done) void next.release(); else lock = next }, () => {})
    }
    request()
    document.addEventListener('visibilitychange', request)
    return () => {
      done = true
      document.removeEventListener('visibilitychange', request)
      void lock?.release()
    }
  }, [active])
}
