import { useEffect, useMemo, useState } from "react";
import { AppShell, SettingsPanel, type PageName } from "./components/AppShell";
import { AddCardsDialog, CreateDeckDialog } from "./components/DeckDialogs";
import { FirstLaunch } from "./components/FirstLaunch";
import { MistakeReview, SessionResults, StudySession, StudySetup } from "./components/StudyFlow";
import { generateRandomSession, generateSmartSession, generateWeakSession } from "./engine/smartSession";
import { DeckPage } from "./pages/DeckPage";
import { HomePage } from "./pages/HomePage";
import { LibraryPage } from "./pages/LibraryPage";
import { ProgressPage } from "./pages/ProgressPage";
import { VocabularyPage, WordDetail } from "./pages/VocabularyPage";
import { musicService } from "./services/music";
import { useAppStore } from "./store/AppStore";
import type { Card, Deck, SessionRecord, StudyDirection, StudyMode } from "./types";

type Route =
  | { page: "home" | "library" | "progress" }
  | { page: "deck" | "vocabulary"; deckId: string }
  | { page: "word"; cardId: string };

interface SetupState { deckId: string; mode: StudyMode; cardIds?: string[] }
interface ActiveState { deckId: string; mode: StudyMode; direction: StudyDirection; cards: Card[] }
interface ResultState { record: SessionRecord; masteredDelta: number }

function parseRoute(): Route {
  const parts = window.location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  if (parts[0] === "deck" && parts[1]) return { page: "deck", deckId: parts[1] };
  if (parts[0] === "vocabulary" && parts[1]) return { page: "vocabulary", deckId: parts[1] };
  if (parts[0] === "word" && parts[1]) return { page: "word", cardId: parts[1] };
  if (parts[0] === "library" || parts[0] === "progress") return { page: parts[0] };
  return { page: "home" };
}

function setHash(path: string): void {
  window.location.hash = path;
}

