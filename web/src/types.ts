export type LanguageItemStyle = 'bubble-left' | 'bubble-right'

export type ImageElement = {
  type: 'image'
  imageUrl: string
}

export type TranslationsElement = {
  type: 'translations'
  translations: Record<string, string>
}

export type EnglishElement = {
  type: 'english'
  text: string
  audioUrl: string | null
}

export type LanguageElement = ImageElement | TranslationsElement | EnglishElement

export type LanguageItem = {
  id: string
  style: LanguageItemStyle | null
  elements: LanguageElement[]
  found: boolean
}

export type ContentResponse = {
  items: LanguageItem[]
}

export function isBubbleStyle(style: string | null): style is LanguageItemStyle {
  return style === 'bubble-left' || style === 'bubble-right'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function parseElement(raw: unknown): LanguageElement | null {
  if (!isRecord(raw) || typeof raw.type !== 'string') {
    return null
  }

  if (raw.type === 'image' && typeof raw.imageUrl === 'string' && raw.imageUrl) {
    return { type: 'image', imageUrl: raw.imageUrl }
  }

  if (raw.type === 'translations' && isRecord(raw.translations)) {
    const translations: Record<string, string> = {}
    for (const [tag, text] of Object.entries(raw.translations)) {
      if (typeof text === 'string' && tag.trim() && text.trim()) {
        translations[tag] = text
      }
    }
    if (Object.keys(translations).length === 0) {
      return null
    }
    return { type: 'translations', translations }
  }

  if (raw.type === 'english' && typeof raw.text === 'string' && raw.text.trim()) {
    const audioUrl =
      typeof raw.audioUrl === 'string' && raw.audioUrl ? raw.audioUrl : null
    return { type: 'english', text: raw.text, audioUrl }
  }

  return null
}

export function parseLanguageItem(raw: unknown): LanguageItem | null {
  if (!isRecord(raw) || typeof raw.id !== 'string' || !raw.id) {
    return null
  }

  const styleValue = typeof raw.style === 'string' ? raw.style : null
  const elements = Array.isArray(raw.elements)
    ? raw.elements.flatMap((element) => {
        const parsed = parseElement(element)
        return parsed ? [parsed] : []
      })
    : []

  return {
    id: raw.id,
    style: isBubbleStyle(styleValue) ? styleValue : null,
    elements,
    found: raw.found === true,
  }
}

