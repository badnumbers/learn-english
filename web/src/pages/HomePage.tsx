export function HomePage() {
  return (
    <section className="page page--home">
      <h1>Study links</h1>
      <p>
        Share a link that opens a list of language items. Each id in the URL is
        one Cosmos document; the page is only that ordered list.
      </p>
      <p className="example-label">Study list</p>
      <code className="example-url">/p?i=hat,shop-hello,shop-want-bread</code>
      <p className="example-label">Vocabulary alias</p>
      <code className="example-url">/vocab?w=apple,look-after,run</code>
      <ul className="notes">
        <li>
          Use lowercase slugs. <code>i</code> (and the vocabulary alias{' '}
          <code>w</code>) is a comma-separated list of language item ids.
          Phrases use hyphens: <code>look-after</code>.
        </li>
        <li>
          Optional <code>lang</code> is a BCP 47 tag (for example{' '}
          <code>ar-EG</code>) that picks one translation and is saved in the
          browser. Students can also choose a language from the globe in the
          header. That choice is remembered locally and is not written onto a
          link that has no <code>lang</code>. Without either, Arabic (
          <code>ar-001</code>) is used.
        </li>
        <li>
          Language items live in the <code>languageitems</code> container. Each
          document <code>id</code> must match the slug. Use partition key{' '}
          <code>/id</code>. One document is one language item: an ordered{' '}
          <code>elements</code> list. A named conversation or a clustered group
          of alternatives is a later document type, not a list nested inside a
          language item.
        </li>
        <li>
          Element types: <code>image</code> (<code>file</code> blob name such as{' '}
          <code>shirt.jpg</code>), <code>translations</code> (BCP 47 keys),{' '}
          <code>english</code> (<code>text</code> and optional <code>audio</code>{' '}
          such as <code>conversations/at-the-shop/01.mp3</code>). Optional
          language item <code>style</code> is <code>bubble-left</code> or{' '}
          <code>bubble-right</code>; omit for a card.{' '}
          <code>description</code> and <code>context</code> are authoring notes
          and are not shown on the list.
        </li>
      </ul>
    </section>
  )
}
