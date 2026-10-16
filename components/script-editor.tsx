'use client'

import { useRef, type ReactNode } from 'react'
import { isKnownTag, MOODS, type Mood } from '@/lib/script'
import { fmt } from '@/lib/i18n'
import type { UI } from '@/content/ui'

const TAG_SPLIT = /(\[[^\]]*\])/g

type Chip = { label: string; tag: string; muted?: boolean }

/** Textarea with tag highlighting (mirrored backdrop) and a row of insert chips. */
export function ScriptEditor({
  ui, value, onChange, disabled, moodsWithClips, maxLength,
}: {
  ui: UI
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  moodsWithClips: Mood[]
  maxLength: number
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)

  const chips: Chip[] = [
    { label: ui.chips.pause, tag: '[pause 1s]' },
    ...MOODS.map((mood) => ({ label: ui.moods[mood], tag: `[${mood}]`, muted: !moodsWithClips.includes(mood) })),
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

  const highlighted: ReactNode[] = value.split(TAG_SPLIT).map((part, index) =>
    index % 2 === 1
      ? <mark key={index} className={isKnownTag(part) ? 'tag' : 'tag tag-bad'}>{part}</mark>
      : <span key={index}>{part}</span>,
  )

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
          onScroll={(event) => { if (backdropRef.current) backdropRef.current.scrollTop = event.currentTarget.scrollTop }}
          className="editor-input"
        />
      </div>
      <div className="chips" role="toolbar" aria-label={ui.insertTag}>
        {chips.map((chip) => (
          <button
            key={chip.tag}
            type="button"
            disabled={disabled}
            className={chip.muted ? 'chip chip-muted' : 'chip'}
            title={chip.muted ? fmt(ui.noMoodClip, { mood: chip.label.toLowerCase() }) : fmt(ui.insertThis, { tag: chip.tag })}
            onClick={() => insert(chip.tag)}
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  )
}

