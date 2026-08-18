export type MasteryStatus = "known" | "meh" | "unknown";
export type StudyDirection = "zh-en" | "en-zh" | "mixed";
export type StudyMode = "smart" | "random" | "all" | "weak" | "listening" | "mistakes";
export type CardType = "word" | "sentence";

export interface CardSeed {
  id: string;
  deckId: string;
  chinese: string;
  pinyin: string;
  english: string;
  type: CardType;
  exampleChinese?: string;
  examplePinyin?: string;
  exampleEnglish?: string;
  notes?: string;
}

export interface CardProgress {
  timesSeen: number;
  correctAnswers: number;
  incorrectAnswers: number;
  currentStreak: number;
  bestStreak: number;
  lastReviewedAt?: string;
  nextReviewAt?: string;
  lastIncorrectAt?: string;
  masteryScore: number;
  masteryStatus: MasteryStatus;
  createdAt: string;
  updatedAt: string;
}

export type Card = CardSeed & CardProgress;

export interface Deck {
  id: string;
  name: string;
  description: string;
  icon: string;
  isBuiltIn: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SessionAnswer {
  cardId: string;
  correct: boolean;
  answeredAt: string;
}

export interface SessionRecord {
  sessionId: string;
  deckId: string;
  mode: StudyMode;
  direction: StudyDirection;
  startedAt: string;
  completedAt: string;
  cardIds: string[];
  answers: SessionAnswer[];
  correctCount: number;
  incorrectCount: number;
  bestStreak: number;
  mistakes: string[];
}

export interface AppSettings {
  theme: "light" | "dark";
  autoPronounce: boolean;
  musicEnabled: boolean;
  direction: StudyDirection;
}

export interface PersistedState {
  version: number;
  progress: Record<string, CardProgress>;
  customDecks: Deck[];
  customCards: CardSeed[];
  sessions: SessionRecord[];
  settings: AppSettings;
  firstLaunchComplete: boolean;
}

export interface ImportRow {
  rowNumber: number;
  chinese: string;
  pinyin: string;
  english: string;
  exampleChinese?: string;
  examplePinyin?: string;
  exampleEnglish?: string;
  notes?: string;
  errors: string[];
}

export interface ActiveSession {
  sessionId: string;
  deckId: string;
  mode: StudyMode;
  direction: StudyDirection;
  startedAt: string;
  cards: Card[];
  currentIndex: number;
  answers: SessionAnswer[];
  currentStreak: number;
  bestStreak: number;
}
