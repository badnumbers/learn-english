---
name: add-translations
description: >-
  Fills L1 translations on language items in documents-for-adding-translations.json
  for every BCP 47 tag in docs/bcp47-translations.md. Use when adding translations,
  filling a translations map, or when the user pastes Cosmos language items for
  translation.
---

# Add translations

Write L1 strings into language items so beginner ESOL learners can see what the English means.

## Input

Documents to be provided in a JSON array in `documents-for-adding-translations.json` (repo root).

Each array member is one **language item**. Fill the `translations` object on each `translations` element. Do not invent extra elements.

Read the target tags from [`docs/bcp47-translations.md`](../../../docs/bcp47-translations.md). Fill **every** tag listed there, unless a specific tag cannot be translated (say so in the report and omit or leave that key unset).

## Authoring fields

`description` property provides a more detailed description of the meaning, intended for ambiguity or to highlight flow in a conversation.

`context` provides information about the social (and possibly other) context, for example, the genders and relative ages of the speakers.

The app does not show `description`, `context`, or `tags`. Keep them. `tags` is a string array for finding documents in Cosmos; do not invent or edit it unless asked. Keep Cosmos system properties (`_rid`, `_self`, `_etag`, `_attachments`, `_ts`) and any other extra fields.

## When to stop and ask

Ask before filling (and wait) only when blocked:

- English `text` and `description` do not correspond (likely authoring error)
- `context` is missing or too thin, and gender, age, or formality would change the L1
- Knowledge is insufficient for a language

Otherwise fill the file, then report nuances, caveats, and process feedback.

## How to choose an L1

The L1 is a gloss of **this English** on this language item. There is one student-facing map: do not add a second “literal” field.

**Isolation test:** if this language item stood alone (no previous turn, as in a quiz), would the L1 still be a fair translation of this English? If not, reject it.

That is a phrase equivalent, not a word-for-word calque. A stock equivalent of the whole English phrase is fine (`¡Igualmente!` for “Nice to meet you too!”). A different speech act is not (`وأنا أيضاً!` is “me too,” not that English). Conversational substitutes belong in the report, not in the JSON.

- Prefer the most widely understood, pan-regional standard for that tag (Modern Standard Arabic for `ar-001`, Latin American Spanish for `es-419`, Brazilian Portuguese for `pt-BR`, and so on).
- Avoid strongly dialect-specific wording unless it is also widely understood.
- Choose the simplest common form suitable for beginners.
- Match the English register as far as the L1 allows (informal English → informal L1).
- Use `description` to pick the sense. Use `context` only for agreement and address (speaker vs addressee gender, age, stranger vs familiar). If the English does not inflect, the L1 still may. Do not use `context` to swap in a shorter reply that drops the English meaning.
- Two English lines may share an L1 only when both English lines really mean that same L1. Do not collapse “Nice to meet you” into “me too,” or similar.
- For pairs (shoes, glasses), use the idiomatic modern form.
- If no single common term exists, use a short phrase of at most 10 words and mention the English gloss in the report.
- If two terms are equally common, put the isolatable one in the JSON and mention the other in the report.
- Transliterate names into the target script. Flag clashes with everyday words (for example Arabic `آنا` vs `أنا`).
- State caveats in the report (misleading in some regions, religious extra meaning, and similar).

## Write-back

Write the same JSON array back to `documents-for-adding-translations.json`. Keep it valid JSON. Do not strip unknown properties.

## Report

After writing, briefly tell the user:

- Gender or formality choices that made two items’ English look the same but L1 differ (or the reverse)
- Conversational substitutes you considered but rejected because they fail the isolation test
- Terms you were unsure of
- Authoring nits (ids, audio names, typos) if they matter
- Process notes that would make the next batch easier
