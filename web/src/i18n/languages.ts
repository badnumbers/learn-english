import { primaryLanguage } from './translations'

export type SourceLanguage = {
  tag: string
  nativeName: string
  englishName: string
}

export const SOURCE_LANGUAGES: readonly SourceLanguage[] = [
  { tag: 'am-ET', nativeName: 'አማርኛ', englishName: 'Amharic' },
  { tag: 'ar-001', nativeName: 'العربية', englishName: 'Arabic' },
  { tag: 'my-MM', nativeName: 'မြန်မာ', englishName: 'Burmese' },
  { tag: 'ps-Arab-AF', nativeName: 'پښتو', englishName: 'Pashto' },
  { tag: 'fa-IR', nativeName: 'فارسی', englishName: 'Persian' },
  { tag: 'pt-BR', nativeName: 'Português', englishName: 'Portuguese' },
  { tag: 'so-001', nativeName: 'Soomaali', englishName: 'Somali' },
  { tag: 'es-419', nativeName: 'Español', englishName: 'Spanish' },
  { tag: 'ti-ER', nativeName: 'ትግርኛ', englishName: 'Tigrinya' },
  { tag: 'tr-TR', nativeName: 'Türkçe', englishName: 'Turkish' },
  { tag: 'uk-UA', nativeName: 'Українська', englishName: 'Ukrainian' },
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
