import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fetchVocab } from '../api/vocab'
import { VocabCard } from '../components/VocabCard'
import { useSourceLanguage } from '../hooks/useSourceLanguage'
import type { VocabItem } from '../types'

export function VocabPage() {
  const [searchParams] = useSearchParams()
  const wordsQuery = searchParams.get('w') ?? ''
  const lang = useSourceLanguage()
  const [items, setItems] = useState<VocabItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!wordsQuery.trim()) {
      setItems([])
      setError(null)
      return
    }

    const controller = new AbortController()
    setItems(null)
    setError(null)

    fetchVocab(wordsQuery, controller.signal)
      .then((data) => {
        setItems(data.items)
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return
        }
        setError('Could not load this vocabulary list.')
        setItems([])
      })

    return () => controller.abort()
  }, [wordsQuery])

  if (!wordsQuery.trim()) {
    return (
      <section className="page">
        <h1>Vocabulary</h1>
        <p>
          Add words to the link with <code>?w=apple,run</code>.
        </p>
      </section>
    )
  }

  return (
    <section className="page">
      <h1>Vocabulary</h1>
      {error ? <p className="status status--error">{error}</p> : null}
      {items === null ? <p className="status">Loading…</p> : null}
      {items && items.length > 0 ? (
        <ol className="vocab-list">
          {items.map((item) => (
            <li key={item.id}>
              <VocabCard item={item} lang={lang} />
            </li>
          ))}
        </ol>
      ) : null}
      {items && items.length === 0 && !error ? (
        <p className="status">No words in this list.</p>
      ) : null}
    </section>
  )
}
