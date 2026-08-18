import { rowsToImportRows } from "./import";

describe("Excel import validation", () => {
  it("matches headers regardless of capitalization and preserves valid values", () => {
    const rows = rowsToImportRows([
      ["CHINESE", "Pinyin", "english", "Notes"],
      ["我", "wǒ", "I / me", "pronoun"],
    ]);
    expect(rows[0]).toMatchObject({ chinese: "我", pinyin: "wǒ", english: "I / me", notes: "pronoun", errors: [] });
  });

  it("flags malformed rows without hiding valid rows", () => {
    const rows = rowsToImportRows([
      ["Chinese", "Pinyin", "English"],
      ["你", "nǐ", "you"],
      ["朋友", "péngyou", null],
    ]);
    expect(rows[0].errors).toEqual([]);
    expect(rows[1].errors).toContain("Missing English");
  });
});
