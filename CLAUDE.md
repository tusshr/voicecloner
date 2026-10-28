# CLAUDE.md

Project memory for Claude Code. Read this first, then the docs it points to.

## What this is

**Vocalis** — a free voice studio that runs fully in the browser, in 5 languages (en, es, pt, de, it).

- **Text to voice** (home page `/`): type a script, pick a sample voice or clone your own from ~10 s of audio, download WAV. Effects in the script: `[😊: …]` emotions (need your own recorded mood), `[slow: …]`, `[fast: …]`, `[soft: …]`, `[loud: …]`, `[pause 1s]`.
- **Voice to text** (`/voice-to-text`): record or upload audio, Whisper transcribes it, copy / .txt / .srt / Read aloud.
- Live: https://freevoiceclone.vercel.app (Vercel, auto-deploys on push to `main`). Old address: voicecloner-ebon.vercel.app.
- Current version: see `package.json` (shown in the footer). Last release: **v1.1.2** (2026-10-28).

| Doc | What is in it |
| --- | --- |
| `docs/PRD.md` | Product: users, positioning, keywords, features, monetization, decisions and why |
| `docs/DESIGN.md` | Design system and UX rules agreed with the owner (read before any UI change) |
| `docs/ROADMAP.md` | **What to do next**, in order, and what to test |
| `docs/RELEASE-CHECKLIST.md` | The owner's launch process for every tool, and where Vocalis stands on it |
| `CHANGELOG.md` | Keep a Changelog format, semantic versioning |

## Commands

```bash
npm install
npm run dev                         # http://localhost:3000
npm run build                       # static export to out/
npx tsc --noEmit                    # type check (run before every commit)
npm run preview                     # serve out/ on :4000 with clean URLs and COOP/COEP headers like Vercel (`serve` + serve.json; plain http.server breaks client navigation and isolation)
```

Append `?engine=mock` to any page to use fake engines (no model download): text to voice and voice to text both support it.

## Architecture

Next.js 16 (App Router, Turbopack) with `output: 'export'` — a fully static site. No server code, no API.

| Area | Files |
| --- | --- |
| Routes | `app/(en)/…` English at the root; `app/(intl)/[lang]/…` the other languages. Pages: home, voice-to-text, about, contact, privacy + terms (English only), 404, 500 |
| Page assembly, metadata, JSON-LD | `components/home-page.tsx`, `components/stt-page.tsx` (one module per tool page), `components/pages.tsx` (about, contact, legal), `lib/seo.ts`, `app/sitemap.ts`, `app/robots.ts` |
| Navigation and transitions | `next/link` for same-language links (client navigation); `components/site-header.tsx` (`PinnedHeader`: header stays still while the page cross-fades), `components/tool-switch.tsx` (sliding pill, transition type `tool-switch`), CSS at the end of `globals.css`. Language links stay `<a>` (each language is its own root layout) |
| Error handling | `components/error-boundary.tsx` (`catchError` around each tool in the page modules; header passed as a prop), `app/**/error.tsx` + `components/error-view.tsx` (route level), `app/global-error.tsx` |
| Text to voice UI | `components/voice-tool.tsx` (state, generate, voice drawer, generations), `components/script-editor.tsx` (editor, effect chips, effect picker), `components/sheet.tsx` (phone drawer, Vaul, loaded with `next/dynamic`) |
| Script syntax | `lib/script.ts` (parser, `emojifyTags`, sentence split) |
| TTS engine | `lib/tts-engine.ts` → worker `public/pocket-tts/inference-worker.js` (Kyutai Pocket TTS, ONNX Runtime Web 1.20 from jsDelivr) |
| Voice to text | `components/stt-tool.tsx`, `lib/stt-engine.ts` → worker `public/whisper-worker.js` (Whisper base q8 via transformers.js 4.3.1 `dist/transformers.min.js` from jsDelivr) |
| Audio | `lib/audio-stage.ts` (shared AudioContext, analyser, player with audible-time tracking), `lib/audio-fx.ts` (time stretch, gain, fades, concat) |
| Sample voices / demos | `lib/voices.ts`, `lib/demos.ts`, `public/demos/<lang>/<id>.mp3` (39 files; es/alba-merchant missing on purpose), `tools/make-demos.py` |
| Text content | `content/ui.ts` (TTS UI, 5 langs), `content/home/<lang>.ts` (home SEO article + FAQ), `content/stt.ts` (voice to text UI + article + FAQ), `content/pages.ts` (about, contact, footer), `content/legal.ts`; small browser-side modules: `content/tools.ts` (tool names), `content/errors.ts` (error screens) |
| Site config | `lib/site.ts` (env vars), `lib/i18n.ts`, `next.config.mjs` (version → `NEXT_PUBLIC_APP_VERSION`), `vercel.json` (rewrite for the Search Console file), `public/_headers` (Cloudflare Pages) |
| Styles | `app/globals.css` (one file, CSS variables; Tailwind is imported but barely used) |

