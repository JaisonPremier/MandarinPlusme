import type { Card, Deck, SessionRecord } from "../types";

export function deckStats(cards: Card[]) {
  const known = cards.filter((card) => card.masteryStatus === "known").length;
  const meh = cards.filter((card) => card.masteryStatus === "meh").length;
  const unknown = cards.length - known - meh;
  const seen = cards.filter((card) => card.timesSeen > 0).length;
  const answers = cards.reduce((sum, card) => sum + card.timesSeen, 0);
  const correct = cards.reduce((sum, card) => sum + card.correctAnswers, 0);
  return {
    total: cards.length,
    known,
    meh,
    unknown,
    seen,
    accuracy: answers ? Math.round((correct / answers) * 100) : 0,
    progress: cards.length ? Math.round((known / cards.length) * 100) : 0,
  };
}

function dateKey(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()].join("-");
}

export function activityStats(sessions: SessionRecord[]) {
  const today = dateKey(new Date());
  const reviewedToday = sessions
    .filter((session) => dateKey(session.completedAt) === today)
    .reduce((sum, session) => sum + session.answers.length, 0);
  const masteredToday = 0;
  const activityDays = new Set(sessions.filter((session) => session.answers.length > 0).map((session) => dateKey(session.completedAt)));
  let streak = 0;
  const cursor = new Date();
  if (!activityDays.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (activityDays.has(dateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  const weekAgo = Date.now() - 7 * 86_400_000;
  const reviewsThisWeek = sessions
    .filter((session) => Date.parse(session.completedAt) >= weekAgo)
    .reduce((sum, session) => sum + session.answers.length, 0);
  return { reviewedToday, masteredToday, streak, reviewsThisWeek };
}

export function globalStats(decks: Deck[], getCards: (deckId: string) => Card[], sessions: SessionRecord[]) {
  const cards = decks.flatMap((deck) => getCards(deck.id));
  return { ...deckStats(cards), ...activityStats(sessions) };
}
