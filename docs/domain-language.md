# Domain language

Terms used in this project. Prefer these names in code, docs, and Cosmos documents.

## Language item

One Cosmos document in the `languageitems` container. Its `id` is the slug in the URL (`items` or `title`). On a study page it usually renders as a card or speech bubble. A language item used as `title` is a heading only (English and L1), not a list of other language items.

## Element

One typed row inside a language item. The `elements` array is the render order, top to bottom. Each element has a `type` and only the fields for that type:

| `type` | Fields | Renders as |
| --- | --- | --- |
| `image` | `file` (blob name in `images`) | Picture |
| `translations` | `translations` (BCP 47 tag to text) | L1 for the student’s language |
| `english` | `text`, optional `audio` (blob name in `audio`) | English phrase, with a play button when audio is present |

Unknown `type` values are ignored. Do not infer type from whichever keys are present.

## Page

An ordered list of language item ids from the URL (`/learn?items=hat,shop-hello`). Optional `title` is another language item id used only as the page heading (English and L1), not as a row in that list. The page does not store that list in Cosmos. The student’s home page lists each `title` the first time this browser opened it.

## Style

Container chrome for a **language item**, not for an element. Closed set: `bubble-left`, `bubble-right`, or omitted (default card). A later page or group document may cluster language items; do not nest that list inside a language item.

## Authoring notes

`description`, `context`, and `tags` on a language item are authoring notes. `tags` is a string array so documents can be found in Cosmos; the app does not read or show it. Extra JSON properties must not be stripped if a document is written back.
