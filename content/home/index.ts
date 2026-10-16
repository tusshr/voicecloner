import type { Locale } from '@/lib/i18n'
import type { HomeContent } from './types'
import { de } from './de'
import { en } from './en'
import { es } from './es'
import { it } from './it'
import { pt } from './pt'

export const HOME: Record<Locale, HomeContent> = { en, es, pt, de, it }
