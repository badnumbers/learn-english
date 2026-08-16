function primaryLanguage(tag: string): string {
  const primary = tag.trim().split('-')[0]
  return primary?.toLowerCase() ?? ''
}

function isWorldRegion(tag: string): boolean {
  const parts = tag.trim().toLowerCase().split('-')
  return parts.includes('001')
}

/**
 * Pick a translation for a requested BCP 47 tag.
 * Exact match first, then the same primary language (preferring the UN M.49
 * world region `001`, e.g. `ar-001`).
 */
export function pickTranslation(
  translations: Record<string, string>,
  requested: string,
): string | null {
  const want = requested.trim()
  if (!want) {
    return null
  }

  const entries = Object.entries(translations).filter(
    ([tag, text]) => tag.trim() && text.trim(),
  )
  if (entries.length === 0) {
    return null
  }

  const exact = entries.find(
    ([tag]) => tag.toLowerCase() === want.toLowerCase(),
  )
  if (exact) {
    return exact[1]
  }

  const prefix = primaryLanguage(want)
  if (!prefix) {
    return null
  }

  const sameLanguage = entries.filter(
    ([tag]) => primaryLanguage(tag) === prefix,
  )
  if (sameLanguage.length === 0) {
    return null
  }

  const world = sameLanguage.find(([tag]) => isWorldRegion(tag))
  return (world ?? sameLanguage[0])[1]
}

export function cueTexts(
  translations: Record<string, string> | null,
  lang: string | null,
): string[] {
  if (!translations) {
    return []
  }

  if (lang?.trim()) {
    const picked = pickTranslation(translations, lang)
    return picked ? [picked] : []
  }

  return [...new Set(Object.values(translations).filter((text) => text.trim()))]
}
