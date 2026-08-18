import { MusicService } from "./music";

describe("Music priority", () => {
  it("stops background music when a study session begins", async () => {
    let paused = true;
    const audio = {
      loop: false,
      volume: 0,
      get paused() { return paused; },
      play: vi.fn(async () => { paused = false; }),
      pause: vi.fn(() => { paused = true; }),
    };
    vi.stubGlobal("Audio", vi.fn(() => audio));
    const music = new MusicService();
    await music.setEnabled(true);
    music.enterStudySession();
    await new Promise((resolve) => setTimeout(resolve, 260));
    expect(audio.pause).toHaveBeenCalled();
    expect(music.isSessionActive()).toBe(true);
    vi.unstubAllGlobals();
  });
});
