import { lettersFromAfar, lettersFromAfarEn } from './lettersFromAfar'
import type { Locale, StoryCartridge } from '../types'

export const DEFAULT_CARTRIDGE_ID = 'letters-from-afar'
export const CARTRIDGES: Record<string, StoryCartridge> = { 'letters-from-afar': lettersFromAfar }
export const CARTRIDGES_EN: Record<string, StoryCartridge> = { 'letters-from-afar': lettersFromAfarEn }
export function listCartridges(locale: Locale): StoryCartridge[] { return [locale === 'en' ? lettersFromAfarEn : lettersFromAfar] }
export function resolveCartridge(_id: string | null | undefined, locale: Locale = 'zh'): StoryCartridge { return locale === 'en' ? lettersFromAfarEn : lettersFromAfar }
