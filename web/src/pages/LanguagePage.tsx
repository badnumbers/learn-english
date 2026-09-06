import { useLocation, useNavigate } from 'react-router-dom'
import { useSourceLanguage } from '../hooks/useSourceLanguage'
import { matchingLanguage, SOURCE_LANGUAGES } from '../i18n/languages'
import { writeSourceLanguage } from '../i18n/sourceLanguage'

export type LanguagePageState = {
  from?: {
    pathname: string
    search: string
  }
}

export function LanguagePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const current = useSourceLanguage()
  const selected = matchingLanguage(current)

  function choose(tag: string) {
    writeSourceLanguage(tag)
    const from = (location.state as LanguagePageState | null)?.from
    if (!from) {
      navigate('/')
      return
    }

    const params = new URLSearchParams(from.search)
    if (params.has('lang')) {
      params.set('lang', tag)
    }
    const search = params.toString()
    navigate({
      pathname: from.pathname,
      search: search ? `?${search}` : '',
    })
  }

  return (
    <section className="page page--language">
      <h1>Language</h1>
      <ul className="language-list">
        {SOURCE_LANGUAGES.map((language) => {
          const isSelected = selected?.tag === language.tag
          return (
            <li key={language.tag}>
              <button
                type="button"
                className={
                  isSelected
                    ? 'language-option language-option--selected'
                    : 'language-option'
                }
                aria-pressed={isSelected}
                onClick={() => choose(language.tag)}
              >
                <span dir="auto">{language.nativeName}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
