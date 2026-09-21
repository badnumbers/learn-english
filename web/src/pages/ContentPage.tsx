import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fetchContent } from '../api/content'
import { LanguageItem } from '../components/LanguageItem'
import { PageHeading } from '../components/PageHeading'
import { useSourceLanguage } from '../hooks/useSourceLanguage'
import { headingFromItem } from '../lessons/heading'
import { normalizeItemIds, recordLesson } from '../lessons/storage'
import type { LanguageItem as LanguageItemModel } from '../types'

export function ContentPage() {
  const [searchParams] = useSearchParams()
  const itemsQuery = normalizeItemIds(searchParams.get('items') ?? '')
  const titleId = searchParams.get('title')?.trim() ?? ''
  const lang = useSourceLanguage()
  const [items, setItems] = useState<LanguageItemModel[] | null>(null)
  const [titleItem, setTitleItem] = useState<LanguageItemModel | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!itemsQuery) {
      setItems([])
      setTitleItem(null)
      setError(null)
      return
    }

    const controller = new AbortController()
    setItems(null)
    setTitleItem(null)
    setError(null)

    const itemsRequest = fetchContent(itemsQuery, controller.signal)
    const titleRequest = titleId
      ? fetchContent(titleId, controller.signal).catch(() => null)
      : Promise.resolve(null)

    Promise.all([itemsRequest, titleRequest])
      .then(([data, titleData]) => {
        setItems(data.items)
        const heading = titleData?.items[0] ?? null
        setTitleItem(heading?.id === titleId ? heading : null)
        if (titleId && data.items.length > 0) {
          recordLesson(titleId, itemsQuery)
        }
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return
        }
        setError('Could not load this list.')
        setItems([])
      })

    return () => controller.abort()
  }, [itemsQuery, titleId])

  const heading = headingFromItem(titleItem, lang, titleId || 'Study')

  if (!itemsQuery) {
    return (
      <section className="page">
        <h1>Study</h1>
        <p>
          Add language items to the link with{' '}
          <code>?items=hat,shop-hello</code>.
        </p>
      </section>
    )
  }

  return (
    <section className="page">
      <PageHeading english={heading.english} l1={heading.l1} lang={lang} />
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
