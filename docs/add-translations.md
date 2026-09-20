# Adding translations

Paste language items as a JSON array into [`documents-for-adding-translations.json`](../documents-for-adding-translations.json) at the repo root, then ask the agent to fill the L1s.

The agent process is the project skill `.cursor/skills/add-translations/SKILL.md`. Target tags are the full list in [bcp47-translations.md](bcp47-translations.md).

## JSON array

Each object is one **language item** (one Cosmos document). Keep system properties if you copied the document from Data Explorer (`_rid`, `_etag`, and the rest), so you can replace the item in place.

Put the English on an `english` element. Leave `translations` empty, or already partially filled; the agent writes one string per supported BCP 47 tag.

## Authoring fields

`description` property provides a more detailed description of the meaning, intended for ambiguity or to highlight flow in a conversation.

`context` provides information about the social (and possibly other) context, for example, the genders and relative ages of the speakers.

Neither field is shown in the app. They only guide translation. If two turns use the same English but different speakers, say so in `context`; some L1s will still differ.

## After translation

Read the agent’s notes (gender, formality, names, unsure terms), then copy each document back into the `languageitems` container.
