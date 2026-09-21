import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { fetchContent } from '../api/content'
import { useSourceLanguage } from '../hooks/useSourceLanguage'
import { headingFromItem } from '../lessons/heading'
import {
  groupLessonsByDate,
  lessonHref,
  readLessons,
  type LessonVisit,
} from '../lessons/storage'
import type { LanguageItem } from '../types'

export function HomePage() {
  const lang = useSourceLanguage()
  const location = useLocation()
  const lessons = useMemo(() => readLessons(), [location.key])
  const groups = useMemo(() => groupLessonsByDate(lessons), [lessons])
  const [titles, setTitles] = useState<Map<string, LanguageItem> | null>(
    lessons.length === 0 ? new Map() : null,
  )

  useEffect(() => {
    const titleIds = [...new Set(lessons.map((lesson) => lesson.titleId))]
    if (titleIds.length === 0) {
      setTitles(new Map())
      return
    }

    const controller = new AbortController()
    fetchContent(titleIds.join(','), controller.signal)
      .then((data) => {
        const next = new Map<string, LanguageItem>()
        for (const item of data.items) {
          next.set(item.id, item)
        }
        setTitles(next)
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return
        }
        setTitles(new Map())
      })

    return () => controller.abort()
  }, [lessons])

  if (lessons.length === 0) {
    return (
      <section className="page page--home">
        <h1>Lessons</h1>
        <p className="status">Open a class link to see it here.</p>
      </section>
    )
  }

  return (
    <section className="page page--home">
      <h1>Lessons</h1>
      {groups.map((group) => (
        <section key={group.key} className="lesson-group">
          <h2 className="lesson-date">{group.label}</h2>
          <ul className="lesson-list">
            {group.lessons.map((lesson) => (
              <li key={lesson.titleId}>
                <LessonRow
                  lesson={lesson}
                  item={titles?.get(lesson.titleId) ?? null}
                  lang={lang}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </section>
  )
}

function LessonRow({
  lesson,
  item,
  lang,
}: {
  lesson: LessonVisit
  item: LanguageItem | null
  lang: string
}) {
  const heading = headingFromItem(item, lang, lesson.titleId)

  return (
    <Link className="lesson-link" to={lessonHref(lesson)}>
      <span className="lesson-english">{heading.english}</span>
      {heading.l1 ? (
        <span className="lesson-l1" dir="auto" lang={lang}>
          {heading.l1}
        </span>
      ) : null}
    </Link>
  )
}
