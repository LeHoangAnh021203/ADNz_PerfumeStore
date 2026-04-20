import html
import json
import re
import sys
import time
import unicodedata
import urllib.parse
import urllib.request
from pathlib import Path

DATA_FILE = Path("public/data/ADNz_data.json")
UNRESOLVED_FILE = Path("/tmp/fragrantica_unresolved.json")
DETAIL_URL_RE = re.compile(
    r"^https://www\.fragrantica\.com/perfume/([^/]+)/([^/]+)-(\d+)\.html$"
)


def normalize(text: str) -> str:
    text = unicodedata.normalize("NFKD", text)
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return " ".join(text.split())


def token_set(text: str) -> set[str]:
    return {token for token in normalize(text).split() if token}


def extract_candidates(html_body: str) -> list[str]:
    links = []

    for raw_href in re.findall(r'<a[^>]+href="([^"]+)"', html_body):
        href = html.unescape(raw_href)

        if "duckduckgo.com/l/?uddg=" in href:
            parsed = urllib.parse.urlparse(href)
            values = urllib.parse.parse_qs(parsed.query).get("uddg")
            if values:
                href = values[0]

        if DETAIL_URL_RE.match(href):
            links.append(href)

    return list(dict.fromkeys(links))


def score_candidate(item: dict, candidate_url: str) -> float:
    match = DETAIL_URL_RE.match(candidate_url)
    if not match:
        return 0.0

    brand_part, fragrance_part, _ = match.groups()
    brand_tokens = token_set(item.get("brand", "")) | token_set(
        item.get("brand_slug", "")
    )
    fragrance_tokens = token_set(item.get("fragrance_name", "")) | token_set(
        item.get("full_name", "")
    )
    candidate_brand_tokens = token_set(brand_part.replace("-", " "))
    candidate_fragrance_tokens = token_set(fragrance_part.replace("-", " "))

    brand_overlap = len(brand_tokens & candidate_brand_tokens) / max(
        1, len(brand_tokens)
    )
    fragrance_overlap = len(fragrance_tokens & candidate_fragrance_tokens) / max(
        1, len(fragrance_tokens)
    )

    return 0.35 * brand_overlap + 0.65 * fragrance_overlap


def resolve_fragrantica_url(item: dict) -> tuple[str | None, str | None]:
    full_name = item.get("full_name") or (
        f"{item.get('brand', '')} {item.get('fragrance_name', '')}".strip()
    )
    search_url = (
        "https://html.duckduckgo.com/html/?q="
        + urllib.parse.quote(f"site:fragrantica.com/perfume {full_name} Fragrantica")
    )

    try:
        request = urllib.request.Request(
            search_url, headers={"User-Agent": "Mozilla/5.0"}
        )
        with urllib.request.urlopen(request, timeout=12) as response:
            body = response.read().decode("utf-8", "ignore")
    except Exception as exc:
        return None, f"request_failed: {exc}"

    candidates = extract_candidates(body)
    if not candidates:
        return None, "no_candidate"

    best_url = max(candidates, key=lambda url: score_candidate(item, url))
    best_score = score_candidate(item, best_url)

    if best_score < 0.55:
        return None, f"low_score:{best_score:.2f} best={best_url}"

    return best_url, None


def main() -> None:
    data = json.loads(DATA_FILE.read_text())
    unresolved = []
    updated = 0
    checked = 0
    limit = int(sys.argv[1]) if len(sys.argv) > 1 else 40

    for index, item in enumerate(data, start=1):
        current_url = str(item.get("source_url") or "")
        if DETAIL_URL_RE.match(current_url):
            item["notes_source_url"] = current_url
            continue

        if checked >= limit:
            break

        checked += 1
        resolved_url, reason = resolve_fragrantica_url(item)
        if resolved_url:
            item["source_url"] = resolved_url
            item["notes_source_url"] = resolved_url
            if item.get("source_quality") == "fragrantica_search_link":
                item["source_quality"] = "fragrantica_detail_link"
            if item.get("notes_source_quality") == "fragrantica_search_link":
                item["notes_source_quality"] = "fragrantica_detail_link"
            updated += 1
        else:
            unresolved.append(
                {
                    "index": index - 1,
                    "full_name": item.get("full_name") or item.get("slug"),
                    "reason": reason,
                    "current_url": current_url,
                }
            )

        print(
            f"checked={checked}/{limit} file_index={index - 1} updated={updated} unresolved={len(unresolved)}",
            flush=True,
        )

        time.sleep(0.1)

    DATA_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    UNRESOLVED_FILE.write_text(
        json.dumps(unresolved, ensure_ascii=False, indent=2) + "\n"
    )

    detail_count = sum(
        1 for item in data if DETAIL_URL_RE.match(str(item.get("source_url") or ""))
    )
    search_count = sum(
        1 for item in data if "/search/?query=" in str(item.get("source_url") or "")
    )

    print(f"updated={updated}")
    print(f"detail_count={detail_count}")
    print(f"search_count={search_count}")
    print(f"unresolved={len(unresolved)}")
    print(f"unresolved_file={UNRESOLVED_FILE}")


if __name__ == "__main__":
    main()
