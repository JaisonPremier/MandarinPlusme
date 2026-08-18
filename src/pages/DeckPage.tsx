import { ArrowLeft, Books, Brain, ChartDonut, Headphones, ListMagnifyingGlass, Plus, Shuffle, Target, Timer } from "@phosphor-icons/react";
import { Mascot } from "../components/Mascot";
import { MasteryBar } from "../components/Status";
import type { Card, Deck, StudyMode } from "../types";
import { deckStats } from "../utils/stats";

const modes: { mode: StudyMode; title: string; description: string; icon: typeof Brain; accent?: boolean }[] = [
  { mode: "smart", title: "Smart 20", description: "The words that need you most", icon: Brain, accent: true },
  { mode: "random", title: "Random 20", description: "A fresh shuffle every time", icon: Shuffle },
  { mode: "all", title: "Study all", description: "Move through the full deck", icon: Books },
  { mode: "weak", title: "Review weak words", description: "Focus on meh + unknown", icon: Target },
  { mode: "listening", title: "Listening", description: "Train your Mandarin ear", icon: Headphones },
];

interface DeckPageProps {
  deck: Deck;
  cards: Card[];
  onBack: () => void;
  onStart: (mode: StudyMode) => void;
  onVocabulary: () => void;
  onProgress: () => void;
  onAddCards: () => void;
}

export function DeckPage({ deck, cards, onBack, onStart, onVocabulary, onProgress, onAddCards }: DeckPageProps) {
  const stats = deckStats(cards);
  return (
    <div className="page deck-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> Library</button>
      <section className="deck-hero">
        <div className="deck-title-block">
          <span className="large-glyph">{deck.icon}</span>
          <div><p className="eyebrow">{cards.length} words</p><h1>{deck.name}</h1><p>{deck.description}</p></div>
        </div>
        <div className="deck-progress-card">
          <div className="progress-orbit" style={{ "--progress": stats.progress } as React.CSSProperties}><strong>{stats.progress}%</strong><span>mastered</span></div>
          <div className="deck-breakdown">
            <div><span className="status-dot known" /><strong>{stats.known}</strong><small>I know it!</small></div>
            <div><span className="status-dot meh" /><strong>{stats.meh}</strong><small>Meh</small></div>
            <div><span className="status-dot unknown" /><strong>{stats.unknown}</strong><small>Not yet</small></div>
          </div>
          <MasteryBar {...stats} />
        </div>
      </section>

      {cards.length ? (
        <section className="mode-section">
          <div className="section-heading"><div><p className="eyebrow">Choose your focus</p><h2>Let’s learn</h2></div><span className="time-note"><Timer size={18} /> Most sessions take 5 minutes</span></div>
          <div className="mode-grid">
            {modes.map(({ mode, title, description, icon: Icon, accent }) => <button key={mode} className={"mode-button" + (accent ? " featured" : "")} onClick={() => onStart(mode)}><span className="mode-icon"><Icon size={26} weight={accent ? "fill" : "regular"} /></span><span><strong>{title}</strong><small>{description}</small></span><span className="mode-arrow">→</span></button>)}
          </div>
        </section>
      ) : (
        <section className="empty-state"><Mascot state="reading" width={155} /><div><p className="eyebrow">A fresh notebook</p><h2>Add your first Mandarin word.</h2><p>Words and sentences you add here get the full smart-learning treatment.</p><button className="primary-button" onClick={onAddCards}><Plus size={18} /> Add words</button></div></section>
      )}

      <section className="deck-tools">
        <button onClick={onVocabulary}><ListMagnifyingGlass size={24} /><span><strong>Vocabulary list</strong><small>Search all {cards.length} words</small></span></button>
        <button onClick={onProgress}><ChartDonut size={24} /><span><strong>Deck statistics</strong><small>{stats.accuracy}% lifetime accuracy</small></span></button>
        {!deck.isBuiltIn && <button onClick={onAddCards}><Plus size={24} /><span><strong>Add vocabulary</strong><small>Manual or Excel import</small></span></button>}
      </section>
      <div className="deck-mascot-whisper"><Mascot state={stats.progress > 60 ? "proud" : "focused"} width={95} /><span>{stats.seen ? "Every review makes the path clearer." : "Start anywhere. I’ll remember the rest."}</span></div>
    </div>
  );
}
