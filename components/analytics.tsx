'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'

const KEY = 'analytics-consent'

/** Google Analytics with Consent Mode: nothing is stored until the visitor accepts. */
export function Analytics({ id, text, accept, decline }: { id: string; text: string; accept: string; decline: string }) {
  const [choice, setChoice] = useState<'granted' | 'denied' | null | undefined>(undefined)

  useEffect(() => {
    let saved: string | null = null
    try { saved = localStorage.getItem(KEY) } catch {}
    const value = saved === 'granted' || saved === 'denied' ? saved : null
    setChoice(value)
    if (value === 'granted') window.gtag?.('consent', 'update', { analytics_storage: 'granted' })
  }, [])

  const decide = (value: 'granted' | 'denied') => {
    try { localStorage.setItem(KEY, value) } catch {}
    setChoice(value)
    window.gtag?.('consent', 'update', { analytics_storage: value })
  }

  return (
    <>
      <Script id="ga-consent" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        var saved = null; try { saved = localStorage.getItem('${KEY}'); } catch (e) {}
        gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: saved === 'granted' ? 'granted' : 'denied' });
        gtag('js', new Date());
        gtag('config', '${id}');
      `}</Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      {choice === null && (
        <div className="consent" role="dialog" aria-live="polite" aria-label="Analytics">
          <p>{text}</p>
          <div className="btn-row">
            <button className="btn btn-outline" onClick={() => decide('denied')}>{decline}</button>
            <button className="btn btn-primary" onClick={() => decide('granted')}>{accept}</button>
          </div>
        </div>
      )}
    </>
  )
}

declare global {
  interface Window { gtag?: (...args: unknown[]) => void; dataLayer?: unknown[] }
}
