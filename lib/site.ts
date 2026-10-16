// One place to change when the domain is ready.
// Set NEXT_PUBLIC_SITE_URL=https://yourdomain.com and NEXT_PUBLIC_INDEXABLE=true in production.
export const SITE_NAME = 'Vocalis'
// Without NEXT_PUBLIC_SITE_URL, Vercel builds use the project's production address, so share previews always work.
const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || (vercelHost ? `https://${vercelHost}` : 'http://localhost:3000')).replace(/\/$/, '')
export const INDEXABLE = process.env.NEXT_PUBLIC_INDEXABLE === 'true'
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || ''
const host = new URL(SITE_URL).hostname.replace(/^www\./, '')
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || `hello@${host}`
export const LEGAL_EMAIL = process.env.NEXT_PUBLIC_LEGAL_EMAIL || `legal@${host}`
export const UPDATED = 'October 16, 2026'
