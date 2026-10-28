'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { SlidersHorizontal, X } from 'lucide-react'
import { DELIVERY, emojifyTags, MOOD_EMOJI, MOODS, TAG_RE, tagLook, type Delivery, type Mood } from '@/lib/script'
import { fmt } from '@/lib/i18n'
import type { UI } from '@/content/ui'
import { ScrollFade } from './scroll-fade'

const Sheet = dynamic(() => import('./sheet'), { ssr: false })
const PAUSES = [0.5, 1, 2, 3]

/**
 * The script field: a textarea over a mirrored backdrop that colors each effect span, plus a row of effect chips
 * (scrolling, with the character count beside it) and a drawer with every effect.
 */
export function ScriptEditor({
  ui, value, onChange, disabled, moodsWithClips, maxLength, onSubmit, onFocus, highlight,
}: {
  ui: UI
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  moodsWithClips: Mood[]
  maxLength: number
  onSubmit?: () => void
  onFocus?: () => void
  /** The word being heard, as character offsets into `value`. */
  highlight?: { start: number; end: number } | null
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const markRef = useRef<HTMLElement>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const isPhone = useMediaQuery('(max-width: 1023px)')
  const popoverRef = useRef<HTMLDivElement>(null)
  // Desktop popover: close on a click outside or Escape.
  useEffect(() => {
    if (!pickerOpen || isPhone) return
    const onDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (!popoverRef.current?.contains(target) && !(target as Element).closest?.('.effects-all')) setPickerOpen(false)
    }
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setPickerOpen(false) }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey) }
  }, [pickerOpen, isPhone])
  const [selection, setSelection] = useState('')
  /** Where the caret goes after the next render (set when a change rewrites text before the caret). */
  const caretRef = useRef<number | null>(null)

  // Grow with the text. CSS caps the height (max-height), then the field scrolls.
  // Also put the caret back in the same commit, so the next keystroke lands where the person expects.
  useLayoutEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight + 2}px`
    if (caretRef.current !== null) {
      el.setSelectionRange(caretRef.current, caretRef.current)
      caretRef.current = null
    }
  }, [value])

  // Keep the spoken word in view when the field scrolls.
  useEffect(() => {
    const field = textareaRef.current
    const mark = markRef.current
    if (!highlight || !field || !mark) return
    const top = mark.offsetTop
    if (top < field.scrollTop || top > field.scrollTop + field.clientHeight - 40) field.scrollTop = Math.max(0, top - field.clientHeight / 3)
  }, [highlight?.start])

  /** Typing "[happy:" becomes "[😊:", and the caret stays where it was. */
  const change = (next: string, caret: number) => {
    const before = emojifyTags(next.slice(0, caret))
    const after = next.slice(caret)
    const result = before + after
    if (result !== next) caretRef.current = before.length
    onChange(result)
  }

  /** Wrap the selected text in an effect, or insert an empty one with the caret inside. Pauses go at the caret. */
  const apply = (effect: string, pause = false) => {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart ?? value.length
    const end = el.selectionEnd ?? value.length
    const picked = value.slice(start, end)
    const before = value.slice(0, start)
    const after = value.slice(end)
    const padBefore = before && !/\s$/.test(before) ? ' ' : ''
    const padAfter = after && !/^\s/.test(after) ? ' ' : ''
    let inserted: string
    let caretInside: number
    if (pause) {
      inserted = `[${effect}]`
      caretInside = inserted.length
    } else {
      inserted = `[${effect}: ${picked.trim()}]`
      caretInside = picked.trim() ? inserted.length : inserted.length - 1
    }
    const next = `${before}${padBefore}${inserted}${padAfter}${after}`.slice(0, maxLength)
    onChange(next)
    const caret = (before + padBefore).length + caretInside
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(caret, caret) })
  }

  const openPicker = () => {
    const el = textareaRef.current
    setSelection(el ? value.slice(el.selectionStart, el.selectionEnd).trim() : '')
    setPickerOpen(true)
  }

  const pickerBody = (
    <>
              <p className="sheet-note">
                {selection ? <>{ui.appliesTo} <span className="sheet-quote">“{selection.length > 60 ? `${selection.slice(0, 60)}…` : selection}”</span></> : ui.atCursor}
              </p>
              <ScrollFade className="panel-scroll">
                <section className="section">
                  <div className="section-head"><h3 className="label">{ui.emotionsLabel}</h3><span className="hint">{ui.emotionsNote}</span></div>
                  <div className="effect-grid">
                    {MOODS.map((mood) => (
                      <button key={mood} className={`effect-tile mood-${mood}${moodsWithClips.includes(mood) ? '' : ' is-fallback'}`}
                        onClick={() => { setPickerOpen(false); apply(MOOD_EMOJI[mood]) }}>
                        <span className="effect-emoji" aria-hidden>{MOOD_EMOJI[mood]}</span>
                        <span className="effect-text"><span className="effect-name">{ui.moods[mood]}</span><span className="effect-hint">{ui.moodHints[mood]}</span></span>
                      </button>
                    ))}
                  </div>
                </section>
                <section className="section">
                  <h3 className="label">{ui.deliveryLabel}</h3>
                  <div className="effect-grid">
                    {DELIVERY.map((effect: Delivery) => (
                      <button key={effect} className="effect-tile is-plain" onClick={() => { setPickerOpen(false); apply(effect) }}>
                        <span className="effect-text"><span className="effect-name">{ui.chips[effect]}</span><code className="effect-code">[{effect}: …]</code></span>
                      </button>
                    ))}
                  </div>
                </section>
                <section className="section">
                  <div className="section-head"><h3 className="label">{ui.chips.pause}</h3><span className="hint">{ui.atCursor}</span></div>
                  <div className="pause-grid">
                    {PAUSES.map((seconds) => (
                      <button key={seconds} className="effect-tile is-plain is-pause" onClick={() => { setPickerOpen(false); apply(`pause ${seconds}s`, true) }}>{seconds}s</button>
                    ))}
                  </div>
                </section>
              </ScrollFade>
    </>
  )

  return (
    <div className="editor">
      <div className="editor-field">
        <div ref={backdropRef} className="editor-backdrop" aria-hidden>
          {renderBackdrop(value, highlight ?? null, markRef)}
          {'\n'}
        </div>
        <textarea
          ref={textareaRef}
          aria-label={ui.scriptLabel}
          value={value}
          maxLength={maxLength}
          disabled={disabled}
          spellCheck={false}
          placeholder={ui.scriptPlaceholder}
          onChange={(event) => change(event.target.value, event.target.selectionStart)}
          onFocus={onFocus}
          onScroll={(event) => { if (backdropRef.current) backdropRef.current.scrollTop = event.currentTarget.scrollTop }}
          onKeyDown={(event) => {
            // Ctrl+Enter or Cmd+Enter generates.
            if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); onSubmit?.() }
          }}
          className="editor-input"
        />
      </div>

      <div className="effects-row">
        <button type="button" className="effects-all" aria-label={ui.allEffects} title={ui.allEffects} disabled={disabled}
          aria-expanded={pickerOpen} aria-haspopup="dialog"
          onMouseDown={(event) => event.preventDefault()} onClick={() => (pickerOpen ? setPickerOpen(false) : openPicker())}>
          <SlidersHorizontal size={16} />
        </button>
        <ScrollFade axis="x" className="chips" role="toolbar" aria-label={ui.insertTag}>
          {MOODS.map((mood) => (
            <button key={mood} type="button" disabled={disabled}
              className={`chip chip-mood mood-${mood}${moodsWithClips.includes(mood) ? '' : ' is-fallback'}`}
              title={moodsWithClips.includes(mood) ? fmt(ui.insertThis, { tag: `[${MOOD_EMOJI[mood]}: …]` }) : fmt(ui.noMoodClip, { mood: ui.moods[mood].toLowerCase() })}
              onMouseDown={(event) => event.preventDefault()} onClick={() => apply(MOOD_EMOJI[mood])}>
              <span aria-hidden>{MOOD_EMOJI[mood]}</span> {ui.moods[mood]}
            </button>
          ))}
          <span className="chips-divider" aria-hidden />
          <button type="button" disabled={disabled} className="chip" onMouseDown={(event) => event.preventDefault()}
            onClick={() => apply('pause 1s', true)}>{ui.chips.pause}</button>
          {DELIVERY.map((effect) => (
            <button key={effect} type="button" disabled={disabled} className="chip" title={fmt(ui.insertThis, { tag: `[${effect}: …]` })}
              onMouseDown={(event) => event.preventDefault()} onClick={() => apply(effect)}>
              {ui.chips[effect]}
            </button>
          ))}
        </ScrollFade>
        <span className="char-count">{value.length}/{maxLength}</span>
      </div>

      {!isPhone && pickerOpen && (
        <div ref={popoverRef} className="effects-popover" role="dialog" aria-label={ui.effectsTitle}>
          <div className="popover-head">
            <span className="popover-title">{ui.effectsTitle}</span>
            <button className="icon-btn" aria-label={ui.close} onClick={() => setPickerOpen(false)}><X size={16} /></button>
          </div>
          {pickerBody}
        </div>
      )}

      {isPhone && (
        <Sheet open={pickerOpen} onOpenChange={setPickerOpen} title={ui.effectsTitle} done={ui.done} className="sheet-effects">
          {pickerBody}
        </Sheet>
      )}
    </div>
  )
}

function useMediaQuery(query: string) {
  const subscribe = useCallback((notify: () => void) => {
    const list = window.matchMedia(query)
    list.addEventListener('change', notify)
    return () => list.removeEventListener('change', notify)
  }, [query])
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false)
}

/** The backdrop: the same text, with each tag (a whole "[effect: text]" span) tinted, and the spoken word marked. */
function renderBackdrop(value: string, highlight: { start: number; end: number } | null, markRef: React.RefObject<HTMLElement | null>) {
  const nodes: ReactNode[] = []
  let key = 0
  // Plain text between from and to, with the spoken word marked if it falls inside.
  const text = (from: number, to: number) => {
    if (highlight && highlight.start >= from && highlight.end <= to) {
      return [
        value.slice(from, highlight.start),
        <mark key={`w${key++}`} ref={markRef as React.RefObject<HTMLElement>} className="spoken-word">{value.slice(highlight.start, highlight.end)}</mark>,
        value.slice(highlight.end, to),
      ]
    }
    return [value.slice(from, to)]
  }
  let cursor = 0
  for (const match of value.matchAll(TAG_RE)) {
    const at = match.index ?? 0
    nodes.push(...text(cursor, at))
    const look = tagLook(match[0])
    const className = look.kind === 'bad' ? 'tag tag-bad' : look.kind === 'mood' ? `tag tag-mood mood-${look.mood}` : 'tag'
    nodes.push(<mark key={`t${key++}`} className={className}>{text(at, at + match[0].length)}</mark>)
    cursor = at + match[0].length
  }
  nodes.push(...text(cursor, value.length))
  return nodes
}
