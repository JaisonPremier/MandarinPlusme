import type { StudyDirection, StudyMode } from "../types";

export type VoiceQuality = "preferred" | "fallback" | "unavailable";

export interface SpeakResult {
  quality: VoiceQuality;
  voiceName?: string;
}

const PREFERRED_NAMES = [
  "Microsoft Xiaoxiao",
  "Microsoft Yunxi",
  "Tingting",
  "Google 普通话",
  "Google Mandarin",
  "Meijia",
];

export class MandarinAudioService {
  private getVoices(): SpeechSynthesisVoice[] {
    if (!("speechSynthesis" in window)) return [];
    return window.speechSynthesis.getVoices();
  }

  selectVoice(): { voice?: SpeechSynthesisVoice; quality: VoiceQuality } {
    const voices = this.getVoices();
    const mandarin = voices.filter((voice) => /^zh(-|_)?(CN|Hans)?/i.test(voice.lang) || /mandarin|普通话|中文/i.test(voice.name));
    if (!mandarin.length) return { quality: "unavailable" };
    const preferred = mandarin.find((voice) => PREFERRED_NAMES.some((name) => voice.name.includes(name)));
    return preferred ? { voice: preferred, quality: "preferred" } : { voice: mandarin[0], quality: "fallback" };
  }

  speakMandarin(text: string, rate = 0.92): SpeakResult {
    if (!text || !("speechSynthesis" in window)) return { quality: "unavailable" };
    const selection = this.selectVoice();
    if (!selection.voice) return { quality: "unavailable" };
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.voice = selection.voice;
    utterance.rate = rate;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
    return { quality: selection.quality, voiceName: selection.voice.name };
  }

  cancel(): void {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }
}

export function shouldAutoSpeak(mode: StudyMode, direction: StudyDirection, revealed: boolean): boolean {
  if (mode === "listening") return true;
  if (direction === "zh-en") return !revealed;
  return revealed;
}

export const mandarinAudio = new MandarinAudioService();
