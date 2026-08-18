import type { Card, CardProgress, CardSeed, MasteryStatus } from "../types";

const DAY = 86_400_000;

export function createInitialProgress(now = new Date()): CardProgress {
  const timestamp = now.toISOString();
  return {
    timesSeen: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    currentStreak: 0,
    bestStreak: 0,
    masteryScore: 0,
    masteryStatus: "unknown",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function calculateScore(progress: CardProgress): number {
  if (progress.timesSeen === 0) return 0;
  const accuracy = progress.correctAnswers / progress.timesSeen;
  const streakBonus = Math.min(progress.currentStreak, 5) * 11;
  const experience = Math.min(progress.timesSeen, 12) * 2;
  const errorPenalty = Math.min(progress.incorrectAnswers, 6) * 4;
  const recentErrorPenalty = progress.lastIncorrectAt && Date.now() - Date.parse(progress.lastIncorrectAt) < 3 * DAY ? 12 : 0;
  return Math.max(0, Math.min(100, Math.round(accuracy * 45 + streakBonus + experience - errorPenalty - recentErrorPenalty)));
}

export function getStatus(progress: CardProgress): MasteryStatus {
  if (progress.timesSeen === 0) return "unknown";
  if (progress.currentStreak >= 5 && progress.masteryScore >= 72) return "known";
  if (progress.masteryScore >= 35 || progress.correctAnswers >= 2) return "meh";
  return "unknown";
}

function scheduleNextReview(progress: CardProgress, correct: boolean, now: Date): string {
  const intervalDays = correct
    ? progress.currentStreak >= 5 ? 14 : progress.currentStreak >= 3 ? 5 : 1
    : 0.15;
  return new Date(now.getTime() + intervalDays * DAY).toISOString();
}

export function recordAnswer(progress: CardProgress, correct: boolean, now = new Date()): CardProgress {
  const timestamp = now.toISOString();
  const next: CardProgress = {
    ...progress,
    timesSeen: progress.timesSeen + 1,
    correctAnswers: progress.correctAnswers + (correct ? 1 : 0),
    incorrectAnswers: progress.incorrectAnswers + (correct ? 0 : 1),
    currentStreak: correct ? progress.currentStreak + 1 : 0,
    bestStreak: correct ? Math.max(progress.bestStreak, progress.currentStreak + 1) : progress.bestStreak,
    lastReviewedAt: timestamp,
    lastIncorrectAt: correct ? progress.lastIncorrectAt : timestamp,
    updatedAt: timestamp,
    masteryScore: 0,
    masteryStatus: progress.masteryStatus,
  };
  next.masteryScore = calculateScore(next);
  next.masteryStatus = getStatus(next);
  next.nextReviewAt = scheduleNextReview(next, correct, now);
  return next;
}

export function withProgress(card: CardSeed, progress?: CardProgress): Card {
  return { ...card, ...(progress ?? createInitialProgress()) };
}
