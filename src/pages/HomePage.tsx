import { ArrowRight, Fire, Lightning, Play, SpeakerHigh, Timer } from "@phosphor-icons/react";
import { DeckCard } from "../components/DeckCard";
import { Mascot } from "../components/Mascot";
import type { Card, Deck, SessionRecord, StudyMode } from "../types";
import { activityStats } from "../utils/stats";

interface HomePageProps {
  decks: Deck[];
  getCards: (deckId: string) => Card[];
  sessions: SessionRecord[];
  onOpenDeck: (deckId: string) => void;
  onStart: (deckId: string, mode: StudyMode) => void;
  onLibrary: () => void;
}

export function HomePage({ decks, getCards, sessions, onOpenDeck, onStart, onLibrary }: HomePageProps) {
  const activity = activityStats(sessions);
  const studyDeck = decks.find((deck) => getCards(deck.id).length > 0);
  const featuredDecks = decks.filter((deck) => getCards(deck.id).length > 0).slice(0, 2);
  return (
    <div className="page home-page">
      <section className="home-hero">
        <div className="hero-copy reveal-in">
          <p className="eyebrow"><span className="live-dot" /> Your daily Mandarin</p>
          <h1>Meet the words<br />you’ll <em>remember.</em></h1>
          <p className="hero-subtitle">Smart practice, clear progress, and a panda who believes in your tones.</p>
          <div className="hero-actions">
            <button className="primary-button" disabled={!studyDeck} onClick={() => studyDeck && onStart(studyDeck.id, "smart")}><Play size={18} weight="fill" /> Start today’s session</button>
            <button className="text-button" onClick={onLibrary}>Explore decks <ArrowRight size={18} /></button>
          </div>
          <div className="hero-meta">
            <span><Fire size={21} weight="fill" /> <strong>{activity.streak}</strong> day streak</span>
            <span><SpeakerHigh size={21} weight="fill" /> Native Mandarin audio</span>
          </div>
        </div>
        <div className="daily-card reveal-in delay-1">
          <div className="daily-card-copy">
            <p className="eyebrow">Today’s session</p>
            <h2>20 words.<br />One good habit.</h2>
            <div className="daily-details"><span><Lightning size={18} weight="fill" /> Smart mix</span><span><Timer size={18} /> ~5 min</span></div>
          </div>
          <Mascot state="home" width={315} className="home-scene" />
          <button className="round-play" disabled={!studyDeck} onClick={() => studyDeck && onStart(studyDeck.id, "smart")} aria-label="Start today's session"><Play size={24} weight="fill" /></button>
        </div>
      </section>

      <section className="home-section">
        <div className="section-heading"><div><p className="eyebrow">Pick up where you left off</p><h2>Your learning spaces</h2></div><button className="text-button" onClick={onLibrary}>View library <ArrowRight size={18} /></button></div>
        <div className="deck-grid">
          {featuredDecks.map((deck) => <DeckCard key={deck.id} deck={deck} cards={getCards(deck.id)} onOpen={() => onOpenDeck(deck.id)} />)}
        </div>
      </section>

      <section className="activity-strip">
        <div><span>Today</span><strong>{activity.reviewedToday}</strong><small>cards reviewed</small></div>
        <div><span>This week</span><strong>{activity.reviewsThisWeek}</strong><small>total reviews</small></div>
        <div className="mascot-note"><Mascot state={activity.reviewedToday ? "happy" : "reading"} width={105} /><p>{activity.reviewedToday ? "Nice work today!" : "Pandao has your next word ready."}<small>{activity.reviewedToday ? "Come back tomorrow to keep the rhythm." : "A five-minute session is plenty."}</small></p></div>
      </section>
    </div>
  );
}
