import type { CardSeed, ImportRow } from "../types";

type ExcelCell = string | number | boolean | Date | null;

const HEADER_ALIASES: Record<string, keyof Omit<ImportRow, "rowNumber" | "errors">> = {
  chinese: "chinese",
  hanzi: "chinese",
  word: "chinese",
  pinyin: "pinyin",
  english: "english",
  translation: "english",
  meaning: "english",
  examplechinese: "exampleChinese",
  examplepinyin: "examplePinyin",
  exampleenglish: "exampleEnglish",
  notes: "notes",
  note: "notes",
};

function normalizeHeader(value: ExcelCell): string {
  return String(value ?? "").toLowerCase().replace(/[^a-z]/g, "");
}

export function rowsToImportRows(rows: ExcelCell[][]): ImportRow[] {
  if (!rows.length) return [];
  const columns = new Map<number, keyof Omit<ImportRow, "rowNumber" | "errors">>();
  rows[0].forEach((cell, index) => {
    const match = HEADER_ALIASES[normalizeHeader(cell)];
    if (match) columns.set(index, match);
  });
  return rows.slice(1).map((row, rowIndex) => {
    const parsed: ImportRow = { rowNumber: rowIndex + 2, chinese: "", pinyin: "", english: "", errors: [] };
    columns.forEach((field, column) => {
      const value = String(row[column] ?? "").trim();
      if (value) (parsed[field] as string) = value;
    });
    if (!parsed.chinese) parsed.errors.push("Missing Chinese");
    if (!parsed.pinyin) parsed.errors.push("Missing Pinyin");
    if (!parsed.english) parsed.errors.push("Missing English");
    return parsed;
  }).filter((row) => row.chinese || row.pinyin || row.english);
}

export async function parseExcelFile(file: File): Promise<ImportRow[]> {
  const { unzipSync, strFromU8 } = await import("fflate");
  const archive = unzipSync(new Uint8Array(await file.arrayBuffer()));
  const parseXml = (path: string): Document | null => {
    const content = archive[path];
    return content ? new DOMParser().parseFromString(strFromU8(content), "application/xml") : null;
  };
  const sharedDocument = parseXml("xl/sharedStrings.xml");
  const sharedStrings = sharedDocument
    ? Array.from(sharedDocument.querySelectorAll("si")).map((item) => Array.from(item.querySelectorAll("t")).map((text) => text.textContent ?? "").join(""))
    : [];
  const workbook = parseXml("xl/workbook.xml");
  const relationships = parseXml("xl/_rels/workbook.xml.rels");
  const relationshipId = workbook?.querySelector("sheet")?.getAttribute("r:id");
  const target = relationshipId
    ? Array.from(relationships?.querySelectorAll("Relationship") ?? []).find((item) => item.getAttribute("Id") === relationshipId)?.getAttribute("Target")
    : null;
  const sheetPath = target
    ? target.startsWith("/") ? target.slice(1) : "xl/" + target.replace(/^\.\//, "")
    : "xl/worksheets/sheet1.xml";
  const worksheet = parseXml(sheetPath);
  if (!worksheet) throw new Error("No readable worksheet was found.");
  const columnIndex = (reference: string): number => {
    const letters = reference.match(/^[A-Z]+/i)?.[0].toUpperCase() ?? "A";
    return [...letters].reduce((total, letter) => total * 26 + letter.charCodeAt(0) - 64, 0) - 1;
  };
  const rows: ExcelCell[][] = [];
  worksheet.querySelectorAll("row").forEach((rowElement) => {
    const row: ExcelCell[] = [];
    rowElement.querySelectorAll("c").forEach((cell) => {
      const index = columnIndex(cell.getAttribute("r") ?? "A1");
      const type = cell.getAttribute("t");
      const raw = cell.querySelector("v")?.textContent ?? "";
      const inline = Array.from(cell.querySelectorAll("is t")).map((text) => text.textContent ?? "").join("");
      row[index] = type === "s" ? sharedStrings[Number(raw)] ?? "" : type === "inlineStr" ? inline : raw;
    });
    rows.push(row);
  });
  return rowsToImportRows(rows);
}

export function importRowsToCards(rows: ImportRow[], deckId: string): CardSeed[] {
  return rows.filter((row) => row.errors.length === 0).map((row, index) => ({
    id: deckId + "-import-" + Date.now() + "-" + index,
    deckId,
    chinese: row.chinese,
    pinyin: row.pinyin,
    english: row.english,
    type: row.chinese.length > 12 ? "sentence" : "word",
    exampleChinese: row.exampleChinese,
    examplePinyin: row.examplePinyin,
    exampleEnglish: row.exampleEnglish,
    notes: row.notes,
  }));
}
