const STORAGE_KEY = 'learn-english.lang'

export const DEFAULT_SOURCE_LANGUAGE = 'ar-001'

export function readSourceLanguage(): string | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY)?.trim()
    return value ? value : null
  } catch {
    return null
  }
}

export function writeSourceLanguage(tag: string): void {
  const value = tag.trim()
  if (!value) {
    return
  }

  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {
    /* ignore quota / private mode */
  }
}
