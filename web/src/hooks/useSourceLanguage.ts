import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  DEFAULT_SOURCE_LANGUAGE,
  readSourceLanguage,
  writeSourceLanguage,
} from '../i18n/sourceLanguage'

/**
 * URL `lang` wins and is persisted. Otherwise the stored choice is used for
 * display only. If neither is set, Arabic (`ar-001`) is used. This hook never
 * writes `lang` onto the URL.
 */
export function useSourceLanguage(): string {
  const [searchParams] = useSearchParams()
  const urlLang = searchParams.get('lang')?.trim() || null

  useEffect(() => {
    if (urlLang) {
      writeSourceLanguage(urlLang)
    }
  }, [urlLang])

  return urlLang ?? readSourceLanguage() ?? DEFAULT_SOURCE_LANGUAGE
}
