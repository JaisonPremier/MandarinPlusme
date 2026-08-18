import type { Deck } from "../types";

const BUILT_AT = "2026-08-18T00:00:00.000Z";

export const BUILTIN_DECKS: Deck[] = [
  {
    id: "hsk-1",
    name: "HSK 1",
    description: "Your first 150 essential Mandarin words.",
    icon: "一",
    isBuiltIn: true,
    createdAt: BUILT_AT,
    updatedAt: BUILT_AT,
  },
  {
    id: "hsk-2",
    name: "HSK 2",
    description: "Build range and confidence with 150 more words.",
    icon: "二",
    isBuiltIn: true,
    createdAt: BUILT_AT,
    updatedAt: BUILT_AT,
  },
];

export const PERSONAL_DECK: Deck = {
  id: "my-mandarin",
  name: "My Mandarin",
  description: "Words and sentences you collect along the way.",
  icon: "我",
  isBuiltIn: false,
  createdAt: BUILT_AT,
  updatedAt: BUILT_AT,
};

export const HSK3_READY = {
  id: "hsk-3",
  name: "HSK 3",
  cardCount: 300,
};
