import { primaryLanguage } from './translations'

export type SourceLanguage = {
  tag: string
  nativeName: string
}

export const SOURCE_LANGUAGES: readonly SourceLanguage[] = [
  { tag: 'ar-001', nativeName: 'العربية' },
  { tag: 'fa-IR', nativeName: 'فارسی' },
  { tag: 'ps-Arab-AF', nativeName: 'پښتو' },
]

export function matchingLanguage(tag: string | null): SourceLanguage | null {
  const want = tag?.trim()
  if (!want) {
    return null
  }

  const exact = SOURCE_LANGUAGES.find(
    (language) => language.tag.toLowerCase() === want.toLowerCase(),
  )
  if (exact) {
    return exact
  }

  const prefix = primaryLanguage(want)
  if (!prefix) {
    return null
  }

  return (
    SOURCE_LANGUAGES.find((language) => primaryLanguage(language.tag) === prefix) ??
    null
  )
}
