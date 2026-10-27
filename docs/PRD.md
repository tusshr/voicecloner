# PRD: Vocalis

Product requirements. Last updated 2026-10-27 (v1.0.0).

## 1. Summary

Vocalis is a free, no-sign-up voice studio that runs entirely in the visitor's browser. The models download once and run on the device, so every generation and transcription costs the owner nothing. That is the real advantage: the free tier can be truly unlimited, which server-based competitors cannot afford.

Tools today: **text to voice** with voice cloning (home page) and **voice to text** (`/voice-to-text`). Planned third tool: a **voice cleaner** (noise removal).

## 2. Goals

- Rank for "text to voice", "voice clone" and "voice to text" searches (and their easier long-tail variants) in 5 languages.
- Earn from display ads (AdSense) below the tools; later, optionally, a cheap one-time Pro (longer texts, captioned video, batch).
- Stay sellable: clean code, commercial-safe licenses, no per-user costs.

Non-goals: accounts, cloud storage, server-side inference.

## 3. Users and use cases

- Creators making voiceovers for Reels, TikTok and YouTube Shorts; people sending WhatsApp voice messages.
- People who want their own voice (or a sample voice) to read a script, without paying for ElevenLabs.
- People who need a transcript of a voice note, an interview or a video, or subtitles (.srt).
- Mostly phones (Android first), dark mode common; desktop second.

## 4. Positioning (what we say)

Lead with **free, unlimited, no sign-up, instant demos, works on your phone**. Privacy ("your audio stays on your device") is true but does not sell; keep it in the FAQ, not in headlines.

Honest limits:
- Pocket TTS has 8 sample voices and 5 languages vs. 200+ voices / 50+ languages at TTSMaker or Luvvoice.
- First use downloads ~150 MB (text to voice) or ~80 MB (voice to text); demos hide this for text to voice.
- Emotions only work with the user's own recorded moods (no commercially usable emotional sample voices yet).
- Model quality in Spanish is weaker than English.

## 5. Keywords (owner's Ahrefs data, English)

| Keyword | Volume | KD |
| --- | --- | --- |
| text to voice | >10,000 | Hard |
| text to voice generator / ai / free / free text to voice / software | >1,000 each | Hard |
| text to voice app | >100 | **Easy** |
| text to voice online, text to voice generator free | >100 | Hard |
| voice clone, ai voice clone | >1,000 | Hard |
| voice clone free, free ai voice clone, free voice clone | >100 | Hard |
| how to clone a voice with ai (and variants) | >100 | Hard |
| voice to text | >10,000 | Hard |
| voice to text google docs, voice to text iphone, best voice to text app | >1,000 / >100 | **Easy** |
| voice to text app, voice to text software | >1,000 | Medium |
| how to turn on voice to text on android | >1,000 | **Easy** |

No data yet for es / pt / de / it; local terms were used ("texto a voz", "clonar voz", "Text zu Sprache", "da testo a voce"…). Ask the owner for Ahrefs exports per language.

Rules from the owner: never target keywords that contain a competitor's brand ("elevenlabs voice clone"). Platform names (Google Docs, iPhone, YouTube) are used where they describe where the user works.

## 6. Features (v1.0.0)

### Text to voice (home)
- Script editor with tinted effect spans; effect chips (emotions first, then pause / slow / fast / soft / loud) in one scrolling row with the character count (700 max); "All effects" picker (drawer on phones, popover on desktop) that wraps the selection.
- Speech language (en, es, pt, de, it) separate from the page language; each loads its own model.
- 8 sample voices with pre-made demos in every language (no model download needed to hear them); clone your own voice by recording or uploading ≥5 s (10 s recommended) with a consent checkbox; record moods (happy, sad, excited, calm, whisper) for emotion tags.
- Generate in sentences, word highlight in the editor while the newest take plays, generations list (play, waveform, text, voice, time; loads text into the editor, asks before replacing typed text), ⋮ menu: share (phones), download WAV.
- Voice panel: desktop side pane; phones a Vaul drawer (Voices | My voice tabs, fixed height, swipe to close; closing while recording keeps ≥5 s or drops a shorter clip).

### Voice to text (`/voice-to-text`)
- Record (live preview every 3 s, parts closed at 24 s for Whisper's 30 s window) or upload audio/video.
- Editable transcript, Copy, Read aloud (hands the text and language to text to voice), download .txt / .srt (timestamps from Whisper chunks), word count, transcripts history in localStorage (20 max).

### Site
- 5 languages with hreflang, canonical, sitemap, robots, JSON-LD (WebApplication, WebSite, FAQPage), sticky frosted header with the tool switch, footer with tools, pages, languages, Install app (PWA) and version.

## 7. Models and licenses

| Use | Model | License | Notes |
| --- | --- | --- | --- |
| Text to voice + cloning | Kyutai Pocket TTS (ONNX) | CC BY 4.0 | Credit in footer |
| Sample voices | Alba MacKenna (CC BY 4.0), Voice-Zero readers (CC0) | Commercial OK | Credit in footer |
| Emotion sample voices | Kyutai Expresso | **CC BY-NC 4.0** | **Not usable** (non-commercial) |
| Voice to text | OpenAI Whisper base (onnx-community, q8, ~77 MB) | MIT | Covers all 5 languages |
| Candidate: voice to text | Cactus Whistle (16.9 MB, Apache-2.0) | Commercial OK | en, de, fr, es, it, nl, pl — **no Portuguese**; released 2026-10-02; see ROADMAP |
| Candidate: voice cleaner | Desert Ant Labs Clear (9 MB) | Custom: free <100k MAD, visible credit, unpublished price above | Prefer an open-source denoiser; test both |
| Candidate: faster TTS | Kokoro 82M (54 voices, 9 languages) | Apache-2.0 | For instant multi-voice TTS; Pocket TTS stays for cloning |

## 8. Monetization and constraints

- Display ads below the tools, never inside the workbench. AdSense needs a domain the owner controls (ads.txt at the root), so a custom domain is a prerequisite.
- **Vercel Hobby is non-commercial**: move to Cloudflare Pages before ads.
- Realistic expectation shared with the owner: new site, Hard keywords, 6–12 months to rank; display ads earn roughly a few dollars per 1,000 page views. Treat as a long-term experiment.

## 9. Decisions log (why things are the way they are)

- Linear-like visual style (neutral surfaces, hairlines, one teal accent) but **app-like UX on phones** (thumb-reach action bar, drawers, ≥44 px targets).
- Read-along box removed (owner found it annoying and redundant); the spoken word is marked in the editor instead.
- Emoji only for emotions; delivery effects stay words (emoji for them were unclear).
- Colon syntax `[effect: text]` so the scope is visible; old `[slow] … [normal]` still parsed.
- Title + subtitle moved below the tool (tool first, like 123apps / Real Online Ruler); still the visible H1.
- Install button moved to the footer.
