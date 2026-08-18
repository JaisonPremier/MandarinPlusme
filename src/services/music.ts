export class MusicService {
  private audio: HTMLAudioElement | null = null;
  private desired = false;
  private sessionActive = false;

  private getAudio(): HTMLAudioElement {
    if (!this.audio) {
      this.audio = new Audio(import.meta.env.BASE_URL + "assets/mandarin-calm.mp3");
      this.audio.loop = true;
      this.audio.volume = 0.18;
    }
    return this.audio;
  }

  async setEnabled(enabled: boolean): Promise<void> {
    this.desired = enabled;
    const audio = this.getAudio();
    if (!enabled || this.sessionActive) {
      audio.pause();
      return;
    }
    try {
      await audio.play();
    } catch {
      this.desired = false;
    }
  }

  enterStudySession(): void {
    this.sessionActive = true;
    const audio = this.getAudio();
    if (!audio.paused) {
      const fade = window.setInterval(() => {
        audio.volume = Math.max(0, audio.volume - 0.04);
        if (audio.volume === 0) {
          window.clearInterval(fade);
          audio.pause();
          audio.volume = 0.18;
        }
      }, 40);
    }
  }

  async leaveStudySession(): Promise<void> {
    this.sessionActive = false;
    if (this.desired) await this.setEnabled(true);
  }

  duck(ducked: boolean): void {
    if (this.audio) this.audio.volume = ducked ? 0.05 : 0.18;
  }

  isSessionActive(): boolean {
    return this.sessionActive;
  }
}

export const musicService = new MusicService();
