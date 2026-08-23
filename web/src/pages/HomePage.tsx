export function HomePage() {
  return (
    <section className="page page--home">
      <h1>Vocabulary links</h1>
      <p>
        Share a link that opens a study list. The words live in the URL; each
        item is looked up from the vocabulary database.
      </p>
      <p className="example-label">Example</p>
      <code className="example-url">/vocab?w=apple,look-after,run&lang=ar-EG</code>
      <ul className="notes">
        <li>
          Use lowercase slugs in <code>w</code>. Separate them with commas.
          Phrases use hyphens: <code>look-after</code>.
        </li>
        <li>
          Optional <code>lang</code> is a BCP 47 tag (for example{' '}
          <code>ar-EG</code>) used to pick one translation. Without it, every
          translation is shown.
        </li>
        <li>
          Each Cosmos document <code>id</code> must match the slug. Use
          partition key <code>/id</code>.
        </li>
        <li>
          Fields: <code>english</code>, then either{' '}
          <code>files.image</code> (a blob name such as{' '}
          <code>shirt.jpg</code>) or <code>translations</code> (BCP 47 keys to
          the word in that language). <code>description</code> is authoring
          notes for translators and is not shown on the list.
        </li>
      </ul>
    </section>
  )
}
