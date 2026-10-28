# DESIGN.md: Vocalis design system

Rules agreed with the owner during the v1.0.0 redesign. Read before changing UI. The design canvas (mockups) is a claude.ai artifact: "Vocalis mobile layout" (https://claude.ai/artifact/8EmvSeye5T3skQFxo4hT1P), with text-to-voice and voice-to-text boards.

## Principles

1. **Linear-like look, native-app feel.** Clean, neutral, hairline borders, one accent. On phones it must behave like an app, not a desktop workbench.
2. **Nothing jumps.** Buttons keep one size in every state; drawers keep one height across tabs; no state may resize its neighbors.
3. **Tool first.** The tool sits right under the header. Title, subtitle and long text live below it.
4. **Show, then build.** Bigger changes get a mockup on the canvas first.

## Tokens (`app/globals.css`, `:root`)

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--canvas` | #f7f7f8 | #0b0b0d | Page |
| `--panel` | #ffffff | #131316 | Cards, panes, drawers |
| `--raised` | #fbfbfc | #17171b | Inner surfaces, action bar |
| `--subtle` | #f1f1f3 | #1e1e23 | Hover, segmented control track |
| `--hairline` / `--hairline-strong` | #e4e4e7 / #d4d4d8 | #26262c / #34343c | Borders |
| `--ink` / `--body` / `--muted` | #18181b / #3f3f46 / #6b6b74 | #ededf0 / #c4c4cc / #8b8b95 | Text |
| `--primary` / `--on-primary` | ink / white | light / near-black | Primary button |
| `--accent` | #0d9488 | #2dd4bf | Teal: progress ring, played waveform, spoken word, selected voice |
| `--accent-ink` | #0f766e | #2dd4bf | Teal **text** (small labels, Done). `--accent` is below 4.5:1 for text in light mode |
| `--mint --peach --lavender --sky --rose` | pastels | | Voice avatars, stage glow, wordmark |
| Mood tints `--mood-*` | happy amber, sad blue, excited pink, calm green, whisper violet | | Emotion chips and spans |

Radii: 6 / 8 / 12 px (`--r-sm/md/lg`); drawers 18 px top corners; stage 16 px. Font: Inter only (Fraunces was removed). Emoji only for emotions.

## Layout

- Desktop (≥1024 px): `.shell-home` max 1080 px (workbench renders ~1016 px; editor ~72 characters per line). Workspace grid: main pane + 360 px side pane (voices / transcripts), side pane takes the main pane's height and scrolls inside. Article below in one 720 px column (like Real Online Ruler). Footer in the same column.
- Phones: single column; header (wordmark + language) sticky with a frosted blur; tool switch under the header; text card; fixed action bar at the bottom; side content in a Vaul drawer (text to voice) or below the card (voice to text, hidden while empty).
- Sticky header: full-bleed frosted bar (`backdrop-filter: blur(14px) saturate(1.5)`, canvas at 78%), hairline bottom border, safe-area aware.

## Components

| Component | Rules |
| --- | --- |
| Header | Wordmark left, tool switch centered (desktop), language pill right. No install button here (it is in the footer). |
| Tool switch | Two-part segmented control: "Text to voice │ Voice to text". Links, not tabs (each tool is its own page). Switching slides the white pill to the other tool (220 ms). |
| Text card head | Language menu left (full name, same size on both tools), Hear a demo / Upload audio right. Nothing else, so it fits at 360 px in every language. |
| Stage | The first version's clean waveform: soft mint/peach/lavender glow, slim white bars, **no text, no buttons**. Idle, working (generating / loading), live (playing / recording). ~136 px phones, 160 px desktop. Recording shows a red dot + timer top-left. |
| Editor | Textarea over a mirrored backdrop that tints whole effect spans and marks the spoken word. 17 px text on both tools, same left edge. |
| Rails (row under the text) | Same shape on both tools: icon buttons left, chips in the middle (scroll, edge fade), count right. Text to voice: sliders, ↺ reset (always there, disabled on the example text), effect chips, characters. Voice to text (when there is text): ＋ New transcript, Copy, Read aloud, .txt, .srt, words. |
| Effect picker | Phones: Vaul drawer. Desktop: popover above the effects row (Escape / outside click closes). Emotions as tiles with description; delivery tiles show syntax; pauses 0.5–3 s. |
| Action bar | Left: voice chip (opens the voice drawer) or mic status. Right: **fixed-size** action button (148×48 phones, 156×36 desktop). Working states: outline + running teal border (`.progress-ring`), short labels ("45%", "Stop"). |
| Generations / transcripts | Cards: compact player (play, waveform bars, time, ⋮ menu) + text clamp (2 lines) + meta (voice · time). Loaded item gets a teal outline. |
| Menus | ⋮ menu for share/download; opens toward the side with room (never off screen). |
| Drawers | Vaul; handle, title + Done, full-width two-part switch, fixed height (`min(78dvh, 640px)`), swipe or tap outside to close. |
| Scroll areas | No scrollbar; `ScrollFade` adds an edge fade only where content continues (scroll events, works in Firefox). |

## Interaction rules

- Text contrast ≥4.5:1 (Lighthouse accessibility 100): `--muted` is the lightest text color; never put `--accent` on small text.
- Touch targets ≥44 px on phones; chips 36 px; text 15–17 px.
- Closing a drawer while recording stops the mic (keep ≥5 s, drop shorter).
- Typing `[happy:` becomes `[😊:` (any page language); chips wrap the selection or insert `[effect: ]` with the caret inside.
- Loading a generation replaces the editor text only after confirming, if the user typed their own text.
- Demos play without downloading the model.
- Page changes: the page cross-fades (browser default, ~250 ms) under a still header. No directional slides: the pages are siblings, not deeper levels.
- Reduced motion: no ring spin, no sheet animation, no caret blink, no page transitions.

## Don'ts

- No extra explanatory lines under the tool ("runs in your browser", demo explanations) — the owner removed them as bloat.
- No WhatsApp-style player replacing the stage; no read-along text box.
- No class names that collide with Tailwind utilities (`ring`, `shadow`, `border`…).
- No layout shift from state changes.
