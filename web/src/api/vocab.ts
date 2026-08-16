import type { VocabResponse } from '../types'

export async function fetchVocab(
  wordsQuery: string,
  signal?: AbortSignal,
): Promise<VocabResponse> {
  const params = new URLSearchParams()
  if (wordsQuery.trim()) {
    params.set('w', wordsQuery)
  }

  const response = await fetch(`/api/vocab?${params.toString()}`, { signal })
  if (!response.ok) {
    throw new Error('Could not load vocabulary.')
  }

  return (await response.json()) as VocabResponse
}
