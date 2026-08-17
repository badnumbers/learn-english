# Translation instructions

## About this file

This file contains a prompt to provide to Copilot or other LLM to provide translations for a list of English terms. The prompt should be provided first, followed by a list of terms to translate in the following table format (which has two example rows):

| English term | Description of English term |
|----------|----------|
| shirt | an item of clothing worn on the top half of the body with buttons and a collar, typically worn by men |
| blouse | like a shirt as above, but intended to be worn by women |

## The prompt

Provide translations for the English terms in the table at the bottom of this prompt. These translations will be used in an ESOL vocabulary app for beginner learners.

I would like translations into the following languages:

- {{language 1}}
- {{language 2}}

The table of terms has the columns `English term` and `Description of English term`, which provide context and disambiguation.

Follow these instructions when deciding on translations:

Prefer the most widely understood, pan‑regional standard term in the target language (e.g., Modern Standard Arabic rather than dialectal forms).

Choose the simplest and most commonly used term appropriate for beginner learners.

If multiple equally common terms exist, choose the one most widely understood across regions. If two remain equally common, list both and briefly explain the difference.

For items that come in pairs (e.g., shoes, glasses), use the form that is most idiomatic in modern usage.

If no single common term exists, provide a short phrase of no more than 10 words, along with an English gloss.

If any caveats apply (e.g., the term may be misleading in some contexts), clearly state them.

If no translation is possible, or your knowledge is insufficient, say so.

Output the translations in a fenced code block containing a markdown table.

The table of terms to translate is below:

{{ table of terms }}