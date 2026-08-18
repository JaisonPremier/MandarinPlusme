import { ArrowLeft, Check, Headphones, Keyboard, Play, SpeakerHigh, SpeakerSlash, X } from "@phosphor-icons/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Mascot, type MascotState } from "./Mascot";
import { mandarinAudio, shouldAutoSpeak, type VoiceQuality } from "../services/audio";
import { musicService } from "../services/music";
import type { Card, SessionAnswer, SessionRecord, StudyDirection, StudyMode } from "../types";

const MODE_NAMES: Record<StudyMode, string> = {
  smart: "Smart 20",
  random: "Random 20",
  all: "Study all",
  weak: "Review weak words",
  listening: "Listening",
  mistakes: "Mistake quiz",
};

export function StudySetup({ deckName, mode, defaultDirection, onStart, onClose }: { deckName: string; mode: StudyMode; defaultDirection: StudyDirection; onStart: (direction: StudyDirection) => void; onClose: () => void }) {
  const [direction, setDirection] = useState(defaultDirection);
  return (
    <div className="modal-layer centered-layer" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="study-setup modal-card" role="dialog" aria-modal="true" aria-label="Prepare study session">
        <button className="close-button" onClick={onClose} aria-label="Close">×</button>
        <Mascot state={mode === "listening" ? "listening" : "focused"} width={125} />
        <p className="eyebrow">{deckName}</p>
        <h2>{MODE_NAMES[mode]}</h2>
        <p>{mode === "listening" ? "Listen first, then reveal the word and meaning." : "Choose which side you want to see first. We’ll remember this for next time."}</p>
        {mode !== "listening" && <div className="direction-cards">
          <button className={direction === "zh-en" ? "active" : ""} onClick={() => setDirection("zh-en")}><strong>你好</strong><span>Chinese → English</span></button>
          <button className={direction === "en-zh" ? "active" : ""} onClick={() => setDirection("en-zh")}><strong>Hello</strong><span>English → Chinese</span></button>
          <button className={direction === "mixed" ? "active" : ""} onClick={() => setDirection("mixed")}><strong>中 / EN</strong><span>Mixed direction</span></button>
        </div>}
        <button className="primary-button wide-button" onClick={() => onStart(mode === "listening" ? "zh-en" : direction)}><Play size={18} weight="fill" /> Begin session</button>
      </section>
    </div>
  );
}

function resolvedDirection(direction: StudyDirection, card: Card): Exclude<StudyDirection, "mixed"> {
  if (direction !== "mixed") return direction;
  const score = [...card.id].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return score % 2 === 0 ? "zh-en" : "en-zh";
}

interface StudySessionProps {
  cards: Card[];
  deckName: string;
  deckId: string;
  mode: StudyMode;
  direction: StudyDirection;
  autoPronounce: boolean;
  onRecord: (cardId: string, correct: boolean) => Card | undefined;
  onComplete: (record: SessionRecord, masteredDelta: number) => void;
  onExit: () => void;
}

