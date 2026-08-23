export type VocabItem = {
  id: string
  english: string
  translations: Record<string, string> | null
  imageUrl: string | null
  audioUrl: string | null
  found: boolean
}

export type VocabResponse = {
  items: VocabItem[]
}
