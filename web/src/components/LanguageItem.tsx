import type { LanguageElement, LanguageItem as LanguageItemModel } from '../types'
import { isBubbleStyle } from '../types'
import { cueTexts } from '../i18n/translations'
import { PlayButton } from './PlayButton'

type LanguageItemProps = {
  item: LanguageItemModel
  lang: string
}

function ImageRow({ imageUrl }: { imageUrl: string }) {
  return (
    <div className="card-cue">
      <img className="card-image" src={imageUrl} alt="" />
    </div>
  )
}

function TranslationsRow({
  translations,
  lang,
}: {
  translations: Record<string, string>
  lang: string
}) {
  const texts = cueTexts(translations, lang)
  if (texts.length === 0) {
    return null
  }

  return (
    <div className="card-l1">
      {texts.map((text, index) => (
        <p key={`${text}-${index}`} className="card-l1-text">
          <span dir="auto">{text}</span>
        </p>
      ))}
    </div>
  )
}

function EnglishRow({ text, audioUrl }: { text: string; audioUrl: string | null }) {
  return (
    <div className="card-word">
      {audioUrl ? (
        <PlayButton
          audioUrl={audioUrl}
          label={`Play pronunciation of ${text}`}
        />
      ) : null}
      <h2 className="card-english">{text}</h2>
    </div>
  )
}

function ElementRow({
  element,
  lang,
}: {
  element: LanguageElement
  lang: string
}) {
  switch (element.type) {
    case 'image':
      return element.imageUrl ? <ImageRow imageUrl={element.imageUrl} /> : null
    case 'translations':
      return (
        <TranslationsRow translations={element.translations} lang={lang} />
      )
    case 'english':
      return <EnglishRow text={element.text} audioUrl={element.audioUrl} />
    default:
      return null
  }
}

export function LanguageItem({ item, lang }: LanguageItemProps) {
  const inner = (
    <>
      {!item.found ? (
        <p className="card-cue-placeholder">Not in the list yet</p>
      ) : null}
      {item.elements.map((element, index) => (
        <ElementRow
          key={`${item.id}-${index}`}
          element={element}
          lang={lang}
        />
      ))}
      {!item.found && item.elements.length === 0 ? (
        <EnglishRow text={item.id} audioUrl={null} />
      ) : null}
    </>
  )

  if (isBubbleStyle(item.style)) {
    const side = item.style === 'bubble-right' ? 'right' : 'left'
    return (
      <article className={`speech-row speech-row--${side}`}>
        <div className={`speech-bubble speech-bubble--${side}`}>{inner}</div>
      </article>
    )
  }

  return (
    <article className={`card${item.found ? '' : ' card--missing'}`}>
      {inner}
    </article>
  )
}
