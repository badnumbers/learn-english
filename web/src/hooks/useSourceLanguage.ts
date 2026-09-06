import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { readSourceLanguage, writeSourceLanguage } from '../i18n/sourceLanguage'

/**
 * URL `lang` wins and is persisted. Otherwise the stored choice is used for
 * display only — this hook never writes `lang` onto the URL.
 */
export function useSourceLanguage(): string | null {
  const [searchParams] = useSearchParams()
  const urlLang = searchParams.get('lang')?.trim() || null

  useEffect(() => {
    if (urlLang) {
      writeSourceLanguage(urlLang)
    }
  }, [urlLang])

  return urlLang ?? readSourceLanguage()
}
