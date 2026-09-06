# Learn English

Share a vocabulary list with a URL. Students open `/vocab?w=apple,look-after,run` and see each word with an image or a translation. Optional `lang` (a BCP 47 tag such as `ar-EG`) overrides the translation shown and is saved in the browser. Students can also pick a language from the globe in the header; that choice is remembered locally and is not written onto a language-neutral vocab link.

## Run locally

1. Copy `api/local.settings.json.example` to `api/local.settings.json` and set `COSMOS_CONNECTION_STRING` and `MEDIA_BASE_URL` (the storage account blob endpoint, no trailing slash).
2. In Cosmos, create database `learn-english` and container `vocab` with partition key `/id`. Add documents whose `id` matches the slug.
3. Start the API and the web app in **two terminals** (each command is long-running):

Terminal 1 — API:

```bash
cd api && dotnet run
```

Terminal 2 — web app:

```bash
cd web && npm install && npm run dev
```

Open the web app at [http://localhost:5173](http://localhost:5173). A vocabulary list: [http://localhost:5173/vocab?w=cat,look-after](http://localhost:5173/vocab?w=cat,look-after). Add `&lang=ar-EG` only when you want that link to force one language.

The Vite dev server proxies `/api` to `http://localhost:7071`.

## Cosmos document

```json
{
  "id": "cat",
  "english": "cat",
  "description": "A small domesticated mammal often kept as a pet.",
  "translations": {
    "ar-001": "قطة",
    "ar-EG": "قطة",
    "fa-IR": "گربه",
    "ps-Arab-AF": "پیشو"
  },
  "files": {
    "image": "cat.jpg",
    "audio": "cat.mp3"
  }
}
```

`description` is English gloss used when collecting translations. The app does not show it and must not strip it (or other extra properties) if a document is written back. `files.image` / `files.audio` are blob names in the `images` and `audio` containers (they need not match `id`, so two senses of the same word can use different files). See [`docs/blob-media.md`](docs/blob-media.md). Translation-key conventions belong in [`docs/`](docs/).

## Deploy to Azure

Production is a Standard Static Web App with a linked .NET 10 Flex Consumption Function App (Cosmos and Blob Storage stay as they are). Students use the Static Web App URL, for example [https://kind-ocean-0ce852303.7.azurestaticapps.net/vocab?w=coat,hat,shirt,shoes](https://kind-ocean-0ce852303.7.azurestaticapps.net/vocab?w=coat,hat,shirt,shoes). Full walkthrough: [`docs/azure-deploy.md`](docs/azure-deploy.md).
