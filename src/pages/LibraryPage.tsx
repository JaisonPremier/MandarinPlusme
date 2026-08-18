import { MagnifyingGlass, Plus } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { DeckCard } from "../components/DeckCard";
import { Mascot } from "../components/Mascot";
import type { Card, Deck } from "../types";

function normalize(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function LibraryPage({ decks, getCards, onOpenDeck, onOpenCard, onCreate }: { decks: Deck[]; getCards: (deckId: string) => Card[]; onOpenDeck: (id: string) => void; onOpenCard: (id: string) => void; onCreate: () => void }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const needle = normalize(query.trim());
    return decks.flatMap((deck) => getCards(deck.id).map((card) => ({ card, deck })))
      .filter(({ card }) => normalize(card.chinese + " " + card.pinyin + " " + card.english).includes(needle))
      .slice(0, 8);
  }, [query, decks, getCards]);
  return (
    <div className="page library-page">
      <header className="page-heading split-heading">
        <div><p className="eyebrow">Library</p><h1>Every word has<br />a place to grow.</h1><p>HSK foundations, your own discoveries, and future adventures—all powered by the same learning engine.</p></div>
        <Mascot state="tea" width={150} />
      </header>
      <section className="global-search-section">
        <label className="search-field"><MagnifyingGlass size={21} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search every deck: 朋友, pengyou, friend…" aria-label="Search all vocabulary" /></label>
        {query.trim() && <div className="global-results">{results.length ? results.map(({ card, deck }) => <button key={card.id} onClick={() => onOpenCard(card.id)}><span><strong lang="zh-CN">{card.chinese}</strong><small>{card.pinyin}</small></span><span>{card.english}</span><small>{deck.name}</small><span>→</span></button>) : <p>No vocabulary matches “{query}”. Try Chinese, plain pinyin, or English.</p>}</div>}
      </section>
      <div className="deck-grid library-grid">
        {decks.map((deck) => <DeckCard key={deck.id} deck={deck} cards={getCards(deck.id)} onOpen={() => onOpenDeck(deck.id)} />)}
        <button className="create-deck-card" onClick={onCreate}><span><Plus size={28} /></span><strong>Create a deck</strong><small>Trips, class notes, business words—anything.</small></button>
      </div>
      <div className="hsk3-ready"><span className="deck-glyph">三</span><div><p className="eyebrow">Ready when you are</p><h3>HSK 3 data is prepared</h3><p>300 validated words are already compatible with the deck engine and can be activated without changing the app.</p></div></div>
    </div>
  );
}
