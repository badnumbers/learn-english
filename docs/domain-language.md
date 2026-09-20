# Domain language

Terms used in this project. Prefer these names in code, docs, and Cosmos documents.

## Language item

One Cosmos document in the `languageitems` container, and one container on a study page. Its `id` is the slug in the URL. A language item is not a list of other language items.

## Element

One typed row inside a language item. The `elements` array is the render order, top to bottom. Each element has a `type` and only the fields for that type:

| `type` | Fields | Renders as |
| --- | --- | --- |
| `image` | `file` (blob name in `images`) | Picture |
| `translations` | `translations` (BCP 47 tag to text) | L1 for the student’s language |
| `english` | `text`, optional `audio` (blob name in `audio`) | English phrase, with a play button when audio is present |

Unknown `type` values are ignored. Do not infer type from whichever keys are present.

## Page

An ordered list of language item ids from the URL (`/p?i=hat,shop-hello`). The vocabulary alias `/vocab?w=` is the same list. The page does not store that list in Cosmos.

## Style

Container chrome for a **language item**, not for an element. Closed set: `bubble-left`, `bubble-right`, or omitted (default card). A later page or group document may cluster language items; do not nest that list inside a language item.

## Authoring notes

`description` and `context` on a language item are authoring notes. The app does not show them. Extra JSON properties must not be stripped if a document is written back.
