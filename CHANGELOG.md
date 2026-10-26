# Changelog

All notable changes to this project are in this file.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Changed
- Result player: Share and Download WAV are in a ⋮ menu, so the waveform has room. Export formats will go in the same menu.

### Fixed
- Phones: the page (and the Voice drawer) could be wider than the screen when the browser can share files, because the player row did not fit. The waveform now shrinks to the space it has, and the page can no longer scroll sideways.
- The progress border had an extra white outline: our class name ("ring") was also a Tailwind utility. It is now "progress-ring", so only the running teal line shows.

### Changed
- Phones: the Voice panel is a Vaul drawer. Swipe the handle down, tap outside or push Done to close it. It has a fixed height, so switching tabs does not change its size, and it opens on the tab of the voice in use.
- Voice panel tabs: Voices (all sample voices in one list, no Show all voices button) and My voice (record or upload, then moods). The list scrolls with no scrollbar and fades at an edge where there is more; the fade uses scroll events, so it works in Firefox.
- Moods are for your own voice: the mood chips in the editor and the mood recorder appear after you add your voice.
- The result player is a voice-message style waveform (tap to seek). The read-along text box is removed.
- The Generate button has the running border again while it loads or generates. It keeps one size in every state.

### Fixed
- Closing the Voice panel while recording left the microphone on. Now a recording of 5 seconds or more is kept and a shorter one is dropped.

### Changed
- The Generate button keeps one size in every state (Generate, Loading 45%, Stop, Retry), so the action bar never moves. Progress fills the button with a lighter shade of its own color. The full status ("Preparing the model: 45%") is in its tooltip and screen-reader label.
- Voice sheet: a "Voice" title with Done, and a full-width Voices / Moods switch below it.
- Phones and tablets: the tool works like an app. An action bar at the bottom (in thumb reach) shows the voice and the Generate button. Tap the voice to open the Voice panel as a bottom sheet (grip, Done, tap outside or Escape to close). Picking a sample voice closes the sheet. Controls are at least 44 px high, and text is larger. The text card has no title bar.
- Voice panel: Voices and Moods are tabs instead of a tall Moods section. The Moods tab shows how many moods are recorded. On desktop the panel no longer grows.
- The warning about missing mood clips has a link that opens the Moods tab at the right mood.

### Added
- Voice demos: every sample voice reads one line in each of the five languages (39 short MP3 files in public/demos, about 1.5 MB in total). The play button on a sample voice plays its demo in the speech language, and the empty result area has a Hear a demo button. Demos show with the read-along. People can hear the voices before the model downloads. The Spanish demo for Alba (merchant) is missing for now, so that voice plays its original recording. tools/make-demos.py makes the demos again.
- Read-along: the newest take shows its text, and the words light up while it plays. Spoken words are in full color, the current word is marked, and the rest is dimmed. Click a sentence to play from there. The tool now speaks each sentence on its own and keeps its start and end times. Inside a sentence the word position is an estimate.
- Emotion chips: the mood chips in the editor show an emoji (😊 Happy, 😢 Sad, 🤩 Excited, 😌 Calm, 🤫 Whisper) and insert tags such as [😊 happy]. Each mood has its own color in the text. The parser ignores emoji, so [happy] still works. The mood pills in the Voice panel show the same emoji.
- Text to voice: you can type text and push Generate without a voice of your own. The first sample voice (Alba, casual) is the default.
- Speech language menu in the Text panel. The voice can speak English, Spanish, Portuguese, German or Italian, whatever the page language is. The example script and the read-aloud texts follow the selected language. Each language loads its own model the first time it is used. The choice is kept per page language.
- Generate loads the model if it is not ready, then generates. The model also starts to load when you click into the text field.
- A new home page section about text to voice, in all five languages.

### Changed
- New interface: neutral colors, Inter only (Fraunces is removed), smaller controls, hairline borders and one teal accent for audio.
- One screen instead of two steps. The Text panel (script, Generate, result) and the Voice panel (clone, sample voices, moods) are side by side on desktop and stacked on phones. The Continue button and the step switch are removed.
- Headline, page titles and descriptions now target text to voice and voice cloning, in all five languages.
- Desktop: the article and the FAQ use two columns, and the footer uses one row.

### Fixed
- Dark mode: the options in the language menus were hard to read on phones. The menus and their options now use the theme colors.

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