export default function App() {
  const store = useAppStore();
  const [route, setRoute] = useState<Route>(() => parseRoute());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [createDeckOpen, setCreateDeckOpen] = useState(false);
  const [addCardsDeck, setAddCardsDeck] = useState<Deck | null>(null);
  const [setup, setSetup] = useState<SetupState | null>(null);
  const [active, setActive] = useState<ActiveState | null>(null);
  const [result, setResult] = useState<ResultState | null>(null);
  const [reviewingMistakes, setReviewingMistakes] = useState(false);

  useEffect(() => {
    if (!window.location.hash) setHash("home");
    window.scrollTo({ top: 0, behavior: "auto" });
    const update = () => {
      setRoute(parseRoute());
      window.scrollTo({ top: 0, behavior: "auto" });
    };
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);

  const navigate = (page: PageName) => setHash(page);
  const openDeck = (deckId: string) => setHash("deck/" + deckId);
  const deckForRoute = "deckId" in route ? store.decks.find((deck) => deck.id === route.deckId) : undefined;
  const cardForRoute = route.page === "word" ? store.getCard(route.cardId) : undefined;
  const setupDeck = setup ? store.decks.find((deck) => deck.id === setup.deckId) : undefined;

  const beginSession = (direction: StudyDirection) => {
    if (!setup) return;
    const allCards = store.getDeckCards(setup.deckId);
    let cards: Card[] = [];
    if (setup.cardIds) cards = setup.cardIds.map((id) => store.getCard(id)).filter((card): card is Card => Boolean(card));
    else if (setup.mode === "smart") cards = generateSmartSession(allCards, 20);
    else if (setup.mode === "random" || setup.mode === "listening") cards = generateRandomSession(allCards, 20);
    else if (setup.mode === "weak") cards = generateWeakSession(allCards);
    else cards = allCards;
    if (!cards.length) { setSetup(null); return; }
    store.updateSettings({ direction });
    setResult(null);
    setReviewingMistakes(false);
    setActive({ deckId: setup.deckId, mode: setup.mode, direction, cards });
    setSetup(null);
  };

  const completeSession = (record: SessionRecord, masteredDelta: number) => {
    store.completeSession(record);
    setActive(null);
    setResult({ record, masteredDelta });
  };

  const mistakeCards = useMemo(() => result?.record.mistakes.map((id) => store.getCard(id)).filter((card): card is Card => Boolean(card)) ?? [], [result, store]);

  const updateSettings = (next: Partial<typeof store.state.settings>) => {
    store.updateSettings(next);
    if (typeof next.musicEnabled === "boolean") void musicService.setEnabled(next.musicEnabled);
  };

  if (!store.state.firstLaunchComplete) {
    return <FirstLaunch onStart={() => { store.completeFirstLaunch(); setSetup({ deckId: "hsk-1", mode: "smart" }); }} onExplore={() => { store.completeFirstLaunch(); setHash("library"); }} />;
  }

  if (active) {
    const deck = store.decks.find((candidate) => candidate.id === active.deckId);
    return <StudySession cards={active.cards} deckName={deck?.name ?? "MandarinPlus"} deckId={active.deckId} mode={active.mode} direction={active.direction} autoPronounce={store.state.settings.autoPronounce} onRecord={store.recordAnswer} onComplete={completeSession} onExit={() => { setActive(null); openDeck(active.deckId); }} />;
  }

  if (result && reviewingMistakes) {
    return <MistakeReview cards={mistakeCards} onBack={() => setReviewingMistakes(false)} onQuiz={() => { setReviewingMistakes(false); setResult(null); setSetup({ deckId: result.record.deckId, mode: "mistakes", cardIds: result.record.mistakes }); }} />;
  }

  if (result) {
    return <SessionResults record={result.record} masteredDelta={result.masteredDelta} onReview={() => setReviewingMistakes(true)} onRetry={() => { setResult(null); setSetup({ deckId: result.record.deckId, mode: result.record.mode, cardIds: result.record.cardIds }); }} onDone={() => { const deckId = result.record.deckId; setResult(null); openDeck(deckId); }} />;
  }

  const activePage = route.page === "home" || route.page === "progress" ? route.page : "library";
  return (
    <AppShell activePage={activePage} onNavigate={navigate} onOpenSettings={() => setSettingsOpen(true)} settings={store.state.settings} onMusicToggle={() => updateSettings({ musicEnabled: !store.state.settings.musicEnabled })}>
      {route.page === "home" && <HomePage decks={store.decks} getCards={store.getDeckCards} sessions={store.state.sessions} onOpenDeck={openDeck} onStart={(deckId, mode) => setSetup({ deckId, mode })} onLibrary={() => navigate("library")} />}
      {route.page === "library" && <LibraryPage decks={store.decks} getCards={store.getDeckCards} onOpenDeck={openDeck} onOpenCard={(cardId) => setHash("word/" + cardId)} onCreate={() => setCreateDeckOpen(true)} />}
      {route.page === "progress" && <ProgressPage decks={store.decks} getCards={store.getDeckCards} sessions={store.state.sessions} onOpenDeck={openDeck} />}
      {route.page === "deck" && deckForRoute && <DeckPage deck={deckForRoute} cards={store.getDeckCards(deckForRoute.id)} onBack={() => navigate("library")} onStart={(mode) => setSetup({ deckId: deckForRoute.id, mode })} onVocabulary={() => setHash("vocabulary/" + deckForRoute.id)} onProgress={() => navigate("progress")} onAddCards={() => setAddCardsDeck(deckForRoute)} />}
      {route.page === "vocabulary" && deckForRoute && <VocabularyPage deck={deckForRoute} cards={store.getDeckCards(deckForRoute.id)} onBack={() => openDeck(deckForRoute.id)} onOpenCard={(cardId) => setHash("word/" + cardId)} />}
      {route.page === "word" && cardForRoute && <WordDetail card={cardForRoute} onBack={() => setHash("vocabulary/" + cardForRoute.deckId)} />}
      {(route.page === "deck" || route.page === "vocabulary") && !deckForRoute && <div className="page missing-page"><h1>Deck not found</h1><button className="primary-button" onClick={() => navigate("library")}>Return to library</button></div>}
      {route.page === "word" && !cardForRoute && <div className="page missing-page"><h1>Word not found</h1><button className="primary-button" onClick={() => navigate("library")}>Return to library</button></div>}

      {settingsOpen && <SettingsPanel settings={store.state.settings} onChange={updateSettings} onClose={() => setSettingsOpen(false)} />}
      {createDeckOpen && <CreateDeckDialog onCreate={store.createDeck} onClose={() => setCreateDeckOpen(false)} onCreated={(deck) => { setCreateDeckOpen(false); setAddCardsDeck(deck); openDeck(deck.id); }} />}
      {addCardsDeck && <AddCardsDialog deck={addCardsDeck} onAddCards={store.addCards} onClose={() => setAddCardsDeck(null)} />}
      {setup && setupDeck && <StudySetup deckName={setupDeck.name} mode={setup.mode} defaultDirection={store.state.settings.direction} onStart={beginSession} onClose={() => setSetup(null)} />}
    </AppShell>
  );
}
