# Adding translations

Back up the `languageitems` container first. Then tell the agent which documents to change, and confirm the dry run before anything is written.

The agent follows `.cursor/skills/add-translations/SKILL.md`. Target tags are the full list in [bcp47-translations.md](bcp47-translations.md).

## What to ask for

Name a filter and the change:

- a tag, such as “fill missing Amharic on items tagged `clothes`”
- one or more language item ids

The agent reads those documents from Cosmos, chooses the L1s, and shows a dry run. Nothing is written until you confirm that diff. Then spot-check a few items in the app.

`scripts/update-translations.py` does the read and the write. The Cosmos endpoint, database, and container come from `api/local.settings.json`. The account key comes from `scripts/cosmos-read-write-key.txt`, which is gitignored. Put the primary read-write key there, either on its own or as a full connection string. The app keeps using `COSMOS_CONNECTION_STRING` and does not need that key. The primary key can change anything in the Cosmos account, not only this container.

```bash
python3 scripts/update-translations.py query --tag clothes
python3 scripts/update-translations.py apply /tmp/translation-patch.json
python3 scripts/update-translations.py apply /tmp/translation-patch.json --write
```

`query` prints the documents and writes nothing. `apply` prints the gloss diff and writes nothing. `apply --write` replaces only the `translations` object, using the document `_etag`, and leaves every other field as it was. Pass `--id` instead of `--tag` to select by language item id. Repeat `--tag` when the document must have every listed tag.

## Authoring fields

`description` is the meaning of the English, used when the English is ambiguous or when a conversation turn needs its place in the exchange.

`context` is the social situation, such as who is speaking and to whom.

`translationNotes` says how to choose an L1 when several words could gloss that meaning: a preferred term, an allowed fallback, or the word the public actually uses.

The app shows none of these. `tags` is a string array for finding documents. Each L1 must still make sense on its own, as in a quiz. There is one student-facing `translations` object.

## After a write

Read the agent’s notes (gender, formality, names, descriptions used because a language has no single word, unsure terms), then open a study list that includes a few of the changed ids.
