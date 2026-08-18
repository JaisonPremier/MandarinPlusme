import { shouldAutoSpeak } from "./audio";

describe("Mandarin auto-audio policy", () => {
  it("speaks a Chinese front but never an unrevealed English front", () => {
    expect(shouldAutoSpeak("smart", "zh-en", false)).toBe(true);
    expect(shouldAutoSpeak("smart", "en-zh", false)).toBe(false);
    expect(shouldAutoSpeak("smart", "en-zh", true)).toBe(true);
  });
});
