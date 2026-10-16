'use client'

import { Download, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { UI } from '@/content/ui'

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }
declare global { interface Window { installPrompt?: InstallEvent | null } }

/**
 * Chrome and Edge: opens the browser's own install dialog (with the manifest screenshots).
 * iPhone and iPad Safari have no install API, so the button shows a short how-to.
 * The button is hidden when the app is installed or the browser cannot install it.
 */
export function InstallButton({ ui }: { ui: Pick<UI, 'install' | 'installIos' | 'close'> }) {
  const [prompt, setPrompt] = useState<InstallEvent | null>(null)
  const [ios, setIos] = useState(false)
  const [help, setHelp] = useState(false)

  useEffect(() => {
    const standalone = matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone
    if (standalone) return
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent))
    // The event can fire before this component mounts, so root-document.tsx keeps it on window.
    const sync = () => setPrompt(window.installPrompt ?? null)
    sync()
    addEventListener('installready', sync)
    addEventListener('appinstalled', sync)
    return () => { removeEventListener('installready', sync); removeEventListener('appinstalled', sync) }
  }, [])

  if (!prompt && !ios) return null

  const install = async () => {
    if (!prompt) { setHelp(true); return }
    await prompt.prompt()
    await prompt.userChoice
    window.installPrompt = null
    setPrompt(null)
  }

  return (
    <>
      <button className="icon-pill" onClick={() => void install()} aria-label={ui.install} title={ui.install}>
        <Download size={16} aria-hidden />
      </button>
      {help && (
        <div className="consent" role="dialog" aria-label={ui.install}>
          <p>{ui.installIos}</p>
          <div className="btn-row">
            <button className="btn btn-outline" onClick={() => setHelp(false)}><X size={16} /> {ui.close}</button>
          </div>
        </div>
      )}
    </>
  )
}
