'use client'

import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import { isKnownTag, MOOD_EMOJI, MOODS, tagMood, type Mood } from '@/lib/script'
import { fmt } from '@/lib/i18n'
import type { UI } from '@/content/ui'

const TAG_SPLIT = /(\[[^\]]*\])/g

type Chip = { label: string; tag: string; muted?: boolean; emoji?: string; mood?: Mood }

/** Textarea with tag highlighting (mirrored backdrop) and a row of insert chips. */
export function ScriptEditor({
  ui, value, onChange, disabled, moodsWithClips, maxLength, onSubmit, onFocus, showMoods = true, highlight,
}: {
  ui: UI
  /** The word being spoken, as character offsets into `value`. */
  highlight?: { start: number; end: number } | null
  showMoods?: boolean
  onSubmit?: () => void
  onFocus?: () => void
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  moodsWithClips: Mood[]
  maxLength: number
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)

  // Grow with the text. CSS caps the height (max-height), then the field scrolls.
  useLayoutEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight + 2}px`
  }, [value])

  // Emotions first, as emoji chips; then delivery (pause, speed, volume).
  const moodChips: Chip[] = MOODS.map((mood) => ({
    label: ui.moods[mood], emoji: MOOD_EMOJI[mood], mood, tag: `[${MOOD_EMOJI[mood]} ${mood}]`, muted: !moodsWithClips.includes(mood),
  }))
  const chips: Chip[] = [
    { label: ui.chips.pause, tag: '[pause 1s]' },
    { label: ui.chips.slow, tag: '[slow]' },
    { label: ui.chips.fast, tag: '[fast]' },
    { label: ui.chips.soft, tag: '[soft]' },
    { label: ui.chips.loud, tag: '[loud]' },
    { label: ui.chips.normal, tag: '[normal]' },
  ]

  const insert = (tag: string) => {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart ?? value.length
    const end = el.selectionEnd ?? value.length
    const before = value.slice(0, start)
    const after = value.slice(end)
    const padBefore = before && !/\s$/.test(before) ? ' ' : ''
    const padAfter = after && !/^\s/.test(after) ? ' ' : ''
    const next = `${before}${padBefore}${tag}${padAfter}${after}`.slice(0, maxLength)
    onChange(next)
    const caret = (before + padBefore + tag + padAfter).length
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(caret, caret) })
  }

  const markRef = useRef<HTMLElement>(null)
  let offset = 0
  const highlighted: ReactNode[] = value.split(TAG_SPLIT).map((part, index) => {
    const at = offset
    offset += part.length
    if (index % 2 === 1) {
      return <mark key={index} className={!isKnownTag(part) ? 'tag tag-bad' : tagMood(part) ? `tag tag-mood mood-${tagMood(part)}` : 'tag'}>{part}</mark>
    }
    // The spoken word, while a take of this exact text plays.
    if (highlight && highlight.start >= at && highlight.end <= at + part.length) {
      const a = highlight.start - at
      const b = highlight.end - at
      return (
        <span key={index}>
          {part.slice(0, a)}<mark ref={markRef} className="spoken-word">{part.slice(a, b)}</mark>{part.slice(b)}
        </span>
      )
    }
    return <span key={index}>{part}</span>
  })

  // Keep the spoken word in view when the field scrolls.
  useEffect(() => {
    const field = textareaRef.current
    const mark = markRef.current
    if (!highlight || !field || !mark) return
    const top = mark.offsetTop
    if (top < field.scrollTop || top > field.scrollTop + field.clientHeight - 40) field.scrollTop = Math.max(0, top - field.clientHeight / 3)
  }, [highlight?.start])

  return (
    <div className="editor">
      <div className="editor-field">
        <div ref={backdropRef} className="editor-backdrop" aria-hidden>
          {highlighted}
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
          onChange={(event) => onChange(event.target.value)}
          onFocus={onFocus}
          onScroll={(event) => { if (backdropRef.current) backdropRef.current.scrollTop = event.currentTarget.scrollTop }}
          onKeyDown={(event) => {
            // Ctrl+Enter or Cmd+Enter generates.
            if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); onSubmit?.() }
          }}
          className="editor-input"
        />
      </div>
      <div className="chips" role="toolbar" aria-label={ui.insertTag}>
        {showMoods && moodChips.map((chip) => (
          <button key={chip.tag} type="button" disabled={disabled}
            className={`chip chip-mood mood-${chip.mood}${chip.muted ? ' is-fallback' : ''}`}
            title={chip.muted ? fmt(ui.noMoodClip, { mood: chip.label.toLowerCase() }) : fmt(ui.insertThis, { tag: chip.tag })}
            onClick={() => insert(chip.tag)}>
            <span aria-hidden>{chip.emoji}</span> {chip.label}
          </button>
        ))}
        {showMoods && <span className="chips-divider" aria-hidden />}
        {chips.map((chip) => (
          <button key={chip.tag} type="button" disabled={disabled} className="chip"
            title={fmt(ui.insertThis, { tag: chip.tag })} onClick={() => insert(chip.tag)}>
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  )
}

