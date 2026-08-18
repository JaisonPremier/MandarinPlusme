import type { MasteryStatus } from "../types";

export const STATUS_LABELS: Record<MasteryStatus, string> = {
  known: "I KNOW IT!",
  meh: "MEH",
  unknown: "DON'T KNOW IT YETTT",
};

export function StatusBadge({ status, compact = false }: { status: MasteryStatus; compact?: boolean }) {
  return <span className={"status-badge status-" + status + (compact ? " compact" : "")}>{STATUS_LABELS[status]}</span>;
}

export function MasteryBar({ known, meh, unknown, total }: { known: number; meh: number; unknown: number; total: number }) {
  const safeTotal = total || 1;
  return (
    <div className="mastery-bar" aria-label={known + " known, " + meh + " learning, " + unknown + " unknown"}>
      <span className="known" style={{ width: (known / safeTotal) * 100 + "%" }} />
      <span className="meh" style={{ width: (meh / safeTotal) * 100 + "%" }} />
      <span className="unknown" style={{ width: (unknown / safeTotal) * 100 + "%" }} />
    </div>
  );
}
