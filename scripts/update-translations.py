#!/usr/bin/env python3
"""Read or update L1 translations on Cosmos language items.

Reads the Cosmos endpoint, database, and container from api/local.settings.json.
Reads the account key from scripts/cosmos-read-write-key.txt (gitignored).
Does not print the key.

  query   Print matching documents as a JSON array. Writes nothing.
  apply   Show the translation diff for a patch file. Writes nothing
          unless --write is passed.

A patch file is a JSON array:

  [{ "id": "coat", "translations": { "am-ET": "ኮት", "so-001": null } }]

Keys present in "translations" are set. JSON null deletes a key. Omitted
keys are left unchanged. Empty strings are rejected.
"""

from __future__ import annotations

import argparse
import base64
import email.utils
import hashlib
import hmac
import json
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SETTINGS = ROOT / "api" / "local.settings.json"
WRITE_KEY = Path(__file__).resolve().parent / "cosmos-read-write-key.txt"
API_VERSION = "2018-12-31"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)

    query = sub.add_parser("query", help="print matching language items as JSON")
    add_settings(query)
    add_filter(query)
    query.add_argument(
        "--missing",
        action="append",
        default=[],
        metavar="TAG",
        help="keep items whose translations lack this BCP 47 tag (repeatable)",
    )

    apply = sub.add_parser("apply", help="diff a patch file; write only with --write")
    add_settings(apply)
    apply.add_argument("patch", type=Path, help="JSON array of id and translations")
    apply.add_argument(
        "--write",
        action="store_true",
        help="replace translations in Cosmos; without this flag, print the diff only",
    )

    args = parser.parse_args()
    settings = load_settings(args.settings)
    client = Cosmos(settings)

    try:
        if args.command == "query":
            docs = select(client, args.tag, args.id)
            docs = [doc for doc in docs if missing_any(doc, args.missing)]
            json.dump(docs, sys.stdout, ensure_ascii=False, indent=2)
            sys.stdout.write("\n")
            print(f"{len(docs)} document(s)", file=sys.stderr)
            return
        run_apply(client, args)
    except CosmosError as error:
        raise SystemExit(str(error))

def run_apply(client: "Cosmos", args: argparse.Namespace) -> None:
    patch = load_patch(args.patch)
    failures = 0
    written = 0
    for item in patch:
        doc_id = item["id"]
        try:
            current = client.read(doc_id)
        except CosmosError as error:
            failures += 1
            print(f"{doc_id}: {error}", file=sys.stderr)
            continue
        updated, changes = merge_translations(current, item["translations"])
        if not changes:
            print(f"{doc_id}: no change")
            continue
        print(format_diff(doc_id, english_text(current), changes))
        if not args.write:
            continue
        try:
            client.replace(updated)
        except CosmosError as error:
            failures += 1
            print(f"{doc_id}: write failed: {error}", file=sys.stderr)
            break
        written += 1
    if not args.write:
        print("Dry run. Nothing was written.", file=sys.stderr)
    else:
        print(f"Wrote {written} document(s).", file=sys.stderr)
    if failures:
        raise SystemExit(1)


def add_settings(parser: argparse.ArgumentParser) -> None:
    parser.add_argument(
        "--settings",
        type=Path,
        default=DEFAULT_SETTINGS,
        help="path to api/local.settings.json",
    )


