import { ArrowLeft, MagnifyingGlass, SpeakerHigh, X } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { Mascot } from "../components/Mascot";
import { STATUS_LABELS, StatusBadge } from "../components/Status";
import { mandarinAudio } from "../services/audio";
import type { Card, Deck, MasteryStatus } from "../types";

type Filter = "all" | MasteryStatus;

function searchable(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function VocabularyPage({ deck, cards, onBack, onOpenCard }: { deck: Deck; cards: Card[]; onBack: () => void; onOpenCard: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [visibleCount, setVisibleCount] = useState(60);
  const filtered = useMemo(() => cards.filter((card) => {
    const matchesFilter = filter === "all" || card.masteryStatus === filter;
    const haystack = searchable(card.chinese + " " + card.pinyin + " " + card.english);
    return matchesFilter && haystack.includes(searchable(query.trim()));
  }), [cards, query, filter]);
  useEffect(() => setVisibleCount(60), [query, filter]);
  const visible = filtered.slice(0, visibleCount);
  return (
    <div className="page vocabulary-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {deck.name}</button>
      <header className="vocab-header"><div><p className="eyebrow">{deck.name}</p><h1>Vocabulary</h1><p>Search Chinese, pinyin, or English. Every status is shared with your study sessions.</p></div><span className="vocab-count"><strong>{filtered.length}</strong><small>words shown</small></span></header>
      <section className="vocab-controls">
        <label className="search-field"><MagnifyingGlass size={21} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search 朋友, pengyou, or friend…" aria-label="Search vocabulary" />{query && <button onClick={() => setQuery("")} aria-label="Clear search"><X size={16} /></button>}</label>
        <div className="filter-tabs" role="group" aria-label="Mastery filter">
          {(["all", "known", "meh", "unknown"] as Filter[]).map((value) => <button key={value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>{value === "all" ? "All" : STATUS_LABELS[value]}</button>)}
        </div>
      </section>
      {filtered.length ? <div className="vocab-list">
        <div className="vocab-list-head"><span>Mandarin</span><span>Meaning</span><span>Mastery</span><span>Audio</span></div>
        {visible.map((card) => <div className="vocab-row" key={card.id}>
          <button className="word-cell" onClick={() => onOpenCard(card.id)}><strong lang="zh-CN">{card.chinese}</strong><small>{card.pinyin}</small></button>
          <button className="meaning-cell" onClick={() => onOpenCard(card.id)}>{card.english}</button>
          <StatusBadge status={card.masteryStatus} compact />
          <button className="audio-button" onClick={() => mandarinAudio.speakMandarin(card.chinese)} aria-label={"Pronounce " + card.chinese}><SpeakerHigh size={20} weight="fill" /></button>
        </div>)}
        {visibleCount < filtered.length && <button className="load-more-button" onClick={() => setVisibleCount((count) => count + 60)}>Show 60 more words <span>{visibleCount} of {filtered.length}</span></button>}
      </div> : <section className="empty-state compact-empty"><Mascot state={query ? "thinking" : "reading"} width={130} /><div><h2>{query ? "No words match that yet." : "This list is empty."}</h2><p>{query ? "Try a Chinese character, plain pinyin, or a broader English word." : "Add vocabulary to begin."}</p></div></section>}
    </div>
  );
}

export function WordDetail({ card, onBack }: { card: Card; onBack: () => void }) {
  return (
    <div className="page word-detail-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> Vocabulary</button>
      <section className="word-detail-card">
        <div className="word-detail-main">
          <p className="eyebrow">{card.type === "sentence" ? "Sentence" : "Vocabulary word"}</p>
          <h1 lang="zh-CN">{card.chinese}</h1>
          <p className="detail-pinyin">{card.pinyin}</p>
          <div className="detail-meaning">{card.english}</div>
          <button className="secondary-button" onClick={() => mandarinAudio.speakMandarin(card.chinese)}><SpeakerHigh size={20} weight="fill" /> Hear Mandarin</button>
        </div>
        <aside className="word-mastery-panel">
          <StatusBadge status={card.masteryStatus} />
          <div className="word-stat-grid"><div><strong>{card.timesSeen}</strong><small>times reviewed</small></div><div><strong>{card.correctAnswers}</strong><small>correct</small></div><div><strong>{card.incorrectAnswers}</strong><small>incorrect</small></div><div><strong>{card.bestStreak}</strong><small>best streak</small></div></div>
          <div className="score-line"><span>Mastery score</span><strong>{card.masteryScore}/100</strong></div>
          <div className="score-track"><span style={{ width: card.masteryScore + "%" }} /></div>
          <small className="last-reviewed">{card.lastReviewedAt ? "Last reviewed " + new Date(card.lastReviewedAt).toLocaleDateString() : "Not reviewed yet"}</small>
        </aside>
      </section>
      {(card.exampleChinese || card.notes) && <section className="examples-section"><p className="eyebrow">In context</p>{card.exampleChinese && <div className="example-block"><strong lang="zh-CN">{card.exampleChinese}</strong>{card.examplePinyin && <span>{card.examplePinyin}</span>}{card.exampleEnglish && <p>{card.exampleEnglish}</p>}</div>}{card.notes && <div className="note-block"><strong>Your note</strong><p>{card.notes}</p></div>}</section>}
    </div>
  );
}
