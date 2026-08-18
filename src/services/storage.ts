import type { PersistedState } from "../types";

const STORAGE_KEY = "mandarinplus.state.v1";

export const DEFAULT_STATE: PersistedState = {
  version: 1,
  progress: {},
  customDecks: [],
  customCards: [],
  sessions: [],
  settings: {
    theme: "light",
    autoPronounce: true,
    musicEnabled: false,
    direction: "zh-en",
  },
  firstLaunchComplete: false,
};

export function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const saved = JSON.parse(raw) as Partial<PersistedState>;
    return {
      ...DEFAULT_STATE,
      ...saved,
      progress: saved.progress ?? {},
      customDecks: saved.customDecks ?? [],
      customCards: saved.customCards ?? [],
      sessions: saved.sessions ?? [],
      settings: { ...DEFAULT_STATE.settings, ...saved.settings },
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveState(state: PersistedState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, sessions: state.sessions.slice(-500) }));
}
