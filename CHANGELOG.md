# Changelog

All notable changes to this project are in this file.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

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
