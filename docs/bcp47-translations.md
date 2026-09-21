# Language tagging (BCP 47)

Translation keys on language items are **BCP 47** tags.

Supported L1s:

| Tag | Language |
| --- | --- |
| `ar-001` | Generic Arabic (Modern Standard) |
| `fa-IR` | Iranian Persian |
| `ps-Arab-AF` | Pashto (Arabic script, Afghanistan) |
| `es-419` | Latin American Spanish |
| `pt-BR` | Brazilian Portuguese |
| `uk-UA` | Ukrainian |
| `my-MM` | Burmese |
| `so-001` | Somali |
| `tr-TR` | Turkish |
| `ti-ER` | Tigrinya as spoken in Eritrea |

`es-419` is Spanish for **Latin America and the Caribbean** (UN M.49 region `419`). That is the usual contrast with Spain (`es-ES`). There is no widely used “South America only” Spanish tag; `es-005` (South America) is valid BCP 47 but rarely used. `419` includes Mexico and Central America as well as South America.

`pt-BR` is Brazilian Portuguese, not European (`pt-PT`).

`tr-TR` is Turkish as used in Turkey.

`ti-ER` is Tigrinya as used in Eritrea, not Ethiopia (`ti-ET`).

Example:

```json
{
  "fa-IR": "گربه"
}
```
