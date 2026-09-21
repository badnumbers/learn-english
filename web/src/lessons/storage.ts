const STORAGE_KEY = 'learn-english.lessons'

export type LessonVisit = {
  firstSeen: number
  itemIds: string
  titleId: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function parseVisit(raw: unknown): LessonVisit | null {
  if (!isRecord(raw)) {
    return null
  }

  const titleId = typeof raw.titleId === 'string' ? raw.titleId.trim() : ''
  const itemIds = typeof raw.itemIds === 'string' ? normalizeItemIds(raw.itemIds) : ''
  const firstSeen =
    typeof raw.firstSeen === 'number' && Number.isFinite(raw.firstSeen)
      ? raw.firstSeen
      : NaN

  if (!titleId || !itemIds || !Number.isFinite(firstSeen)) {
    return null
  }

  return { firstSeen, itemIds, titleId }
}

export function normalizeItemIds(query: string): string {
  return query
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
    .join(',')
}

export function lessonHref(visit: Pick<LessonVisit, 'itemIds' | 'titleId'>): string {
  return `/learn?items=${visit.itemIds}&title=${visit.titleId}`
}

export function readLessons(): LessonVisit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.flatMap((entry) => {
      const visit = parseVisit(entry)
      return visit ? [visit] : []
    })
  } catch {
    return []
  }
}

export function recordLesson(titleId: string, itemIds: string): void {
  const title = titleId.trim()
  const items = normalizeItemIds(itemIds)
  if (!title || !items) {
    return
  }

  try {
    const existing = readLessons()
    if (existing.some((visit) => visit.titleId === title)) {
      return
    }

    const next: LessonVisit[] = [
      { firstSeen: Date.now(), itemIds: items, titleId: title },
      ...existing,
    ]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    /* ignore quota / private mode */
  }
}

export type LessonDateGroup = {
  key: string
  label: string
  lessons: LessonVisit[]
}

export function groupLessonsByDate(lessons: LessonVisit[]): LessonDateGroup[] {
  const sorted = [...lessons].sort((a, b) => a.firstSeen - b.firstSeen)
  const groups: LessonDateGroup[] = []
  const formatter = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  for (const lesson of sorted) {
    const date = new Date(lesson.firstSeen)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    const last = groups.at(-1)
    if (last?.key === key) {
      last.lessons.push(lesson)
      continue
    }

    groups.push({
      key,
      label: formatter.format(date),
      lessons: [lesson],
    })
  }

  groups.reverse()
  return groups
}
