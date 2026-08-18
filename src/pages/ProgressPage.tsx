import { Fire, Medal, TrendUp } from "@phosphor-icons/react";
import { Mascot } from "../components/Mascot";
import { MasteryBar } from "../components/Status";
import type { Card, Deck, SessionRecord } from "../types";
import { deckStats, globalStats } from "../utils/stats";

export function ProgressPage({ decks, getCards, sessions, onOpenDeck }: { decks: Deck[]; getCards: (deckId: string) => Card[]; sessions: SessionRecord[]; onOpenDeck: (id: string) => void }) {
  const stats = globalStats(decks, getCards, sessions);
  return (
    <div className="page progress-page">
      <header className="progress-header"><div><p className="eyebrow">Your progress</p><h1>Small sessions.<br /><em>Real momentum.</em></h1><p>Every answer across every mode contributes to this one learning profile.</p></div><Mascot state={stats.streak ? "proud" : "neutral"} width={190} /></header>
      <section className="metric-grid">
        <div className="metric hero-metric"><span>Words mastered</span><strong>{stats.known}</strong><small>of {stats.total} total words</small><TrendUp size={30} /></div>
        <div className="metric"><span>Still learning</span><strong>{stats.meh}</strong><small>in the middle zone</small></div>
        <div className="metric"><span>Reviews this week</span><strong>{stats.reviewsThisWeek}</strong><small>across all sessions</small></div>
        <div className="metric streak-metric"><Fire size={25} weight="fill" /><span>Current streak</span><strong>{stats.streak}</strong><small>days, gently counted</small></div>
      </section>
      <section className="progress-decks">
        <div className="section-heading"><div><p className="eyebrow">By learning space</p><h2>Deck progress</h2></div><Medal size={30} /></div>
        <div className="progress-deck-list">
          {decks.filter((deck) => getCards(deck.id).length).map((deck) => {
            const deckData = deckStats(getCards(deck.id));
            return <button key={deck.id} onClick={() => onOpenDeck(deck.id)}><span className="deck-glyph">{deck.icon}</span><span className="progress-deck-name"><strong>{deck.name}</strong><small>{deckData.seen} of {deckData.total} seen · {deckData.accuracy}% accuracy</small></span><span className="progress-deck-bar"><MasteryBar {...deckData} /><small>{deckData.progress}% mastered</small></span><span>→</span></button>;
          })}
        </div>
      </section>
    </div>
  );
}
