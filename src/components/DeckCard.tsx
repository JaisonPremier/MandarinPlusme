import { ArrowUpRight } from "@phosphor-icons/react";
import { deckStats } from "../utils/stats";
import type { Card, Deck } from "../types";
import { MasteryBar } from "./Status";

export function DeckCard({ deck, cards, onOpen }: { deck: Deck; cards: Card[]; onOpen: () => void }) {
  const stats = deckStats(cards);
  return (
    <button className="deck-card" onClick={onOpen} aria-label={"Open " + deck.name}>
      <div className="deck-card-top">
        <span className="deck-glyph" aria-hidden="true">{deck.icon}</span>
        <ArrowUpRight size={20} weight="bold" />
      </div>
      <div>
        <p className="eyebrow">{stats.total} words</p>
        <h3>{deck.name}</h3>
        <p>{deck.description}</p>
      </div>
      <div className="deck-card-progress">
        <div><span>{stats.progress}% mastered</span><span>{stats.known}/{stats.total}</span></div>
        <MasteryBar {...stats} />
      </div>
    </button>
  );
}
