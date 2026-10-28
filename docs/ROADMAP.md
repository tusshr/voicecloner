# ROADMAP: what to do next

Ordered. Start a session by reading this, then remind the owner where we are. Tick items as they ship and log them in `CHANGELOG.md`.

## 0. Owner actions (outside the code)

- [ ] **Search Console**: click Verify for `https://freevoiceclone.vercel.app/` (HTML file method; the file is live at `/googlef5a07ed0f4e61975.html`), then submit `sitemap.xml`. When the custom domain exists, add a **Domain property** (DNS) instead.
- [ ] **Vercel Web Analytics**: click Enable in the project's Analytics tab (code is in place). It goes away when hosting moves to Cloudflare.
- [ ] **Domain**: do the SERP review for "text to voice" (pages 1–3: keyword domains? irrelevant results? Reddit/Quora on page 1?). Candidates that were available on 2026-10-27: **texttovoicefree.com** (recommended: "text to voice free" >1,000 and "free text to voice" >1,000), **texttovoiceapp.com** (only Easy keyword), voicetotextfree.com, voiceclonetool.com, clonevoicefree.com, voicestudiofree.com. Taken: freevoiceclone.com, freetexttovoice.com, texttovoiceai.com, aitexttovoice.com, texttovoicegenerator.com, texttovoiceonline.com, voiceclonefree.com, freevoicetotext.com.
- [ ] Give Claude: the GA4 Measurement ID (`G-…`), Ahrefs keyword + questions exports for es / pt / de / it, the chosen domain.
- [ ] Revoke old GitHub tokens that were pasted in chats; keep one fine-grained token with Contents read/write for `tusshr/voicecloner`.

## 1. Performance (next session, owner asked for this first)

Current state:
- Both models already run in Web Workers (`public/pocket-tts/inference-worker.js`, `public/whisper-worker.js`); inference never blocks the page.
- **Multithreading is off**: the TTS worker sets `ort.env.wasm.numThreads` to up to 8 only when `self.crossOriginIsolated`, and the site sends no COOP/COEP headers, so it runs on 1 thread. Whisper (transformers.js) is the same.
- Still on the main thread: recording via `ScriptProcessorNode` (stt-tool.tsx; voice-tool uses MediaRecorder), `timeStretch` / `applyGain` / `concat` / `limitPeak` in `lib/audio-fx.ts` during generate, `resampleTo16k`, `wavePeaks`.

Plan:
1. ✅ **Cross-origin isolation** (done 2026-10-28) to enable WASM threads: `Cross-Origin-Opener-Policy: same-origin` + `Cross-Origin-Embedder-Policy: credentialless` (Chrome/Edge/Firefox; Safari lacks `credentialless`, so it stays single-threaded — acceptable). Add to `vercel.json` headers and `public/_headers`. Check jsDelivr, Hugging Face, Google Fonts (self-hosted by next/font, fine) and later **AdSense / GA under COEP** — ads iframes can break with COEP; test before enabling ads, and consider isolating only the tool routes.
2. ✅ Verified `crossOriginIsolated === true` in both workers. Measurements 2026-10-28 (headless Chromium, 4-core Linux, other load on the machine; warm cache; TTS: ~11 s of speech cloned from `en/bill.mp3`; STT: all 8 English demos joined, 47 s; ×real time, higher is faster):

   | | Before (1 thread) | After |
   | --- | --- | --- |
   | TTS generate | 0.59–0.62× | 0.63–0.71× (2 threads; 0.88–0.91× in a quieter run) |
   | TTS first audio | 760–890 ms | 450–860 ms |
   | Whisper transcribe | 1.7–1.9× | 2.4–2.9× (library default: 2 threads) |

   TTS threads: 1 → 0.77×, 2 → 0.89×, 4 → 0.44–0.69× (same session), so it is capped at 2. Pocket TTS on this machine is **slower than real time**: a long script takes longer to make than to play. Re-measure on the owner's Android phone (8 cores) and an 8-core desktop; the cap may want to be 4 there. Re-run: `tools/bench.py` (Playwright drives both workers directly; needs `npm run preview`).
