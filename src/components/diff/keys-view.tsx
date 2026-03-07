import type { MissingKeysResult } from "@/types";

interface KeysViewProps {
  missingInLeft: MissingKeysResult;
  missingInRight: MissingKeysResult;
  leftLabel: string;
  rightLabel: string;
  compareValues: boolean;
  error: string | null;
  isEmpty: boolean;
}

export function KeysView({
  missingInLeft,
  missingInRight,
  leftLabel,
  rightLabel,
  compareValues,
  error,
  isEmpty,
}: KeysViewProps) {
  const label = compareValues ? "Differences in" : "Missing in";

  if (error) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="lg:border-r lg:border-border">
          <div className="border-b border-border px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-text-muted">
            {label} {leftLabel}
          </div>
          <div className="p-3 text-[13px] text-removed">{error}</div>
        </div>
        <div>
          <div className="border-b border-border px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-text-muted">
            {label} {rightLabel}
          </div>
          <div className="p-3 text-[13px] text-removed">{error}</div>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="lg:border-r lg:border-border">
          <div className="border-b border-border px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-text-muted">
            {label} {leftLabel}
          </div>
          <pre className="min-h-[60px] max-h-[420px] overflow-auto whitespace-pre-wrap break-words p-3 text-[13px] leading-[1.65] text-text-secondary">
            Paste or drop content in both panels to compare.
          </pre>
        </div>
        <div>
          <div className="border-b border-border px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-text-muted">
            {label} {rightLabel}
          </div>
          <pre className="min-h-[60px] max-h-[420px] overflow-auto whitespace-pre-wrap break-words p-3 text-[13px] leading-[1.65] text-text-secondary">
            Paste or drop content in both panels to compare.
          </pre>
        </div>
      </div>
    );
  }

  const leftKeys = Object.keys(missingInLeft);
  const rightKeys = Object.keys(missingInRight);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2">
      <div className="lg:border-r lg:border-border">
        <div className="border-b border-border px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-text-muted">
          {label} {leftLabel}
        </div>
        <pre className="min-h-[60px] max-h-[420px] overflow-auto whitespace-pre-wrap break-words p-3 text-[13px] leading-[1.65] text-text-secondary">
          {leftKeys.length
            ? JSON.stringify(missingInLeft, null, 2)
            : "No missing keys."}
        </pre>
      </div>
      <div>
        <div className="border-b border-border px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-text-muted">
          {label} {rightLabel}
        </div>
        <pre className="min-h-[60px] max-h-[420px] overflow-auto whitespace-pre-wrap break-words p-3 text-[13px] leading-[1.65] text-text-secondary">
          {rightKeys.length
            ? JSON.stringify(missingInRight, null, 2)
            : "No missing keys."}
        </pre>
      </div>
    </div>
  );
}
