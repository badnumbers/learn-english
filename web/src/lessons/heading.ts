import { pickTranslation } from '../i18n/translations'
import type { LanguageItem } from '../types'

export type LessonHeading = {
  english: string
  l1: string | null
}

export function headingFromItem(
  item: LanguageItem | null,
  lang: string,
  fallback: string,
): LessonHeading {
  if (!item) {
    return { english: fallback, l1: null }
  }

  const english = item.elements.find((element) => element.type === 'english')
  const translations = item.elements.find(
    (element) => element.type === 'translations',
  )
  const l1 =
    translations?.type === 'translations'
      ? pickTranslation(translations.translations, lang)
      : null

  return {
    english:
      english?.type === 'english' && english.text.trim()
        ? english.text
        : fallback,
    l1,
  }
}