3. **WebGPU for Whisper**: built as opt-in only, `/voice-to-text?device=webgpu` (dtype `{ encoder_model: 'fp32', decoder_model_merged: 'q4' }`, falls back to wasm q8 if loading fails). 2026-10-28 on the test laptop (Intel UHD 620, headless Chromium + Vulkan): the model loads in 7 s, but a 5 s clip **did not finish in 5 minutes**, with a q4 or an fp32 decoder (wasm: ~2 s). Not safe as a default. Next: owner opens `?device=webgpu` on the Android phone and an 8-core desktop with a real GPU, transcribes a clip, and reports the time. Make it the default only where it is clearly faster, and add a timeout that falls back to wasm.
4. Move recording in voice to text from `ScriptProcessorNode` to an **AudioWorklet** (main-thread jank and deprecation).
5. Move audio post-processing (`timeStretch`, gain, fades, concat, peaks) into the TTS worker or a small DSP worker.
6. Optional: start the Whisper model download on Upload-button hover / page idle with low priority.

Test after: phone (Android Chrome) and desktop; first-load time, warm generation time, transcription speed (seconds of audio per second), no UI freezes while recording (Performance panel), memory.

## 2. Cactus Whistle evaluation (voice to text)

**Researched 2026-10-28: not now.** A browser build exists (official `needle.wasm` + `needle.js`, 930 KB, single-threaded; community npm packages `cactus-needle@0.3.0` (Apache-2.0) and `@tiny-stt/whistle`; a community ONNX export `mrfakename/whistle-ONNX`, 72–145 MB). Blockers: **no Portuguese** (two engines, or a pt fine-tune we'd have to make), 30 s per call (we'd chunk), and the accuracy gain is vendor-reported only: independent tests show a small English edge (Big Iron: 4.75 vs 6.03 % WER on LibriSpeech clean) and **no independent non-English numbers**; vendor's own MLS average has Whisper base ahead. Revisit if a pt version appears or if Whisper is too slow on phones; then A/B on our own es/de/it clips first.


Facts (2026-10): 16.9 MB, Apache-2.0, released 2026-10-02 by Cactus Compute; languages en, de, fr, es, it, nl, pl — **no Portuguese**; 16 kHz mono, 30 s windows; word timestamps; keyword biasing; runs on the Needle C++ engine (`.cact` files), lists WebAssembly among 17 platforms; company-reported WER beats Whisper base; users report weaker results for natural non-English speech.

Steps:
1. Feasibility: is there a WebAssembly build with a JavaScript API usable in a worker? (GitHub: Cactus-Compute; Hugging Face: Cactus-Compute/whistle.)
2. If yes, A/B against Whisper base on the same clips in 5 languages (our demos + a few real phone recordings): accuracy, speed, first-download time.
3. If it wins: Whistle for en/es/de/it, Whisper for pt (users only notice the faster start). Bonus: fr, nl, pl could be added to voice to text.

## 3. Hosting and launch readiness (before ads)

- [ ] Move to **Cloudflare Pages** (static `out/`; `_headers` already has the pages.dev noindex). Re-add the Search Console file route (Cloudflare serves `/x.html` as `/x` with a redirect; use a Domain property instead).
- [ ] Custom domain → `NEXT_PUBLIC_SITE_URL`, redirect vercel.app and pages.dev, noindex both (rule 12 of the checklist).
- [ ] Cloudflare Email Routing: hello@ / legal@ → owner's inbox; set `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_LEGAL_EMAIL` (today the site shows `hello@freevoiceclone.vercel.app`, which cannot receive mail).
- [ ] Google Analytics (`NEXT_PUBLIC_GA_ID`; consent banner already built). Remove `@vercel/analytics`.
- [ ] AdSense application (needs the custom domain, ads.txt at the root, privacy page mentions ads/cookies).

## 4. SEO content

