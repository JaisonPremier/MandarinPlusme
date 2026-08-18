import { ArrowRight, Play } from "@phosphor-icons/react";
import { Mascot } from "./Mascot";

export function FirstLaunch({ onStart, onExplore }: { onStart: () => void; onExplore: () => void }) {
  return (
    <div className="onboarding-screen">
      <div className="onboarding-art"><Mascot state="hero" width={330} /></div>
      <section className="onboarding-copy">
        <p className="eyebrow">Meet Pandao</p>
        <h1><span lang="zh-CN">你好!</span><br />I’m your Mandarin buddy.</h1>
        <p>Let’s turn a few minutes a day into Mandarin you can actually remember.</p>
        <div className="onboarding-actions"><button className="primary-button" onClick={onStart}><Play size={18} weight="fill" /> Start with HSK 1</button><button className="text-button" onClick={onExplore}>Explore decks <ArrowRight size={18} /></button></div>
      </section>
    </div>
  );
}
