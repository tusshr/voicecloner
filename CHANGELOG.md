# Changelog

All notable changes to this project are in this file.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

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
