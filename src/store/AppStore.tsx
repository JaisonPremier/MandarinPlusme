import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { BUILTIN_VOCABULARY } from "../data/builtinVocabulary";
import { BUILTIN_DECKS, PERSONAL_DECK } from "../data/decks";
import { recordAnswer as updateMastery, withProgress } from "../engine/mastery";
import { DEFAULT_STATE, loadState, saveState } from "../services/storage";
import type { AppSettings, Card, CardSeed, Deck, PersistedState, SessionRecord } from "../types";

interface AppStoreValue {
  state: PersistedState;
  decks: Deck[];
  getDeckCards: (deckId: string) => Card[];
  getCard: (cardId: string) => Card | undefined;
  recordAnswer: (cardId: string, correct: boolean) => Card | undefined;
  completeSession: (session: SessionRecord) => void;
  createDeck: (name: string, description: string, icon: string) => Deck;
  addCards: (cards: CardSeed[]) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  completeFirstLaunch: () => void;
}

const AppStoreContext = createContext<AppStoreValue | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(() => typeof window === "undefined" ? DEFAULT_STATE : loadState());

  useEffect(() => saveState(state), [state]);
  useEffect(() => {
    document.documentElement.dataset.theme = state.settings.theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", state.settings.theme === "dark" ? "#171512" : "#f7f2e8");
  }, [state.settings.theme]);

  const decks = useMemo(() => [...BUILTIN_DECKS, PERSONAL_DECK, ...state.customDecks], [state.customDecks]);
  const allSeeds = useMemo(() => {
    const builtIns = BUILTIN_DECKS.flatMap((deck) => BUILTIN_VOCABULARY[deck.id] ?? []);
    return [...builtIns, ...state.customCards];
  }, [state.customCards]);
  const cards = useMemo(() => allSeeds.map((seed) => withProgress(seed, state.progress[seed.id])), [allSeeds, state.progress]);

  const getDeckCards = useCallback((deckId: string) => cards.filter((card) => card.deckId === deckId), [cards]);
  const getCard = useCallback((cardId: string) => cards.find((card) => card.id === cardId), [cards]);

  const recordAnswer = useCallback((cardId: string, correct: boolean) => {
    const card = cards.find((candidate) => candidate.id === cardId);
    if (!card) return undefined;
    const nextProgress = updateMastery(card, correct);
    setState((current) => ({ ...current, progress: { ...current.progress, [cardId]: nextProgress } }));
    return { ...card, ...nextProgress };
  }, [cards]);

  const completeSession = useCallback((session: SessionRecord) => {
    setState((current) => ({ ...current, sessions: [...current.sessions, session] }));
  }, []);

  const createDeck = useCallback((name: string, description: string, icon: string) => {
    const timestamp = new Date().toISOString();
    const deck: Deck = {
      id: "deck-" + crypto.randomUUID(),
      name: name.trim(),
      description: description.trim() || "A personal Mandarin learning deck.",
      icon: icon.trim() || "词",
      isBuiltIn: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    setState((current) => ({ ...current, customDecks: [...current.customDecks, deck] }));
    return deck;
  }, []);

  const addCards = useCallback((newCards: CardSeed[]) => {
    setState((current) => ({ ...current, customCards: [...current.customCards, ...newCards] }));
  }, []);

  const updateSettings = useCallback((settings: Partial<AppSettings>) => {
    setState((current) => ({ ...current, settings: { ...current.settings, ...settings } }));
  }, []);

  const completeFirstLaunch = useCallback(() => {
    setState((current) => ({ ...current, firstLaunchComplete: true }));
  }, []);

  const value = useMemo(() => ({
    state,
    decks,
    getDeckCards,
    getCard,
    recordAnswer,
    completeSession,
    createDeck,
    addCards,
    updateSettings,
    completeFirstLaunch,
  }), [state, decks, getDeckCards, getCard, recordAnswer, completeSession, createDeck, addCards, updateSettings, completeFirstLaunch]);

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore(): AppStoreValue {
  const store = useContext(AppStoreContext);
  if (!store) throw new Error("useAppStore must be used inside AppStoreProvider");
  return store;
}
