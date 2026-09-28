---
name: add-translations
description: >-
  Fills L1 translations on Cosmos language items for every BCP 47 tag in
  docs/bcp47-translations.md. Use when adding translations, reviewing a
  translations map, or when the user names a tag or language item ids to
  translate.
---

# Add translations

Write L1 strings into language items so beginner ESOL learners can see what the English means.

## Input

The user names a filter: one or more `tags`, or one or more language item ids. Read those documents from Cosmos. Do not invent extra documents, elements, or tags.

Use `scripts/update-translations.py`. It reads the Cosmos endpoint from `api/local.settings.json` and the account key from `scripts/cosmos-read-write-key.txt`. Never print, log, or commit that key.

```bash
python3 scripts/update-translations.py query --tag clothes
python3 scripts/update-translations.py query --id coat --id hat
```

Repeat `--tag` only when every tag must be present. Add `--missing am-ET` when the user asked only for items that lack that tag. `query` writes nothing.

Read the target tags from [`docs/bcp47-translations.md`](../../../docs/bcp47-translations.md). Fill **every** tag listed there. A missing single-word equivalent is not a reason to skip a tag: describe the English in that L1 instead. Omit or leave a key unset only when the tag truly cannot be translated, or when `translationNotes` says not to translate without a direct term (as with colours the student can see). Say so in the report.

There is one `translations` object, on the element whose `type` is `translations`. Older documents may keep that object at the top level instead. Update that object only.

## Authoring fields

`description` property provides a more detailed description of the meaning, intended for ambiguity or to highlight flow in a conversation.

`context` provides information about the social (and possibly other) context, for example, the genders and relative ages of the speakers.

`translationNotes` says how to choose an L1 when several words could gloss that meaning: a preferred term, an allowed fallback, or the word the public actually uses. It does not change the sense, and it does not describe who is speaking.

The app does not show `description`, `context`, `translationNotes`, or `tags`. Do not edit them unless asked. `tags` is a string array for finding documents in Cosmos. Do not add or remove tags unless asked. Do not change any field other than translation strings.

## When to stop and ask

Ask before writing a patch (and wait) only when blocked:

- English `text` and `description` do not correspond (likely authoring error)
- `context` is missing or too thin, and gender, age, or formality would change the L1
- Knowledge is insufficient for a language

Otherwise prepare the patch, show the dry run, then report nuances, caveats, and process feedback. Stop there. Do not pass `--write` in that same turn.

Write to Cosmos only after the user confirms the dry run in a later message. A request to translate is not that confirmation. If they reject the diff, delete the patch file and do not write.

## How to choose an L1

The L1 is a gloss of **this English** on this language item. There is one student-facing map: do not add a second “literal” field.

**Isolation test:** if this language item stood alone (no previous turn, as in a quiz), would the L1 still be a fair translation of this English? If not, reject it.

That is a phrase equivalent, not a word-for-word calque. A stock equivalent of the whole English phrase is fine (`¡Igualmente!` for “Nice to meet you too!”). A different speech act is not (`وأنا أيضاً!` is “me too,” not that English). Conversational substitutes belong in the report, not in Cosmos.

- Prefer the most widely understood, pan-regional standard for that tag (Modern Standard Arabic for `ar-001`, Latin American Spanish for `es-419`, Brazilian Portuguese for `pt-BR`, and so on).
- Avoid strongly dialect-specific wording unless it is also widely understood.
- Choose the simplest common form suitable for beginners.
- Match the English register as far as the L1 allows (informal English → informal L1).
- Use `description` to pick the sense. Use `translationNotes` to choose among L1s for that sense. Use `context` only for agreement and address (speaker vs addressee gender, age, stranger vs familiar). If the English does not inflect, the L1 still may. Do not use `context` or `translationNotes` to swap in a shorter reply that drops the English meaning.
- Two English lines may share an L1 only when both English lines really mean that same L1. Do not collapse “Nice to meet you” into “me too,” or similar.
- For pairs (shoes, glasses), use the idiomatic modern form.
- If the L1 has a single common term for this English, use that term.
- If no single matching term exists, do not leave the key empty, borrow the English word, or substitute a nearby item. Write a short description of the English term in the L1, at most 10 words, so a beginner can see what it means. Example: English “hoodie”, when the L1 has no equivalent word, becomes that language’s wording for “a sweater with an attached hood”. Name those tags in the report.
- If two terms are equally common, put the isolatable one in Cosmos and mention the other in the report.
- Transliterate names into the target script. Flag clashes with everyday words (for example Arabic `آنا` vs `أنا`).
- State caveats in the report (misleading in some regions, religious extra meaning, and similar).

## Write-back

Write a temporary patch file outside the repo, for example under `/tmp`. Do not add a translations JSON file to the repository. The file is a JSON array of `{ "id", "translations" }`. Include only ids from the filter, and only keys that change. Use JSON `null` to delete a key.

Show the dry run:

```bash
python3 scripts/update-translations.py apply /tmp/translation-patch.json
```

After the user confirms:

```bash
python3 scripts/update-translations.py apply /tmp/translation-patch.json --write
```

Then delete the patch file. `--write` reads each document again and sends it back with `If-Match` set to `_etag`, so a newer edit is not overwritten. If a write fails, stop and report the id. Do not retry by dropping the etag check.

## Report

With the dry run, briefly tell the user:

- Gender or formality choices that made two items’ English look the same but L1 differ (or the reverse)
- Conversational substitutes you considered but rejected because they fail the isolation test
- Items where an L1 is a description because no single matching term exists
- Terms you were unsure of
- Authoring nits (ids, audio names, typos) if they matter
- Process notes that would make the next batch easier