export function StudySession({ cards, deckName, deckId, mode, direction, autoPronounce, onRecord, onComplete, onExit }: StudySessionProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<SessionAnswer[]>([]);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [masteredDelta, setMasteredDelta] = useState(0);
  const [voiceQuality, setVoiceQuality] = useState<VoiceQuality | null>(null);
  const [milestone, setMilestone] = useState<number | null>(null);
  const startedAt = useRef(new Date().toISOString());
  const card = cards[index];
  const cardDirection = useMemo(() => card ? resolvedDirection(direction, card) : "zh-en", [direction, card]);

  useEffect(() => {
    musicService.enterStudySession();
    return () => { mandarinAudio.cancel(); void musicService.leaveStudySession(); };
  }, []);

  useEffect(() => {
    if (!card || !autoPronounce) return;
    const canSpeak = mode === "listening" ? !revealed : shouldAutoSpeak(mode, cardDirection, revealed);
    if (canSpeak) setVoiceQuality(mandarinAudio.speakMandarin(card.chinese).quality);
  }, [card?.id, revealed, autoPronounce, mode, cardDirection]);

  const finish = (finalAnswers: SessionAnswer[], finalBestStreak: number, finalMasteredDelta: number) => {
    const mistakes = finalAnswers.filter((answer) => !answer.correct).map((answer) => answer.cardId);
    const record: SessionRecord = {
      sessionId: "session-" + crypto.randomUUID(),
      deckId,
      mode,
      direction,
      startedAt: startedAt.current,
      completedAt: new Date().toISOString(),
      cardIds: cards.map((item) => item.id),
      answers: finalAnswers,
      correctCount: finalAnswers.filter((answer) => answer.correct).length,
      incorrectCount: mistakes.length,
      bestStreak: finalBestStreak,
      mistakes,
    };
    onComplete(record, finalMasteredDelta);
  };

  const answer = (correct: boolean) => {
    if (!revealed || !card) return;
    const nextCard = onRecord(card.id, correct);
    const newlyMastered = nextCard?.masteryStatus === "known" && card.masteryStatus !== "known" ? 1 : 0;
    if (newlyMastered) setMasteredDelta((value) => value + 1);
    const nextAnswer: SessionAnswer = { cardId: card.id, correct, answeredAt: new Date().toISOString() };
    const nextAnswers = [...answers, nextAnswer];
    const nextStreak = correct ? streak + 1 : 0;
    const nextBest = Math.max(bestStreak, nextStreak);
    setAnswers(nextAnswers);
    setStreak(nextStreak);
    setBestStreak(nextBest);
    if (correct && [3, 5, 10].includes(nextStreak)) {
      setMilestone(nextStreak);
      window.setTimeout(() => setMilestone(null), 1100);
    }
    if (index === cards.length - 1) finish(nextAnswers, nextBest, masteredDelta + newlyMastered);
    else {
      setIndex((value) => value + 1);
      setRevealed(false);
      setVoiceQuality(null);
    }
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") { event.preventDefault(); setRevealed(true); }
      if (revealed && (event.key === "1" || event.key.toLowerCase() === "x")) answer(false);
      if (revealed && (event.key === "2" || event.key.toLowerCase() === "c")) answer(true);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  if (!card) return null;
  const progress = ((index + (revealed ? 0.45 : 0)) / cards.length) * 100;
  return (
    <div className="study-screen">
      <header className="study-topbar">
        <button className="icon-button" onClick={onExit} aria-label="Exit session"><X size={22} /></button>
        <div className="study-progress"><div><span>{MODE_NAMES[mode]} · {deckName}</span><strong>{index + 1} / {cards.length}</strong></div><div className="study-progress-track"><span style={{ width: progress + "%" }} /></div></div>
        <div className="study-streak">{streak > 0 ? <><span>🔥</span> {streak}</> : <span className="muted">0</span>}</div>
      </header>
      <main className="study-stage">
        <div className={"flashcard" + (revealed ? " revealed" : "")}>
          <div className="card-mode-label">{mode === "listening" ? "Listen closely" : cardDirection === "zh-en" ? "What does this mean?" : "How do you say this?"}</div>
          {!revealed ? (
            <div className="card-front">
              {mode === "listening" ? <><button className="listen-orb" onClick={() => setVoiceQuality(mandarinAudio.speakMandarin(card.chinese).quality)} aria-label="Replay Mandarin"><Headphones size={45} weight="fill" /><span>Tap to listen again</span></button><p>What did you hear?</p></> : cardDirection === "zh-en" ? <><h1 lang="zh-CN">{card.chinese}</h1><p className="card-pinyin">{card.pinyin}</p><button className="card-audio" onClick={() => setVoiceQuality(mandarinAudio.speakMandarin(card.chinese).quality)} aria-label="Replay Mandarin"><SpeakerHigh size={21} weight="fill" /> Replay</button></> : <><p className="english-prompt">{card.english}</p><span className="prompt-hint">Think of the characters and tones</span></>}
            </div>
          ) : (
            <div className="card-answer">
              <h1 lang="zh-CN">{card.chinese}</h1><p className="card-pinyin">{card.pinyin}</p><div className="answer-rule" /><p className="answer-english">{card.english}</p><button className="card-audio" onClick={() => setVoiceQuality(mandarinAudio.speakMandarin(card.chinese).quality)}><SpeakerHigh size={21} weight="fill" /> Hear again</button>
            </div>
          )}
          {voiceQuality === "unavailable" && <div className="audio-warning"><SpeakerSlash size={16} /> A Mandarin voice is unavailable on this device. Audio was not played.</div>}
        </div>
        {!revealed ? <button className="reveal-button" onClick={() => setRevealed(true)}>Reveal answer <span>Space</span></button> : <div className="answer-actions"><button className="incorrect-button" onClick={() => answer(false)}><X size={21} weight="bold" /><span><strong>Not yet</strong><small>1 or X</small></span></button><button className="correct-button" onClick={() => answer(true)}><Check size={22} weight="bold" /><span><strong>Got it</strong><small>2 or C</small></span></button></div>}
        <div className="keyboard-hint"><Keyboard size={17} /> Keyboard shortcuts work throughout</div>
      </main>
      {milestone && <div className="streak-pop"><Mascot state="proud" width={90} /><strong>🔥 ×{milestone}</strong><span>Good streak!</span></div>}
    </div>
  );
}

function resultMood(score: number): { state: MascotState; chinese: string; message: string } {
  if (score >= 95) return { state: "excited", chinese: "太棒了！", message: "Amazing!" };
  if (score >= 80) return { state: "proud", chinese: "做得好！", message: "Great job!" };
  if (score >= 60) return { state: "happy", chinese: "继续加油！", message: "Keep going!" };
  return { state: "determined", chinese: "再来一次！", message: "We’re not done yet." };
}

export function SessionResults({ record, masteredDelta, onReview, onRetry, onDone }: { record: SessionRecord; masteredDelta: number; onReview: () => void; onRetry: () => void; onDone: () => void }) {
  const score = record.answers.length ? Math.round((record.correctCount / record.answers.length) * 100) : 0;
  const mood = resultMood(score);
  return (
    <div className="results-screen">
      <section className="results-card">
        <div className="results-celebration"><Mascot state={mood.state} width={185} /><p className="eyebrow">Session complete</p><h1>{score}%</h1><h2 lang="zh-CN">{mood.chinese}</h2><p>{mood.message}</p></div>
        <div className="results-stats"><div><span className="result-icon correct">✓</span><strong>{record.correctCount}</strong><small>Correct</small></div><div><span className="result-icon incorrect">×</span><strong>{record.incorrectCount}</strong><small>Not yet</small></div><div><span className="result-icon streak">🔥</span><strong>{record.bestStreak}</strong><small>Best streak</small></div><div><span className="result-icon mastered">↑</span><strong>+{masteredDelta}</strong><small>Mastered</small></div></div>
        <div className="results-actions">
          {record.mistakes.length > 0 && <button className="primary-button" onClick={onReview}>Review my {record.mistakes.length} mistake{record.mistakes.length === 1 ? "" : "s"}</button>}
          <button className="secondary-button" onClick={onRetry}>Study this set again</button>
          <button className="text-button centered" onClick={onDone}>Back to deck</button>
        </div>
      </section>
    </div>
  );
}

export function MistakeReview({ cards, onBack, onQuiz }: { cards: Card[]; onBack: () => void; onQuiz: () => void }) {
  return (
    <div className="page mistake-review-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> Results</button>
      <header className="review-heading"><div><p className="eyebrow">Slow down and notice</p><h1>Review your {cards.length} mistake{cards.length === 1 ? "" : "s"}</h1><p>No score here. Read, listen, and let the words settle before another round.</p></div><Mascot state="reading" width={150} /></header>
      <div className="mistake-grid">{cards.map((card) => <article key={card.id} className="mistake-card"><button className="audio-button" onClick={() => mandarinAudio.speakMandarin(card.chinese)} aria-label={"Pronounce " + card.chinese}><SpeakerHigh size={20} weight="fill" /></button><h2 lang="zh-CN">{card.chinese}</h2><span>{card.pinyin}</span><p>{card.english}</p>{card.exampleChinese && <div className="mistake-example"><strong>{card.exampleChinese}</strong><span>{card.examplePinyin}</span><p>{card.exampleEnglish}</p></div>}</article>)}</div>
      <div className="review-footer"><button className="primary-button" onClick={onQuiz}>Quiz these words again <Play size={18} weight="fill" /></button></div>
    </div>
  );
}