def add_filter(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--tag", action="append", default=[], help="tag the document must have (repeatable, AND)")
    parser.add_argument("--id", action="append", default=[], help="language item id (repeatable)")


def load_settings(path: Path) -> dict[str, str]:
    try:
        raw = json.loads(path.read_text())
    except FileNotFoundError:
        raise SystemExit(f"Missing {path}. Copy api/local.settings.json.example and set the Cosmos values.")
    values = raw.get("Values") or {}
    connection = values.get("COSMOS_CONNECTION_STRING") or ""
    endpoint, _settings_key = parse_connection(connection)
    database = values.get("COSMOS_DATABASE") or "learn-english"
    container = values.get("COSMOS_CONTAINER") or "languageitems"
    if not endpoint:
        raise SystemExit(f"{path} has no Cosmos account endpoint.")
    return {
        "endpoint": endpoint,
        "key": load_write_key(WRITE_KEY),
        "database": database,
        "container": container,
    }


def load_write_key(path: Path) -> str:
    try:
        text = path.read_text().strip()
    except FileNotFoundError:
        raise SystemExit(f"Missing {path}. Put the Cosmos primary read-write key in that gitignored file.")
    if not text:
        raise SystemExit(f"{path} is empty.")
    if "AccountKey=" in text:
        _endpoint, key = parse_connection(text)
        if not key:
            raise SystemExit(f"{path} has no AccountKey.")
        return key.strip()
    return text


def parse_connection(connection: str) -> tuple[str, str]:
    parts: dict[str, str] = {}
    for piece in connection.split(";"):
        if "=" not in piece:
            continue
        name, value = piece.split("=", 1)
        parts[name] = value
    return parts.get("AccountEndpoint", "").rstrip("/"), parts.get("AccountKey", "")


def load_patch(path: Path) -> list[dict]:
    data = json.loads(path.read_text())
    if not isinstance(data, list):
        raise SystemExit("The patch file must be a JSON array.")
    patch = []
    for item in data:
        if not isinstance(item, dict) or not isinstance(item.get("id"), str) or not item["id"].strip():
            raise SystemExit("Each patch entry needs a string id.")
        translations = item.get("translations")
        if not isinstance(translations, dict) or not translations:
            raise SystemExit(f"{item['id']}: translations must be a non-empty object.")
        for tag, text in translations.items():
            if text is None:
                continue
            if not isinstance(text, str) or not text.strip():
                raise SystemExit(f"{item['id']}: {tag} must be a non-empty string or null.")
        patch.append({"id": item["id"].strip(), "translations": translations})
    return patch


def select(client: "Cosmos", tags: list[str], ids: list[str]) -> list[dict]:
    if not tags and not ids:
        raise SystemExit("Pass --tag or --id. Refusing to read the whole container.")
    if tags:
        docs = client.query(tags)
        if ids:
            wanted = set(ids)
            found = {doc.get("id") for doc in docs}
            for doc_id in ids:
                if doc_id not in found:
                    print(f"{doc_id}: not in the tag filter", file=sys.stderr)
            docs = [doc for doc in docs if doc.get("id") in wanted]
        return docs
    docs = []
    for doc_id in ids:
        try:
            docs.append(client.read(doc_id))
        except CosmosError as error:
            print(f"{doc_id}: {error}", file=sys.stderr)
            raise SystemExit(1)
    return docs


def missing_any(doc: dict, tags: list[str]) -> bool:
    if not tags:
        return True
    current = translation_dict(doc)[0]
    return any(not str(current.get(tag, "")).strip() for tag in tags)


def translation_target(doc: dict) -> dict:
    elements = doc.get("elements")
    if isinstance(elements, list):
        matches = [element for element in elements if isinstance(element, dict) and element.get("type") == "translations"]
        if len(matches) > 1:
            raise CosmosError("more than one translations element")
        if len(matches) == 1:
            return matches[0]
        raise CosmosError("no translations element")
    if isinstance(doc.get("translations"), dict):
        return doc
    raise CosmosError("no translations to update")


def translation_dict(doc: dict) -> tuple[dict[str, str], dict]:
    target = translation_target(doc)
    current = target.get("translations")
    if current is None:
        current = {}
        target["translations"] = current
    if not isinstance(current, dict):
        raise CosmosError("translations is not an object")
    return current, target


def merge_translations(doc: dict, updates: dict) -> tuple[dict, list[tuple[str, str, str]]]:
    current, _target = translation_dict(doc)
    changes = []
    for tag, text in updates.items():
        old = current.get(tag)
        old_text = old if isinstance(old, str) else ""
        if text is None:
            if tag not in current:
                continue
            del current[tag]
            changes.append((tag, old_text, ""))
            continue
        if old_text == text:
            continue
        current[tag] = text
        changes.append((tag, old_text, text))
    return doc, changes


def english_text(doc: dict) -> str:
    elements = doc.get("elements")
    if isinstance(elements, list):
        parts = [element.get("text", "") for element in elements if isinstance(element, dict) and element.get("type") == "english"]
        text = " / ".join(part for part in parts if isinstance(part, str) and part.strip())
        if text:
            return text
    legacy = doc.get("english")
    return legacy if isinstance(legacy, str) else ""


def format_diff(doc_id: str, english: str, changes: list[tuple[str, str, str]]) -> str:
    lines = [f"{doc_id}  {english}"]
    for tag, old, new in changes:
        left = old if old else "(missing)"
        right = new if new else "(removed)"
        lines.append(f"  {tag}: {left} -> {right}")
    return "\n".join(lines)


class CosmosError(Exception):
    pass


class Cosmos:
    def __init__(self, settings: dict[str, str]) -> None:
        self.endpoint = settings["endpoint"]
        self.key = settings["key"]
        self.database = settings["database"]
        self.container = settings["container"]

    def query(self, tags: list[str]) -> list[dict]:
        clauses = []
        parameters = []
        for index, tag in enumerate(tags):
            name = f"@tag{index}"
            clauses.append(f"ARRAY_CONTAINS(c.tags, {name})")
            parameters.append({"name": name, "value": tag})
        body = {"query": "SELECT * FROM c WHERE " + " AND ".join(clauses), "parameters": parameters}
        link = self.collection_link()
        documents: list[dict] = []
        continuation = None
        while True:
            headers = self.headers("post", "docs", link)
            headers["Content-Type"] = "application/query+json"
            headers["x-ms-documentdb-isquery"] = "True"
            headers["x-ms-documentdb-query-enablecrosspartition"] = "True"
            if continuation:
                headers["x-ms-continuation"] = continuation
            payload = self.request("POST", f"{link}/docs", headers, body)
            batch = payload.get("Documents")
            if not isinstance(batch, list):
                raise CosmosError("query response had no Documents array")
            documents.extend(batch)
            continuation = payload.get("_continuation")
            if not continuation:
                return documents

    def read(self, doc_id: str) -> dict:
        link = self.document_link(doc_id)
        headers = self.headers("get", "docs", link)
        headers["x-ms-documentdb-partitionkey"] = json.dumps([doc_id])
        payload = self.request("GET", link, headers, None)
        if not isinstance(payload, dict) or not payload.get("id"):
            raise CosmosError("document response had no id")
        return payload

    def replace(self, doc: dict) -> None:
        doc_id = doc["id"]
        etag = doc.get("_etag")
        if not isinstance(etag, str) or not etag:
            raise CosmosError("document has no _etag")
        body = {key: value for key, value in doc.items() if not key.startswith("_")}
        link = self.document_link(doc_id)
        headers = self.headers("put", "docs", link)
        headers["Content-Type"] = "application/json"
        headers["If-Match"] = etag
        headers["x-ms-documentdb-partitionkey"] = json.dumps([doc_id])
        self.request("PUT", link, headers, body)

    def collection_link(self) -> str:
        return f"dbs/{self.database}/colls/{self.container}"

    def document_link(self, doc_id: str) -> str:
        return f"{self.collection_link()}/docs/{doc_id}"

    def headers(self, verb: str, resource_type: str, resource_link: str) -> dict[str, str]:
        date = email.utils.formatdate(usegmt=True)
        return {
            "Authorization": authorization(verb, resource_type, resource_link, date, self.key),
            "x-ms-date": date,
            "x-ms-version": API_VERSION,
            "Accept": "application/json",
        }

    def request(self, verb: str, resource_link: str, headers: dict[str, str], body: dict | None) -> dict:
        data = None if body is None else json.dumps(body).encode("utf-8")
        url = f"{self.endpoint}/{resource_link}"
        request = urllib.request.Request(url, data=data, headers=headers, method=verb)
        try:
            with urllib.request.urlopen(request) as response:
                raw = response.read().decode("utf-8")
                continuation = response.headers.get("x-ms-continuation")
        except urllib.error.HTTPError as error:
            detail = error.read().decode("utf-8", errors="replace")
            message = http_message(error.code, detail)
            if error.code == 401 and verb in {"PUT", "DELETE"}:
                message += " Queries can still succeed when the connection string is the read-only key. Use the primary read-write connection string."
            raise CosmosError(message) from None
        payload = json.loads(raw) if raw else {}
        if continuation and isinstance(payload, dict):
            payload["_continuation"] = continuation
        return payload


def authorization(verb: str, resource_type: str, resource_link: str, date: str, key: str) -> str:
    text = f"{verb.lower()}\n{resource_type.lower()}\n{resource_link.lower()}\n{date.lower()}\n\n"
    digest = hmac.new(base64.b64decode(key), text.encode("utf-8"), hashlib.sha256).digest()
    signature = base64.b64encode(digest).decode("utf-8")
    token = f"type=master&ver=1.0&sig={signature}"
    return urllib.parse.quote(token, safe="")


def http_message(status: int, detail: str) -> str:
    try:
        message = json.loads(detail).get("message")
    except json.JSONDecodeError:
        message = detail.strip()
    if not isinstance(message, str) or not message.strip():
        message = "request failed"
    first = message.strip().splitlines()[0]
    return f"HTTP {status}: {first}"


if __name__ == "__main__":
    main()