- [ ] Voice to text article: **458 words → 800–1,200** (owner's rule), all 5 languages. Use Easy keywords: voice to text app, voice to text iPhone/Android, Google Docs, best voice to text app.
- [ ] Mine Google "People also ask" for both tools (pages 2–3, or prefix with "what") and add relevant FAQs.
- [ ] Per-language keyword pass when the owner sends Ahrefs exports.
- [ ] Decide on brand-name FAQs ("YouTube", "Google Docs"): currently kept (they are platforms, not competitors).

### AEO / GEO (answer engines: ChatGPT search, Perplexity, Google AI Overviews, Claude)

Already in place (checked 2026-10-28): article and FAQ are in the server HTML (no JS needed to read them); JSON-LD WebApplication + WebSite + FAQPage on both tools; robots.txt allows every crawler (GPTBot, ClaudeBot, PerplexityBot, Google-Extended included); sitemap with hreflang in 5 languages; fast pages (PageSpeed 97–100).

To do, most useful first:
- [ ] **Bing Webmaster Tools** (import from Search Console) + submit the sitemap. ChatGPT search and Copilot use Bing's index; not being in Bing means not being cited there.
- [ ] **IndexNow** ping on deploy (Bing, Yandex; a key file in `public/` + one request after each release).
- [ ] **Answer-first sections**: each H2 starts with a one-sentence direct answer (engines quote the first sentence). Same for FAQ answers (already short).
- [ ] **Entity facts**: Organization JSON-LD (name, logo, sameAs once social profiles exist), "last updated" date on the articles, an About page that says who makes it and why (trust signals).
- [ ] Optional: `llms.txt` (a short Markdown map of the site). Few engines use it today; cheap to add.
- [ ] Off-site (owner): mentions on Reddit / Quora / tool directories (There's An AI For That, Product Hunt, AlternativeTo). Answer engines cite sites that other sites talk about; this matters more than any on-page change.

## 5. Features (after the above)

0. **Emotions for sample voices** (owner asked 2026-10-28). Today mood clips belong to the user, not to the selected voice: with a sample voice selected, an emotion tag either falls back to the sample voice (no clip) or, if the user recorded that mood, speaks in the *user's* voice (mismatch). Steps: (a) quick fix: show "Record a mood" only when the base is the user's own voice, and say that emotions need your own voice; (b) find emotional recordings of one speaker per voice with a commercial-friendly license (CC0 / CC BY) and bundle them as per-preset moods (Pocket TTS has no emotion control; a mood = a clip in that mood). Kyutai Expresso is CC BY-NC (not usable). Alba MacKenna's casual / announcer / merchant / gentle clips are styles, not emotions; at most "gentle" could stand in for calm.
   - **Not doing: celebrity presets** (Trump etc.). Cloning a real person without consent breaks right-of-publicity and deepfake laws in many places, Kyutai's terms forbid impersonation, and ad networks ban it. Real risk to the site; no upside worth it.

1. Export for sharing: small files (OGG/Opus for WhatsApp voice notes, M4A), **captioned video** (waveform + highlighted words, MP4 for Reels/TikTok/Status — nobody free does this), subtitles for text to voice takes.
2. Voice cleaner (third tool): open-source denoiser vs. Desert Ant Labs Clear; "clean before cloning" option.
3. Multi-speaker dialogue (`[Alba]: … [Bill]: …`).
4. Longer texts (chunked), pronunciation dictionary.
5. Retry the missing demo `es/alba-merchant.mp3` (`python3 tools/make-demos.py es`, check with a transcription).
6. Kokoro 82M as an instant multi-voice TTS engine (more voices/languages), Pocket TTS only for cloning.

## Test checklist (run on every UI release)

- Phones 360 and 390 px, light + dark: no sideways scroll (with the fake share script), action bar never moves, drawers keep height, recording stops when the drawer closes.
- Text to voice: demo plays without model download; generate with default voice; effect chip wraps a selection; `[happy:` → `[😊:`; generations play and load text; word highlight; menu share/download.
- Voice to text: record (fake mic) → live text → stop → transcript; upload a real clip with the real model; copy, .txt, .srt, Read aloud lands in text to voice with the text.
- All 5 languages render (titles, H1, hreflang, footer version).
- Live site after deploy: robots `Allow`, canonical, sitemap includes `/voice-to-text` in 5 languages.
