# Changelog

All notable changes to this project are in this file.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- Project docs for new sessions: `CLAUDE.md` (project memory), `docs/PRD.md`, `docs/DESIGN.md`, `docs/ROADMAP.md` (next steps and tests: performance, Cactus Whistle, hosting, SEO) and `docs/RELEASE-CHECKLIST.md`.
- Page transitions: links between pages of the same language (tool switch, wordmark, footer, Read aloud) now open without a page reload. The page cross-fades under a header that stays still, and on the Text to voice / Voice to text switch the highlight slides to the other tool. Reduced motion turns the animation off.
- About and contact show the wordmark logo mark, like the tool pages, so the header looks the same on every page.
- Voice to text: a rail under the text, like the effects row in text to voice: ＋ New transcript (clears the text box to start fresh; saved transcripts stay), Copy, Read aloud, .txt and .srt. The downloads are chips now instead of a ⋮ menu.
- Error boundary around each tool: if the tool crashes, the header, article and footer stay, with a Try again button that restarts only the tool (5 languages, works offline).

### Changed
- Text to voice: the ↺ reset button moved from the card head into the effects row; it is always there and disabled while the text is the example, so nothing shifts.
- Footer: logo and Install app on top, all links in one row, then credits, languages and the version as small print.
- The script text in text to voice is 17 px, like voice to text, and the voice to text text box no longer has extra side padding (both start at the same edge, with the action buttons under them).
- Voice to text no longer shows the first-use download note under the stage.
- Portuguese demo button: "Ouvir demo" (shorter, fits on phones).
- Pages for es / pt / de / it no longer await their route params (they use `params.then()`), so the page shell stays synchronous.
- Desktop: the workbench is narrower (1080 px page, about 1016 px workbench), so the editor reads at about 72 characters per line and lines up better with the 720 px article column.
- Next.js 16.4.0 → 16.4.3 (security advisory).
- Smaller first page load (compressed JavaScript): home 207 → 182 KB, voice to text 207 → 160 KB. Each tool page now has its own module (`components/home-page.tsx`, `components/stt-page.tsx`), so it no longer ships the other tool. The phone drawer library (Vaul) loads after the page, and only on phones (`components/sheet.tsx`). Voice to text gets its interface text as a prop instead of bundling the articles of all five languages; tool names and error texts moved to small `content/tools.ts` and `content/errors.ts`.
- `npm run preview` serves the build with clean URLs like Vercel (`serve`); plain `python3 -m http.server` breaks client navigation.

