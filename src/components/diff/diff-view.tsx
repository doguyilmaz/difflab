import type { DiffResult, DiffViewMode } from "@/types";
import { toSideBySide } from "@/lib/diff/split";

interface DiffViewProps {
  result: DiffResult | null;
  error: string | null;
  isEmpty: boolean;
  viewMode?: DiffViewMode;
}

const lineStyles: Record<string, string> = {
  added: "bg-added-bg text-added border-l-2 border-added",
  removed: "bg-removed-bg text-removed border-l-2 border-removed",
  changed: "bg-changed-bg text-changed border-l-2 border-changed",
  context: "text-text-muted border-l-2 border-transparent",
};

function UnifiedView({ lines }: { lines: DiffResult["lines"] }) {
  return (
    <div className="max-h-[420px] min-h-[60px] overflow-auto">
      {lines.map((line, i) => (
        <div
          key={i}
          className={`whitespace-pre-wrap break-words px-3 py-px font-mono text-[13px] leading-[1.7] ${lineStyles[line.type] ?? ""}`}
        >
          {line.text}
        </div>
      ))}
    </div>
  );
}

function SplitView({ lines }: { lines: DiffResult["lines"] }) {
  const rows = toSideBySide(lines);

  return (
    <div className="max-h-[420px] min-h-[60px] overflow-auto">
      <div className="grid grid-cols-2">
        {rows.map((row, i) => (
          <div key={i} className="col-span-2 grid grid-cols-2">
            <div
              className={`whitespace-pre-wrap break-words border-r border-border px-3 py-px font-mono text-[13px] leading-[1.7] ${
                row.left ? (lineStyles[row.left.type] ?? "") : "bg-bg-elevated/30"
              }`}
            >
              {row.left?.text ?? ""}
            </div>
            <div
              className={`whitespace-pre-wrap break-words px-3 py-px font-mono text-[13px] leading-[1.7] ${
                row.right ? (lineStyles[row.right.type] ?? "") : "bg-bg-elevated/30"
              }`}
            >
              {row.right?.text ?? ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DiffView({ result, error, isEmpty, viewMode = "unified" }: DiffViewProps) {
  if (error) {
    return <div className="p-3 text-[13px] text-removed">{error}</div>;
  }

  if (isEmpty || !result) {
    return (
      <div className="py-8 text-center text-[13px] text-text-muted">
        Paste or drop content in both panels to compare.
      </div>
    );
  }

  if (!result.lines.length) {
    return (
      <div className="py-8 text-center text-[13px] text-text-muted">
        Identical.
      </div>
    );
  }

  if (viewMode === "split") {
    return <SplitView lines={result.lines} />;
  }

  return <UnifiedView lines={result.lines} />;
}