Environment variables (set in Vercel → production): `NEXT_PUBLIC_SITE_URL=https://freevoiceclone.vercel.app`, `NEXT_PUBLIC_INDEXABLE=true`. Not set yet: `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_LEGAL_EMAIL`.

## Working rules (from the owner)

- **Commit and push as you go.** Pushing to `main` deploys to production on Vercel. Check the deployment after pushing.
- **No co-author lines** in commits. Author: `tusshr <tusshr@users.noreply.github.com>`.
- **Tag before risky UI work** so the owner can roll back (existing tags: `ux-v1-bottom-sheet`, `ux-v2-vaul`, `ux-v3-before-redesign`, `ux-v4-final-mobile`, `ux-v5-before-polish`, `ux-v6-before-transitions`, `v1.0.0`, `v1.1.0`, `v1.1.1`, `v1.1.2`).
- **Every change goes in `CHANGELOG.md`** under `[Unreleased]` (Added / Changed / Fixed). Releases: bump `package.json`, move the section, tag `vX.Y.Z`, create a GitHub release with the notes.
- **Show a UI mockup first** for bigger design changes (the owner reviews on the design canvas, then says "go ahead").
- **All 5 languages** for every user-facing string and for SEO content. Keep strings in `content/`, never inline.
- **Mobile first.** The owner tests on an Android phone in dark mode; test 360 px and 390 px wide, plus desktop.
- Be honest about limits (licenses, model quality, revenue). The owner explicitly asks for no fake hope.
- GitHub access: the owner gives a fine-grained token in the chat when needed. Never write a token into a file or commit.

## Testing recipes

- Headless Chromium via Playwright (Python) against `out/` served on port 4000 (`npm run preview`).
- Fake microphone: launch with `--use-fake-ui-for-media-stream --use-fake-device-for-media-stream` and grant `microphone`.
- Phone share button exists only where `navigator.canShare` exists: add the init script `navigator.canShare = () => true; navigator.share = async () => {}` to test the real phone layout (this is how the sideways-overflow bug was found).
- Always check `document.documentElement.scrollWidth === clientWidth` on phones (no sideways scroll).
- Real models can be tested in headless Chromium (network is allowed): Whisper loads in ~20 s; transcribe `public/demos/en/bill.mp3` and compare with the line in `lib/demos.ts`.

## Gotchas (learned the hard way)

- **Tailwind class collisions**: a class named `ring` got Tailwind's ring utility (white outline). Use specific names (`progress-ring`).
- **`transformers.web.min.js` cannot load in a browser worker** (bare imports of `onnxruntime-web`). Use `dist/transformers.min.js`.
- **Vercel strips `.html`** from static files: `/file.html` 404s. `vercel.json` rewrites the Search Console file.
- **Fixed-size buttons**: state labels must never change a button's width (the owner notices layout shift). Stack alternative labels in one grid cell (`.swap`) or use fixed widths (`.action-btn`).
- **Caret after programmatic text edits**: restore it in `useLayoutEffect` (same commit), not `requestAnimationFrame`, or fast typing lands in the wrong place.
- **Player timing**: use the audible time (`getOutputTimestamp`), not `currentTime`, or visuals run ahead of the sound on phones / Bluetooth.
- **Sticky header** must be a child of the scrolling page; on home the tool wrapper is `display: contents` for this reason.
- **Kyutai Expresso emotion voices are CC BY-NC** (non-commercial). Do not use them; emotions need the user's own recorded moods.
- **Vercel Hobby is non-commercial only.** Move hosting to Cloudflare Pages before adding ads (see ROADMAP).
- **Pages change without a reload** (client navigation): tools must release what they hold on unmount (mic, player, workers). Every page's header must be wrapped in `PinnedHeader`; that shared name is what starts the page cross-fade.
- **Two tool switches are in the DOM** (header on desktop, inline on phones; CSS hides one), so view transition names include the variant. Never give two mounted elements the same name.
- **Bundle size = what client modules import.** A page ships every client component its server modules import, and a client component ships every content file it imports (all 5 languages). Keep tool pages in separate modules, pass page text to client components as props, and keep content that client code imports small (`content/tools.ts`, `content/errors.ts`). Check first-load JS after changes: about ≈148 KB gz is the Next.js + React floor.
- **The server renders the desktop layout** (`useMediaQuery` is false on the server). Anything that appears only on desktop must also be hidden by CSS on phones, or the page jumps after hydration (CLS; this cost 10 Lighthouse points on mobile).
- **Lighthouse locally is noisy** (±10 points). Score with PageSpeed Insights on the deployed site; use local runs only for before/after comparisons on the same machine.
- **Cross-origin isolation (COOP/COEP)** is on for the whole site; it is what gives the models threads. Any new cross-origin resource (scripts, iframes, ads, embeds) must work under `COEP: credentialless`; test with `self.crossOriginIsolated` still true. A stale HTTP-cached page without the headers makes a test browser look non-isolated: clear the cache.
- Killing processes with `pkill -f <pattern>` can kill your own shell when the pattern is in the command line; kill by PID from a script file instead.
