"""Builds the bundled passages (src/content/bundled/*.json) from Project Gutenberg plain-text files.

Usage:
    mkdir -p /tmp/gutenberg
    for id in 215 120 36; do curl -sL -o /tmp/gutenberg/pg$id.txt https://www.gutenberg.org/cache/epub/$id/pg$id.txt; done
    python3 -I scripts/build_passages.py /tmp/gutenberg src/content/bundled

Each excerpt runs from the line after a chapter heading to the line before a later heading.
Chapter headings inside an excerpt are dropped, hard line wraps are joined, and Gutenberg's
_italic_ markers are removed. Words are otherwise verbatim. Only text between the start and end
headings is read, so the Gutenberg header, footer and trademark never reach the output.
"""

import json
import re
import sys
from pathlib import Path

PASSAGES = [
    {
        "id": "call-of-the-wild",
        "title": "The Call of the Wild",
        "file": "pg215.txt",
        "start_after": "Chapter I. Into the Primitive",
        "end_before": "Chapter II. The Law of Club and Fang",
        "drop": [],
    },
    {
        "id": "treasure-island",
        "title": "Treasure Island",
        "file": "pg120.txt",
        "start_after": "The Old Sea-dog at the Admiral Benbow",
        "end_before": "III",
        "drop": ["II Black Dog Appears and Disappears"],
    },
    {
        "id": "war-of-the-worlds",
        "title": "The War of the Worlds",
        "file": "pg36.txt",
        "start_after": "THE EVE OF THE WAR.",
        "end_before": "III.",
        "drop": ["II. THE FALLING STAR."],
    },
]


def excerpt_lines(lines, start_after, end_before):
    start = next(i for i, line in enumerate(lines) if line == start_after) + 1
    end = next(i for i in range(start, len(lines)) if lines[i] == end_before)
    return lines[start:end]


def paragraphs(lines):
    out, current = [], []
    for line in lines + [""]:
        if line.strip():
            current.append(line.strip())
        elif current:
            out.append(re.sub(r"\s+", " ", " ".join(current)).replace("_", ""))
            current = []
    return out


def main(source_dir, out_dir):
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    for spec in PASSAGES:
        text = (Path(source_dir) / spec["file"]).read_text(encoding="utf-8").replace("\r\n", "\n")
        paras = [p for p in paragraphs(excerpt_lines(text.split("\n"), spec["start_after"], spec["end_before"]))
                 if p not in spec["drop"]]
        passage = {"id": spec["id"], "title": spec["title"], "source": "bundled", "paragraphs": paras}
        (out / f"{spec['id']}.json").write_text(json.dumps(passage, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        words = sum(len(p.split()) for p in paras)
        print(f"{spec['id']}: {len(paras)} paragraphs, {words} words")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
