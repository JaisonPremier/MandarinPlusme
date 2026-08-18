import { createInitialProgress, recordAnswer, withProgress } from "./mastery";
import { generateRandomSession, generateSmartSession } from "./smartSession";
import type { Card, CardSeed } from "../types";

function card(index: number): Card {
  const seed: CardSeed = { id: "c" + index, deckId: "deck", chinese: "词" + index, pinyin: "cí", english: "word", type: "word" };
  let progress = createInitialProgress();
  if (index % 3 === 0) progress = recordAnswer(progress, false);
  if (index % 3 === 1) { progress = recordAnswer(progress, true); progress = recordAnswer(progress, true); }
  if (index % 3 === 2) for (let count = 0; count < 5; count += 1) progress = recordAnswer(progress, true);
  return withProgress(seed, progress);
}

describe("Session selection", () => {
  const cards = Array.from({ length: 45 }, (_, index) => card(index));
  it("never duplicates cards in Random 20", () => {
    const selected = generateRandomSession(cards, 20);
    expect(new Set(selected.map((item) => item.id)).size).toBe(20);
  });
  it("fills Smart 20 with unique cards and prioritizes weaker vocabulary", () => {
    const selected = generateSmartSession(cards, 20);
    expect(new Set(selected.map((item) => item.id)).size).toBe(20);
    expect(selected.filter((item) => item.masteryStatus !== "known").length).toBeGreaterThanOrEqual(15);
  });
});
