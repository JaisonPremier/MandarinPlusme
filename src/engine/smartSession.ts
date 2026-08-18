import type { Card } from "../types";

function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function urgency(card: Card): number {
  const due = !card.nextReviewAt || Date.parse(card.nextReviewAt) <= Date.now();
  const recentMistake = card.lastIncorrectAt && Date.now() - Date.parse(card.lastIncorrectAt) < 7 * 86_400_000;
  return (recentMistake ? 100 : 0)
    + (card.masteryStatus === "unknown" ? 60 : card.masteryStatus === "meh" ? 35 : 0)
    + (due ? 22 : 0)
    + (card.timesSeen === 0 ? 14 : 0)
    - card.masteryScore * 0.15;
}

export function generateSmartSession(cards: Card[], size = 20): Card[] {
  if (cards.length <= size) return shuffled(cards);
  const weak = shuffled(cards.filter((card) => card.masteryStatus === "unknown")).sort((a, b) => urgency(b) - urgency(a));
  const medium = shuffled(cards.filter((card) => card.masteryStatus === "meh")).sort((a, b) => urgency(b) - urgency(a));
  const strong = shuffled(cards.filter((card) => card.masteryStatus === "known")).sort((a, b) => urgency(b) - urgency(a));
  const selected = [...weak.slice(0, 10), ...medium.slice(0, 5), ...strong.slice(0, 5)];
  const used = new Set(selected.map((card) => card.id));
  const remainder = shuffled(cards.filter((card) => !used.has(card.id))).sort((a, b) => urgency(b) - urgency(a));
  return [...selected, ...remainder].slice(0, size);
}

export function generateRandomSession(cards: Card[], size = 20): Card[] {
  return shuffled(cards).slice(0, Math.min(size, cards.length));
}

export function generateWeakSession(cards: Card[]): Card[] {
  return shuffled(cards.filter((card) => card.masteryStatus !== "known"))
    .sort((a, b) => urgency(b) - urgency(a));
}