### Fixed
- The language menu no longer moves when you switch between the two tools: the reset button in the card head was taller than the menu and made the head grow; the head now holds only the menu and one button.
- Phones at 360 px: the card head buttons no longer overlap in Spanish, Portuguese, German and Italian (the head now holds only the language menu and one button).
- The Copy button keeps its width when it shows Copied.
- Phones: the page no longer jumps up about 250 px after loading (the server-rendered voice panel is hidden on phones from the first paint). This layout shift (CLS 0.19) cost about 10 Lighthouse points on mobile.
- Text contrast meets WCAG AA (Lighthouse accessibility 100): `--muted` is a little darker in light mode (#6b6b74), and small teal text uses the new `--accent-ink` (#0f766e).
- Voice to text releases the microphone when you leave the page while recording (needed now that pages change without a reload).

## [1.0.0] - 2026-10-27

First stable release: indexing is on, and the site is a small voice studio with text to voice, voice cloning and voice to text.

### Added
- Voice to text (`/voice-to-text`, in all five languages): record or upload audio and Whisper base (OpenAI, MIT license) writes it down in the browser with transformers.js. Text appears while you speak, and the full transcript is ready when you stop. Copy it, download it as text (.txt) or subtitles (.srt), or push Read aloud to send it to text to voice. Your transcripts are kept in this browser. The page has its own title, description, article, FAQ and structured data aimed at voice to text searches.
- A Text to voice / Voice to text switch in the header (desktop) or under it (phones), and links to both tools in the footer.
- The version number in the footer (from package.json, through NEXT_PUBLIC_APP_VERSION).
- Google Search Console verification file.
- Vercel Web Analytics (cookieless page views; no consent banner needed). Google Analytics still loads, with its consent banner, when NEXT_PUBLIC_GA_ID is set.
- Structured data: WebSite, and a richer WebApplication (alternate name, languages, image, screenshot, features) next to the FAQPage.
- Scoped effects: [😊: text], [slow: text] and combinations such as [😊, slow: text] apply to the text inside the brackets only, and the editor tints the whole span. Mood words in any page language ([happy: …], [feliz: …], [fröhlich: …]) turn into the emoji when you type the colon. Scripts in the older style ([slow] … [normal]) still work.
- Effect picker: the sliders button next to the chips opens a drawer with every effect (emotions with a short description, delivery with its syntax, pauses of 0.5 to 3 s). With text selected, an effect wraps the selection; without, it is inserted at the cursor with the caret inside.
- Your generations: every take is a card below the text card, with a compact player, the text, the voice and when it was made. Playing one loads it in the stage and puts its text in the editor; if that would replace text you typed, the tool asks first.
- Voice demos: every sample voice reads one line in each of the five languages (39 short MP3 files in public/demos, about 1.5 MB in total). The play button on a sample voice plays its demo in the speech language, and the empty result area has a Hear a demo button. Demos show with the read-along. People can hear the voices before the model downloads. The Spanish demo for Alba (merchant) is missing for now, so that voice plays its original recording. tools/make-demos.py makes the demos again.
- Read-along: the newest take shows its text, and the words light up while it plays. Spoken words are in full color, the current word is marked, and the rest is dimmed. Click a sentence to play from there. The tool now speaks each sentence on its own and keeps its start and end times. Inside a sentence the word position is an estimate.
- Emotion chips: the mood chips in the editor show an emoji (😊 Happy, 😢 Sad, 🤩 Excited, 😌 Calm, 🤫 Whisper) and insert tags such as [😊 happy]. Each mood has its own color in the text. The parser ignores emoji, so [happy] still works. The mood pills in the Voice panel show the same emoji.
- Text to voice: you can type text and push Generate without a voice of your own. The first sample voice (Alba, casual) is the default.
- Speech language menu in the Text panel. The voice can speak English, Spanish, Portuguese, German or Italian, whatever the page language is. The example script and the read-aloud texts follow the selected language. Each language loads its own model the first time it is used. The choice is kept per page language.
- Generate loads the model if it is not ready, then generates. The model also starts to load when you click into the text field.
- A new home page section about text to voice, in all five languages.

### Changed
- The header is sticky: a full-width frosted bar (blurred, translucent page color, hairline border) on every page.
- Reset example is a small ↺ button next to the language menu, shown only when the text differs from the example. The effects row sits at the bottom of the text card again.
- Desktop: the effect picker is a popover above the effects row (it closes on Escape or a click outside). Phones keep the drawer.
- On-page SEO in all five languages, aimed at "text to voice" and "voice clone" searches: new page titles (under 60 characters) and descriptions (under 160), H1, subtitle, the first three H2s (text to voice generator, voice clone, how to clone your voice with AI for free), text to voice now comes first, a sentence about the installable app, and three new FAQ answers (is it free, is there an app for my phone, how to clone someone else's voice, with permission).
- Production domain: https://freevoiceclone.vercel.app, and indexing is on (NEXT_PUBLIC_SITE_URL and NEXT_PUBLIC_INDEXABLE in Vercel). Before this, every page said noindex and robots.txt blocked all crawlers.
- The tool is first: the title and subtitle moved from above the tool to the start of the article below it (still the page's H1). The article is one centered reading column (720 px) with larger text, like a long-form guide.
- Install app moved from the header to the footer, beside the credits. It still appears only where the browser can install the app (or shows the iPhone how-to).
- Hear a demo keeps one width when it turns into Stop: both labels share one grid cell.
- Phones: a smaller title (21 px) and subtitle (14 px, two lines); the subtitle no longer mentions the browser. The language menu is on the left of the text card and Hear a demo on the right.
- The stage is the clean waveform of the first version again (soft color glow, no text, no buttons), a little shorter. It idles, works while generating and moves with whatever plays.
- The effect chips scroll sideways with an edge fade, beside the character count. Emotion chips are always shown, so people can find them.
- New link preview image (og.png) and install screenshots in the new design.
- Text panel order: the player strip (newest result, a demo, or the empty state with Hear a demo) is above the text, then the editor, then earlier takes. While generating, the strip shows the progress ("Speaking part 2 of 3") instead of a line that pushed the result down.
- Word highlight is back, in the editor itself: while the newest take plays, the word being heard is marked in your text. It turns off if you change the text after generating, because the audio no longer matches.
- Removed the demo explanation and the "runs in your browser" lines under the tool and in the footer.
- Result player: Share and Download WAV are in a ⋮ menu, so the waveform has room. Export formats will go in the same menu.
- Phones: the Voice panel is a Vaul drawer. Swipe the handle down, tap outside or push Done to close it. It has a fixed height, so switching tabs does not change its size, and it opens on the tab of the voice in use.
- Voice panel tabs: Voices (all sample voices in one list, no Show all voices button) and My voice (record or upload, then moods). The list scrolls with no scrollbar and fades at an edge where there is more; the fade uses scroll events, so it works in Firefox.
- Moods are for your own voice: the mood chips in the editor and the mood recorder appear after you add your voice.
- The result player is a voice-message style waveform (tap to seek). The read-along text box is removed.
- The Generate button has the running border again while it loads or generates. It keeps one size in every state.
- The Generate button keeps one size in every state (Generate, Loading 45%, Stop, Retry), so the action bar never moves. Progress fills the button with a lighter shade of its own color. The full status ("Preparing the model: 45%") is in its tooltip and screen-reader label.
- Voice sheet: a "Voice" title with Done, and a full-width Voices / Moods switch below it.
- Phones and tablets: the tool works like an app. An action bar at the bottom (in thumb reach) shows the voice and the Generate button. Tap the voice to open the Voice panel as a bottom sheet (grip, Done, tap outside or Escape to close). Picking a sample voice closes the sheet. Controls are at least 44 px high, and text is larger. The text card has no title bar.
- Voice panel: Voices and Moods are tabs instead of a tall Moods section. The Moods tab shows how many moods are recorded. On desktop the panel no longer grows.
- The warning about missing mood clips has a link that opens the Moods tab at the right mood.
- New interface: neutral colors, Inter only (Fraunces is removed), smaller controls, hairline borders and one teal accent for audio.
- One screen instead of two steps. The Text panel (script, Generate, result) and the Voice panel (clone, sample voices, moods) are side by side on desktop and stacked on phones. The Continue button and the step switch are removed.
- Headline, page titles and descriptions now target text to voice and voice cloning, in all five languages.
- Desktop: the article and the FAQ use two columns, and the footer uses one row.

### Fixed
- Desktop: the effect chips wrapped onto a second line. They now scroll in one row with the edge fade, as on phones.
- The waveform and the time ran ahead of the sound and finished early, mostly on phones and Bluetooth. Playback now follows the time the sound reaches the speaker, and a clip counts as playing until its end is heard.
- Phones: the page (and the Voice drawer) could be wider than the screen when the browser can share files, because the player row did not fit. The waveform now shrinks to the space it has, and the page can no longer scroll sideways.
- The progress border had an extra white outline: our class name ("ring") was also a Tailwind utility. It is now "progress-ring", so only the running teal line shows.
- Closing the Voice panel while recording left the microphone on. Now a recording of 5 seconds or more is kept and a shorter one is dropped.
- Dark mode: the options in the language menus were hard to read on phones. The menus and their options now use the theme colors.

### Notes
- Built-in emotions for the sample voices were planned from Kyutai's Expresso recordings, but those are licensed for non-commercial use only, so they are not used. Emotions use your recorded moods.

## [1.0.0-rc.3] - 2026-10-16

### Fixed
- The service worker served files without hashed names (the voice worker, icons) from its cache first. So fixes to those files did not reach people who visited before. Now only `/_next/static/` files are cache first. All other files are network first. The old cache is deleted.

## [1.0.0-rc.2] - 2026-10-16

### Fixed
- iPhone and iPad (Safari): the model did not load ("Maximum call stack size exceeded"). The tokenizer file was converted to Base64 in one function call with about 59,000 arguments. The conversion now uses small chunks.

## [1.0.0-rc.1] - 2026-10-16

Release candidate. The final 1.0.0 comes after the domain is live and indexing is on.

### Added
- Share button on the newest take (phones): sends the WAV file to other apps.
- Ctrl+Enter or Cmd+Enter in the script field generates.
- The script stays after a page reload (saved in the browser, per language).
- The installed app asks the browser to keep the model files.

### Changed
- The recording hint starts with a bold "Tip:".
- "Start again" asks for confirmation when you have your own recording or generated audio.
- Downloaded files have a name from the first words of the script, for example `voice-clone-hello-i-recorded-this.wav`.
- The newest take scrolls into view.

### Fixed
- Installed app on Android: the navigation bar and launch screen were light in dark mode. There are now two manifests (light and dark), and the page picks the one that matches the phone.
- Model download on slow or unstable connections: each file retries up to 5 times and continues from the last byte, not from the start.

## [0.6.1] - 2026-10-16

### Fixed
- Android showed a white navigation bar in dark mode. The page now draws edge-to-edge (`viewport-fit=cover`), so the bar takes the page color. Content stays clear of system bars with safe-area padding.

## [0.6.0] - 2026-10-16

### Added
- Install button in the header. In Chrome and Edge it opens the install dialog with the screenshots. On iPhone and iPad it tells you how to add the app to the home screen.

### Changed
- Progress shows as a border around the item that is busy, not as text in the waveform box. The voice card shows the model download. The Generate button shows the model download or the generation.
- The waveform box shows only recording and playback time.

## [0.5.0] - 2026-10-16

### Added
- Installable app (PWA): service worker, app ID, categories and iOS home screen support.
- Store-style screenshots in the install dialog: three for phones, one for desktop.
- The site opens without a connection after the first visit.

### Fixed
- Share previews (WhatsApp, X, Facebook) had no image. The image and canonical links used the old domain. Without `NEXT_PUBLIC_SITE_URL`, Vercel builds now use the project's production address.

## [0.4.0] - 2026-10-16

### Added
- Sample voices show as a list. Each voice has a play button to listen before you use it.
- The list shows four voices first. "Show all voices" shows the other four.

### Changed
- The recording hint is shorter. It does not mention the model download.
- The first four sample voices are four different speakers.

## [0.3.0] - 2026-10-16

### Added
- Language switcher in the header, with a globe icon. On phones it opens the native picker.

### Changed
- The script field grows with the text up to a maximum height, then it scrolls. You cannot resize it by hand.

## [0.2.1] - 2026-10-16

### Changed
- The voice model starts to download when you record, upload or select a sample voice. Before, it started only after you pushed Continue.
- The download progress shows on the Voice step too.
- The download size hint shows before the download starts.

### Fixed
- Text contrast for hints and footer links now meets WCAG AA (4.5:1).
- The hidden audio file input has an accessible label.
- The waveform no longer animates in at page load. This improves Speed Index.

## [0.2.0] - 2026-10-16

### Added
- Pages in five languages: English at `/`, and Spanish, Portuguese, German and Italian at `/es`, `/pt`, `/de` and `/it`.
- Each language page loads the Pocket TTS model for that language.
- Eight sample voices from speakers with open licenses (CC BY 4.0 and CC0).
- Homepage text and FAQ for each language, with FAQ and web app structured data.
- About and Contact pages in all languages. Privacy and Terms pages in English.
- `robots.txt`, `sitemap.xml` with language alternates, canonical and hreflang tags.
- Custom 404 page and error pages.
- New favicon set, web app manifest and social share image.
- Optional Google Analytics with a consent banner (set `NEXT_PUBLIC_GA_ID`).
- Cloudflare Pages `_headers` file: `noindex` on `*.pages.dev`, security headers, cache rules.

### Changed
- All English text follows ASD-STE100 writing rules. Other languages follow the same rules.
- The site builds as a static export (`out/`) for Cloudflare Pages or any static host.
- Search engines are blocked until `NEXT_PUBLIC_INDEXABLE=true`.

### Removed
- The public source download page (`/get-ed092989`).
- The demo voice. Sample voices replace it.
- Vercel Analytics.

## [0.1.0] - 2026-10-14

### Added
- First version: voice clone in the browser with Pocket TTS, moods, script tags and WAV download.
