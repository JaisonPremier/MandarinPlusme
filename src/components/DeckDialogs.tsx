import { Check, FileXls, NotePencil, Plus, UploadSimple, Warning } from "@phosphor-icons/react";
import { useState, type FormEvent } from "react";
import { Mascot } from "./Mascot";
import { importRowsToCards, parseExcelFile } from "../services/import";
import type { CardSeed, Deck, ImportRow } from "../types";

export function CreateDeckDialog({ onCreate, onClose, onCreated }: { onCreate: (name: string, description: string, icon: string) => Deck; onClose: () => void; onCreated: (deck: Deck) => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("词");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    onCreated(onCreate(name, description, icon));
  };
  return (
    <div className="modal-layer centered-layer" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form className="modal-card create-deck-dialog" onSubmit={submit}>
        <button className="close-button" type="button" onClick={onClose} aria-label="Close">×</button>
        <div className="dialog-mascot"><Mascot state="reading" width={105} /></div>
        <p className="eyebrow">A new learning space</p><h2>Create your deck</h2><p>Name the Mandarin you want to remember. Every study mode will be ready automatically.</p>
        <div className="deck-form-row"><label className="icon-field"><span>Cover</span><input value={icon} maxLength={2} onChange={(event) => setIcon(event.target.value)} /></label><label><span>Deck name</span><input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Shanghai trip" required /></label></div>
        <label><span>Description <small>optional</small></span><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Words I want ready before the trip." rows={3} /></label>
        <button className="primary-button wide-button" type="submit" disabled={!name.trim()}><Plus size={18} /> Create deck</button>
      </form>
    </div>
  );
}

export function AddCardsDialog({ deck, onAddCards, onClose }: { deck: Deck; onAddCards: (cards: CardSeed[]) => void; onClose: () => void }) {
  const [method, setMethod] = useState<"manual" | "import">("manual");
  const [chinese, setChinese] = useState("");
  const [pinyin, setPinyin] = useState("");
  const [english, setEnglish] = useState("");
  const [exampleChinese, setExampleChinese] = useState("");
  const [examplePinyin, setExamplePinyin] = useState("");
  const [exampleEnglish, setExampleEnglish] = useState("");
  const [notes, setNotes] = useState("");
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [added, setAdded] = useState(0);

  const addManual = (event: FormEvent) => {
    event.preventDefault();
    if (!chinese.trim() || !pinyin.trim() || !english.trim()) return;
    const card: CardSeed = {
      id: deck.id + "-manual-" + crypto.randomUUID(), deckId: deck.id,
      chinese: chinese.trim(), pinyin: pinyin.trim(), english: english.trim(),
      type: chinese.trim().length > 12 ? "sentence" : "word",
      exampleChinese: exampleChinese.trim() || undefined,
      examplePinyin: examplePinyin.trim() || undefined,
      exampleEnglish: exampleEnglish.trim() || undefined,
      notes: notes.trim() || undefined,
    };
    onAddCards([card]); setAdded((value) => value + 1);
    setChinese(""); setPinyin(""); setEnglish(""); setExampleChinese(""); setExamplePinyin(""); setExampleEnglish(""); setNotes("");
  };

  const readFile = async (file?: File) => {
    if (!file) return;
    setError(""); setFileName(file.name);
    try { setRows(await parseExcelFile(file)); }
    catch (reason) {
      setRows([]);
      const detail = reason instanceof Error ? reason.message : "Unknown workbook error";
      setError("We couldn’t read this workbook. " + detail);
    }
  };
  const validRows = rows.filter((row) => row.errors.length === 0);
  const invalidRows = rows.filter((row) => row.errors.length > 0);
  const importValid = () => { const cards = importRowsToCards(validRows, deck.id); onAddCards(cards); setAdded((value) => value + cards.length); setRows([]); setFileName(""); };

  return (
    <div className="modal-layer centered-layer" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal-card add-cards-dialog" role="dialog" aria-modal="true">
        <button className="close-button" onClick={onClose} aria-label="Close">×</button>
        <p className="eyebrow">{deck.name}</p><h2>Add vocabulary</h2>
        <div className="method-tabs"><button className={method === "manual" ? "active" : ""} onClick={() => setMethod("manual")}><NotePencil size={19} /> Add manually</button><button className={method === "import" ? "active" : ""} onClick={() => setMethod("import")}><FileXls size={19} /> Import Excel</button></div>
        {added > 0 && <div className="success-banner"><Check size={18} weight="bold" /> {added} card{added === 1 ? "" : "s"} added to {deck.name}</div>}
        {method === "manual" ? <form className="manual-form" onSubmit={addManual}>
          <div className="three-fields"><label><span>Chinese</span><input value={chinese} onChange={(event) => setChinese(event.target.value)} placeholder="朋友" required /></label><label><span>Pinyin</span><input value={pinyin} onChange={(event) => setPinyin(event.target.value)} placeholder="péngyou" required /></label><label><span>English</span><input value={english} onChange={(event) => setEnglish(event.target.value)} placeholder="friend" required /></label></div>
          <details><summary>Examples and notes <span>optional</span></summary><div className="three-fields"><label><span>Example Chinese</span><input value={exampleChinese} onChange={(event) => setExampleChinese(event.target.value)} /></label><label><span>Example Pinyin</span><input value={examplePinyin} onChange={(event) => setExamplePinyin(event.target.value)} /></label><label><span>Example English</span><input value={exampleEnglish} onChange={(event) => setExampleEnglish(event.target.value)} /></label></div><label><span>Notes</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} /></label></details>
          <button className="primary-button" type="submit"><Plus size={18} /> Add this card</button>
        </form> : <div className="import-flow">
          {!rows.length ? <label className="file-drop"><input type="file" accept=".xlsx" onChange={(event) => void readFile(event.target.files?.[0])} /><UploadSimple size={35} /><strong>Choose an Excel workbook</strong><span>Required: Chinese · Pinyin · English</span><small>Optional example and notes columns are supported</small></label> : <>
            <div className="import-summary"><div><FileXls size={28} /><span><strong>{fileName}</strong><small>{rows.length} rows detected</small></span></div><button onClick={() => { setRows([]); setFileName(""); }}>Choose another</button></div>
            <div className="validation-counts"><span className="valid"><Check size={17} /> {validRows.length} valid</span>{invalidRows.length > 0 && <span className="invalid"><Warning size={17} /> {invalidRows.length} need attention</span>}</div>
            <div className="import-preview"><div className="preview-head"><span>Chinese</span><span>Pinyin</span><span>English</span></div>{rows.slice(0, 6).map((row) => <div key={row.rowNumber} className={row.errors.length ? "preview-row invalid" : "preview-row"}><span>{row.chinese || "—"}</span><span>{row.pinyin || "—"}</span><span>{row.english || "—"}</span>{row.errors.length > 0 && <small>Row {row.rowNumber}: {row.errors.join(", ")}</small>}</div>)}</div>
            <button className="primary-button wide-button" disabled={!validRows.length} onClick={importValid}>Import {validRows.length} valid card{validRows.length === 1 ? "" : "s"}</button>
          </>}
          {error && <div className="error-banner"><Warning size={18} /> {error}</div>}
        </div>}
      </section>
    </div>
  );
}
