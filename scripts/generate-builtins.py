from pathlib import Path
from openpyxl import load_workbook
import json
import re

ROOT = Path(__file__).resolve().parents[1]
WORDS = ROOT / "Words"
OUTPUT = ROOT / "src" / "data" / "builtinVocabulary.ts"

# The supplied sheets leave English blank for nine genuine grammar particles.
# Preserve those rows and add concise study glosses instead of dropping them.
PARTICLE_GLOSSES = {
    "的": "possessive / descriptive particle",
    "了": "completed-action / change particle",
    "吗": "yes-no question particle",
    "呢": "follow-up / ongoing-action particle",
    "得": "complement particle",
    "着": "continuing-state particle",
    "过": "past-experience particle",
    "吧": "suggestion / softening particle",
    "地": "adverbial particle",
}


def slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def read_workbook(path: Path, deck_id: str):
    workbook = load_workbook(path, data_only=True)
    sheet = workbook.active
    rows = list(sheet.values)
    headers = [str(value).strip().lower() if value else "" for value in rows[0]]
    columns = {name: index for index, name in enumerate(headers)}
    required = ("chinese", "pinyin", "english")
    if any(name not in columns for name in required):
        raise ValueError(f"{path.name} is missing a required column")
    cards = []
    for row_number, row in enumerate(rows[1:], start=2):
        values = {}
        for name in required:
            value = row[columns[name]] if columns[name] < len(row) else None
            values[name] = str(value).strip() if value is not None else ""
        if values["chinese"] and values["pinyin"] and not values["english"]:
            values["english"] = PARTICLE_GLOSSES.get(values["chinese"], "grammar particle")
        if not all(values.values()):
            continue
        cards.append({
            "id": f"{deck_id}-{row_number - 1}-{slug(values['chinese']) or row_number}",
            "deckId": deck_id,
            "chinese": values["chinese"],
            "pinyin": values["pinyin"],
            "english": values["english"],
            "type": "word",
        })
    return cards


decks = {}
for level in (1, 2, 3):
    deck_id = f"hsk-{level}"
    workbook = WORDS / f"HSK{level}" / f"HSK-{level}-Flashcards.xlsx"
    decks[deck_id] = read_workbook(workbook, deck_id)

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
OUTPUT.write_text(
    "// Generated from the original workbooks in Words/. Do not edit by hand.\n"
    "import type { CardSeed } from \"../types\";\n\n"
    "export const BUILTIN_VOCABULARY: Record<string, CardSeed[]> = "
    + json.dumps(decks, ensure_ascii=False, indent=2)
    + ";\n",
    encoding="utf-8",
)
print(f"Generated {sum(len(cards) for cards in decks.values())} cards at {OUTPUT}")
