# Blob media (images and audio)

Cosmos `files` maps a kind of media to a **blob file name**. The API builds public URLs from `MEDIA_BASE_URL` and the matching container:

```
{MEDIA_BASE_URL}/{container}/{fileName}
https://YOUR_ACCOUNT.blob.core.windows.net/images/shirt.jpg
https://YOUR_ACCOUNT.blob.core.windows.net/audio/shirt.mp3
```

| `files` key | Container (default) | Example value |
| --- | --- | --- |
| `image` | `images` | `shirt.jpg` |
| `audio` | `audio` | `shirt.mp3` |

Omit a key when that media does not exist. File names must be a single segment with an extension (`shirt.jpg`, `look-after.svg`). No host, path, or `..`. The name does not have to equal the document `id`.

Configure `MEDIA_BASE_URL` in `api/local.settings.json` and in the Function App settings. Optional: `MEDIA_IMAGES_CONTAINER`, `MEDIA_AUDIO_CONTAINER`.

The API never uses a storage account key or SAS. The browser loads media with a plain GET of the public URL.

## Public read, no public write

Anonymous internet users must be able to **GET** a blob if they know its URL. They must not **list**, **upload**, **overwrite**, or **delete**.

1. On the storage account, enable **Allow Blob anonymous access** (off by default on new accounts). Leave **Allow storage account key access** enabled only for you (Portal, Storage Explorer, AzCopy). Do not put the account key, connection string, or a SAS token in the web app or in Cosmos.
2. Create containers `images` and `audio`. Set each container’s anonymous access level to **Blob** (anonymous read for individual blobs). Do **not** use **Container** — that also allows listing every file.
3. Upload files while signed in with Azure AD (Portal, Storage Explorer, AzCopy). Those tools use your identity, not anonymous access.
4. Do not create a SAS with write (`sp` including `w`, `c`, `d`, or `a`) and do not paste one into the frontend.

Anonymous blob access is **read-only**. PUT, POST, and DELETE still require the account key, a SAS, or Azure AD with a data-plane role such as Storage Blob Data Contributor. The Function App does not have that role and does not proxy uploads.

Optional hardening later: disable shared key access on the account and upload only with Azure AD; add a resource lock on the account so containers cannot be switched to a more open access level by accident.
