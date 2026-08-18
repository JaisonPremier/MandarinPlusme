import { createInitialProgress, recordAnswer } from "./mastery";

describe("Mastery engine", () => {
  it("starts every unseen card in DON'T KNOW IT YETTT", () => {
    const progress = createInitialProgress(new Date("2026-08-18T10:00:00Z"));
    expect(progress.timesSeen).toBe(0);
    expect(progress.masteryStatus).toBe("unknown");
  });

  it("moves mixed performance into MEH", () => {
    let progress = createInitialProgress();
    progress = recordAnswer(progress, true);
    progress = recordAnswer(progress, false);
    progress = recordAnswer(progress, true);
    expect(progress.masteryStatus).toBe("meh");
  });

  it("promotes five consecutive correct answers to I KNOW IT", () => {
    let progress = createInitialProgress();
    for (let index = 0; index < 5; index += 1) progress = recordAnswer(progress, true);
    expect(progress.currentStreak).toBe(5);
    expect(progress.masteryStatus).toBe("known");
  });

  it("demotes a mastered word after repeated later mistakes", () => {
    let progress = createInitialProgress();
    for (let index = 0; index < 5; index += 1) progress = recordAnswer(progress, true);
    expect(progress.masteryStatus).toBe("known");
    for (let index = 0; index < 3; index += 1) progress = recordAnswer(progress, false);
    expect(progress.masteryStatus).not.toBe("known");
  });
});
