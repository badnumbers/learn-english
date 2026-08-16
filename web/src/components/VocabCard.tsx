import type { VocabItem } from '../types'
import { cueTexts } from '../i18n/translations'

type VocabCardProps = {
  item: VocabItem
  lang: string | null
}

export function VocabCard({ item, lang }: VocabCardProps) {
  const hasImage = Boolean(item.imageUrl)
  const texts = cueTexts(item.translations, lang)

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
      <h2 className="card-english">{item.english}</h2>
    </article>
  )
}
