# Vocalis

A free voice clone tool. It operates fully in the browser with Pocket TTS.

## Commands

```bash
npm install
npm run dev     # local server at http://localhost:3000
npm run build   # static site in out/
```

## Before launch

Set these environment variables in your host:

| Variable | Example | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://voiceclonetool.com` | Canonical URLs, sitemap, email addresses |
| `NEXT_PUBLIC_INDEXABLE` | `true` | Lets search engines index the site |
| `NEXT_PUBLIC_GA_ID` | `G-XXXXXXX` | Google Analytics (optional) |

## Where to change things

| To change | Edit |
| --- | --- |
| Site name, URL, emails, policy date | `lib/site.ts` |
| Languages and URL prefixes | `lib/i18n.ts` |
| Tool text (buttons, errors) | `content/ui.ts` |
| Homepage text and FAQ | `content/home/<lang>.ts` |
| About, Contact, 404 and footer text | `content/pages.ts` |
| Privacy and Terms | `content/legal.ts` |
| Sample voices | `lib/voices.ts` |
| Styles | `app/globals.css` |

Routes: `app/(en)` has the English pages at the root. `app/(intl)/[lang]` has the same pages for the other languages.

## Versions

The project uses [Semantic Versioning](https://semver.org/). Record each change in `CHANGELOG.md`.
