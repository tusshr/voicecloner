# Release checklist (owner's process for every tool)

The owner's playbook, written as rules, with Vocalis's status on 2026-10-27. Apply the same list to every new tool.

## The rules

1. **Validate the idea first** (a domain costs money). Read Reddit and Quora threads about the problem; note pains and requests.
2. **Keyword and SERP research.**
   - Find the term people actually search (example: "online ruler", not "online scale") with Ahrefs or a similar tool.
   - Review results pages 1–3: is each tool good? Can we build better? List every competitor's flaws, to fix in ours.
   - Check competitor domains: is the keyword in the domain? Is it .com? Good signs: top results without the keyword in the domain; irrelevant results on pages 2–3 (app store links, pages without the tool); Reddit or Quora on page 1; subdomain sites ranking on page 2.
   - Check a beatable competitor's traffic and keywords in Ahrefs.
   - Note new feature ideas found while researching (example: font finder → also extract fonts from PDFs).
   - Domain: **.com only**, contains the primary keyword, short, no hyphens, easy to spell.
3. **Build first, then buy the domain.** Mobile first, i18n.
4. **Stack:** plain HTML/JS if simple, then Astro, then Next.js. Hosting: Cloudflare (static, unlimited), or a small VPS (2 cores, 4 GB). Design: Tailwind or plain CSS; inspiration from getdesigns.md.
5. **On-page SEO:** supporting keywords from Ahrefs' keyword generator (never ones with a competitor's site name, like "canva font finder"); **800–1,200 words** about the tool on the home page.
6. **FAQ with JSON-LD.** Questions from Ahrefs' Questions tab and Google's "People also ask" (pages 2–3; prefix "what …"; expanding a question reveals more).
7. **Identity:** logo and icon (or logofa.st).
8. **Legal:** About, Contact, Terms, Privacy.
9. **Fallbacks:** 404 and 500 pages.
10. **Crawlers:** robots.txt and sitemap.
11. **Analytics:** Google Analytics.
12. **Duplicates:** noindex the pages.dev / workers.dev copy with `_headers`.
13. **Contact email:** Cloudflare Email Routing (hello@, contact@, legal@).

## Vocalis status

| # | Status | Notes |
| --- | --- | --- |
| 1 | Partial | Ahrefs data and competitor scan done; Reddit/Quora not read yet. |
| 2 | Open | SERP pages 1–3 review not done; domain not bought. Candidates in ROADMAP §0. Current domain `freevoiceclone.vercel.app` lacks the main keyword ("text to voice"). |
| 3 | Done | Mobile first; en, es, pt, de, it. |
| 4 | Partial | Next.js static export (fine). Hosting on Vercel (Hobby = non-commercial) → move to Cloudflare Pages before ads. |
| 5 | Partial | Home article ~1,300 words ✅; voice to text article 458 words ❌; supporting keywords from the owner's Ahrefs screenshots (English only). |
| 6 | Partial | FAQ + FAQPage JSON-LD on both tools; "People also ask" not mined yet. |
| 7 | Done | Gradient wordmark mark, favicon, app icons, OG image, install screenshots. |
| 8 | Done | About, Contact (5 langs), Privacy, Terms (English, linked from all). |
| 9 | Done | `global-not-found.tsx`, `global-error.tsx`, per-route error pages. |
| 10 | Done | Live: robots `Allow: /`, sitemap with hreflang alternates. |
| 11 | Open | GA supported (`NEXT_PUBLIC_GA_ID`, consent banner) but no ID yet; Vercel Analytics in place meanwhile. |
| 12 | Partial | `_headers` noindexes `*.pages.dev`; add vercel.app handling when the custom domain is live. |
| 13 | Open | Needs the custom domain on Cloudflare; site currently shows non-working `@freevoiceclone.vercel.app` addresses. |
