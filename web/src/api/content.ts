import { parseLanguageItem, type ContentResponse } from '../types'

export async function fetchContent(
  itemsQuery: string,
  signal?: AbortSignal,
): Promise<ContentResponse> {
  const params = new URLSearchParams()
  if (itemsQuery.trim()) {
    params.set('i', itemsQuery)
  }

  const response = await fetch(`/api/content?${params.toString()}`, { signal })
  if (!response.ok) {
    throw new Error('Could not load content.')
  }

  const data: unknown = await response.json()
  const rawItems =
    typeof data === 'object' && data !== null && 'items' in data
      ? (data as { items: unknown }).items
      : []
  const items = Array.isArray(rawItems)
    ? rawItems.flatMap((item) => {
        const parsed = parseLanguageItem(item)
        return parsed ? [parsed] : []
      })
    : []

  return { items }
}
