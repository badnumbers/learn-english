# Learn English

Share a study list with a URL. Students open `/p?i=hat,shop-hello,shop-want-bread` (or the vocabulary alias `/vocab?w=apple,look-after,run`). Each id is one **language item** (one Cosmos document). Optional `lang` (a BCP 47 tag such as `ar-EG`) overrides the translation shown and is saved in the browser. Students can also pick a language from the globe in the header; that choice is remembered locally and is not written onto a language-neutral link. Without `lang` or a stored choice, the app uses Arabic (`ar-001`).

Terms: [`docs/domain-language.md`](docs/domain-language.md).

## Run locally

1. Copy `api/local.settings.json.example` to `api/local.settings.json` and set `COSMOS_CONNECTION_STRING` and `MEDIA_BASE_URL` (the storage account blob endpoint, no trailing slash).
2. In Cosmos, create database `learn-english` and container `languageitems` with partition key `/id`. Add language items whose `id` matches the slug.
3. Start the API and the web app in **two terminals** (each command is long-running):

Terminal 1 — API:

```bash
cd api && dotnet run
```

Terminal 2 — web app:

```bash
cd web && npm install && npm run dev
```

Open the web app at [http://localhost:5173](http://localhost:5173). A study list: [http://localhost:5173/p?i=cat,look-after](http://localhost:5173/p?i=cat,look-after). The vocabulary alias still works: [http://localhost:5173/vocab?w=cat,look-after](http://localhost:5173/vocab?w=cat,look-after). Add `&lang=ar-EG` only when you want that link to force one language.

The Vite dev server proxies `/api` to `http://localhost:7071`.

## Language item

Each document in `languageitems` is one language item: an ordered list of **elements**. A page is only the ordered ids in the URL. Do not nest other language items inside a document.

```json
{
  "id": "quarter-to-three",
  "description": "Clock time 2:45.",
  "elements": [
    { "type": "image", "file": "clock-245.png" },
    { "type": "translations", "translations": { "ar-001": "الثالثة إلا ربعاً" } },
    { "type": "english", "text": "2:45", "audio": "two-forty-five.mp3" },
    { "type": "english", "text": "quarter to three", "audio": "quarter-to-three.mp3" }
  ]
}
```

A conversation turn is the same shape. Optional `style` is container chrome (`bubble-left` or `bubble-right`):

```json
{
  "id": "shop-hello",
  "description": "Shop assistant greeting.",
  "style": "bubble-left",
  "elements": [
    {
      "type": "translations",
      "translations": {
        "ar-001": "مرحبا، كيف يمكنني مساعدتك؟"
      }
    },
    {
      "type": "english",
      "text": "Hello, how can I help you?",
      "audio": "conversations/at-the-shop/01.mp3"
    }
  ]
}
```

Share that dialogue as `/p?i=shop-hello,shop-want-bread`. A named conversation slug and clustered alternatives are a later document type.

`description` is English gloss used when collecting translations. `context` is further authoring notes. The app does not show either and must not strip them (or other extra properties) if a document is written back. Element `file` / `audio` values are blob names (see [`docs/blob-media.md`](docs/blob-media.md)). Translation-key conventions belong in [`docs/`](docs/).

Documents that still use top-level `english`, `translations`, and `files` (and have no `elements`) are read as image, then translations, then one English phrase. New authoring should use `elements` only.

## Deploy to Azure

Production is a Standard Static Web App with a linked .NET 10 Flex Consumption Function App (Cosmos and Blob Storage stay as they are). Students use the Static Web App URL, for example [https://kind-ocean-0ce852303.7.azurestaticapps.net/p?i=coat,hat,shirt,shoes](https://kind-ocean-0ce852303.7.azurestaticapps.net/p?i=coat,hat,shirt,shoes). Full walkthrough: [`docs/azure-deploy.md`](docs/azure-deploy.md).
