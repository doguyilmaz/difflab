import type { DiffResult } from "@/types";

interface DiffViewProps {
  result: DiffResult | null;
  error: string | null;
  isEmpty: boolean;
}

const lineStyles: Record<string, string> = {
  added: "bg-added-bg text-added border-l-2 border-added",
  removed: "bg-removed-bg text-removed border-l-2 border-removed",
  changed: "bg-changed-bg text-changed border-l-2 border-changed",
  context: "text-text-muted border-l-2 border-transparent",
};

export function DiffView({ result, error, isEmpty }: DiffViewProps) {
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

  return (
    <div className="max-h-[420px] min-h-[60px] overflow-auto">
      {result.lines.map((line, i) => (
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
