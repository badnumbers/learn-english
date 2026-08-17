# Learn English

Share a vocabulary list with a URL. Students open `/vocab?w=apple,look-after,run&lang=ar-EG` and see each word with an image or a translation.

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

Open the web app at [http://localhost:5173](http://localhost:5173). A vocabulary list: [http://localhost:5173/vocab?w=cat,look-after&lang=ar-EG](http://localhost:5173/vocab?w=cat,look-after&lang=ar-EG).

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
  "image": true,
  "audio": true
}
```

`description` is English gloss used when collecting translations. The app does not show it and must not strip it (or other extra properties) if a document is written back. Use `image: true` (blob named after `id` in the `images` container) or `translations` (BCP 47 language tags → text). `audio: true` is the same convention in the `audio` container. See [`docs/blob-media.md`](docs/blob-media.md). Translation-key conventions belong in [`docs/`](docs/).

## Azure Static Web Apps

Frontend: `web` (build output `dist`). API: `api` (.NET 10 isolated Functions). Config: `web/public/staticwebapp.config.json`.
