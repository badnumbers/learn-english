# Speech clips (MP3)

English play-button audio is a **mono MP3** in the `audio` blob container. One file per clip; the player uses a single `<audio src>`. Blob names: [`docs/blob-media.md`](docs/blob-media.md).

Use these settings when recording or exporting **synthesized speech** (and when re-encoding a live take):

| Setting | Value |
| --- | --- |
| Container / codec | MPEG-1 Audio Layer III (`.mp3`) |
| Channels | Mono |
| Sample rate | 22.05 kHz or 24 kHz (16 kHz is acceptable; do not upsample) |
| Bitrate | 64 kbps CBR mono (48 kbps if size matters; not 128+) |
| MIME type | `audio/mpeg` |

Do not ship WAV, M4A, or high-bitrate “studio” MP3. Keep a lossless master privately if you may re-export later.

Before encode: one speaker, no music bed, peaks about **−3 to −6 dBFS** (no clipping). Aim for speech that is clear on a phone speaker (about **−16 LUFS** integrated). A light high-pass (~80 Hz) helps more than a higher bitrate.
