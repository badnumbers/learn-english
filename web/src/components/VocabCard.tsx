import { useRef } from 'react'
import type { VocabItem } from '../types'
import { cueTexts } from '../i18n/translations'

type VocabCardProps = {
  item: VocabItem
  lang: string | null
}

function PlayIcon() {
  return (
    <svg
      className="card-play-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M8 5v14l11-7z" fill="currentColor" />
    </svg>
  )
}

export function VocabCard({ item, lang }: VocabCardProps) {
  const hasImage = Boolean(item.imageUrl)
  const texts = cueTexts(item.translations, lang)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  function playAudio() {
    const el = audioRef.current
    if (!el) {
      return
    }
    el.currentTime = 0
    void el.play()
  }

  const english = <h2 className="card-english">{item.english}</h2>

  return (
    <article className={`card${item.found ? '' : ' card--missing'}`}>
      <div className="card-cue">
        {hasImage ? (
          <img
            className="card-image"
            src={item.imageUrl ?? ''}
            alt=""
          />
        ) : texts.length > 0 ? (
          <div className="card-cue-texts">
            {texts.map((text, index) => (
              <p key={`${text}-${index}`} className="card-cue-text">
                {text}
              </p>
            ))}
          </div>
        ) : (
          <p className="card-cue-placeholder">
            {item.found ? ' ' : 'Not in the word list yet'}
          </p>
        )}
      </div>
      {item.audioUrl ? (
        <div className="card-word">
          <div className="card-play-col">
            <audio ref={audioRef} src={item.audioUrl} preload="none" />
            <button
              type="button"
              className="card-play"
              onClick={playAudio}
              aria-label={`Play pronunciation of ${item.english}`}
            >
              <PlayIcon />
            </button>
          </div>
          {english}
        </div>
      ) : (
        english
      )}
    </article>
  )
}
