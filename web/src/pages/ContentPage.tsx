import { useEffect, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { fetchContent } from '../api/content'
import { LanguageItem } from '../components/LanguageItem'
import { useSourceLanguage } from '../hooks/useSourceLanguage'
import type { LanguageItem as LanguageItemModel } from '../types'

export function ContentPage() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const isVocabAlias = location.pathname === '/vocab'
  const itemsQuery = isVocabAlias
    ? (searchParams.get('w') ?? '')
    : (searchParams.get('i') ?? '')
  const lang = useSourceLanguage()
  const [items, setItems] = useState<LanguageItemModel[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!itemsQuery.trim()) {
      setItems([])
      setError(null)
      return
    }

    const controller = new AbortController()
    setItems(null)
    setError(null)

    fetchContent(itemsQuery, controller.signal)
      .then((data) => {
        setItems(data.items)
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return
        }
        setError('Could not load this list.')
        setItems([])
      })

    return () => controller.abort()
  }, [itemsQuery])

  const title = isVocabAlias ? 'Vocabulary' : 'Study'
  const exampleQuery = isVocabAlias ? '?w=apple,run' : '?i=hat,shop-hello'

  if (!itemsQuery.trim()) {
    return (
      <section className="page">
        <h1>{title}</h1>
        <p>
          Add language items to the link with <code>{exampleQuery}</code>.
        </p>
      </section>
    )
  }

  return (
    <section className="page">
      <h1>{title}</h1>
      {error ? <p className="status status--error">{error}</p> : null}
      {items === null ? <p className="status">Loading…</p> : null}
      {items && items.length > 0 ? (
        <ol className="content-list">
          {items.map((item) => (
            <li key={item.id}>
              <LanguageItem item={item} lang={lang} />
            </li>
          ))}
        </ol>
      ) : null}
      {items && items.length === 0 && !error ? (
        <p className="status">No items in this list.</p>
      ) : null}
    </section>
  )
}
