type PageHeadingProps = {
  english: string
  l1: string | null
  lang: string
}

export function PageHeading({ english, l1, lang }: PageHeadingProps) {
  return (
    <header className="page-heading">
      <h1 className="page-heading-english">{english}</h1>
      {l1 ? (
        <p className="page-heading-l1">
          <span dir="auto" lang={lang}>
            {l1}
          </span>
        </p>
      ) : null}
    </header>
  )
}
