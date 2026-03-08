"use client";

import { useState, useMemo, useEffect } from "react";
import type { DiffLine, DiffResult, DiffViewMode, SideBySideRow } from "@/types";
import { toSideBySide } from "@/lib/diff/split";
import { collapseUnchanged } from "@/lib/diff/collapse";

interface DiffViewProps {
  result: DiffResult | null;
  error: string | null;
  isEmpty: boolean;
  viewMode?: DiffViewMode;
  compact?: boolean;
}

const lineStyles: Record<string, string> = {
  added: "bg-added-bg text-added border-l-2 border-added",
  removed: "bg-removed-bg text-removed border-l-2 border-removed",
  changed: "bg-changed-bg text-changed border-l-2 border-changed",
  context: "text-text-muted border-l-2 border-transparent",
};

const markerColors: Record<string, string> = {
  added: "bg-added",
  removed: "bg-removed",
  changed: "bg-changed",
};

const LINE_CLS = "whitespace-pre-wrap break-words px-3 py-px font-mono text-[13px] leading-[1.7]";

function FoldBar({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full cursor-pointer items-center gap-2 bg-bg-elevated/50 px-3 py-1 text-[11px] text-text-muted transition-colors hover:bg-bg-hover hover:text-text-secondary"
    >
      <div className="h-px flex-1 bg-border" />
      <span className="flex items-center gap-1">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
        Show {count} unchanged line{count !== 1 ? "s" : ""}
      </span>
      <div className="h-px flex-1 bg-border" />
    </button>
  );
}

function DiffMinimap({ lines }: { lines: DiffLine[] }) {
  const markers = useMemo(() => {
    if (lines.length === 0) return [];
    return lines
      .map((line, i) => ({ pos: i / lines.length, type: line.type }))
      .filter((m) => m.type !== "context");
  }, [lines]);

  if (markers.length === 0) return null;

  const markerH = Math.max(100 / lines.length, 0.4);

  return (
    <div
      className="absolute top-0 right-0 bottom-0 w-1.5 rounded-full opacity-60"
      aria-hidden="true"
    >
      {markers.map((m, i) => (
        <div
          key={i}
          className={`absolute w-full rounded-full ${markerColors[m.type] ?? ""}`}
          style={{ top: `${m.pos * 100}%`, height: `${markerH}%`, minHeight: "2px" }}
        />
      ))}
    </div>
  );
}

function UnifiedView({
  lines,
  compact,
}: {
  lines: DiffLine[];
  compact: boolean;
}) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  useEffect(() => {
    setExpanded(new Set());
  }, [lines]);

  const chunks = useMemo(
    () =>
      compact
        ? collapseUnchanged(lines, (l) => l.type !== "context", 3)
        : [{ type: "visible" as const, items: lines }],
    [lines, compact],
  );

  const toggle = (idx: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div className="relative">
      <div className="max-h-[500px] min-h-[60px] overflow-auto pr-2">
        {chunks.map((chunk, ci) => {
          if (chunk.type === "collapsed" && !expanded.has(ci)) {
            return (
              <FoldBar
                key={`fold-${ci}`}
                count={chunk.items.length}
                onClick={() => toggle(ci)}
              />
            );
          }
          return chunk.items.map((line, li) => (
            <div
              key={`${ci}-${li}`}
              className={`${LINE_CLS} ${lineStyles[line.type] ?? ""}`}
            >
              {line.text}
            </div>
          ));
        })}
      </div>
      <DiffMinimap lines={lines} />
    </div>
  );
}

function SplitView({
  lines,
  compact,
}: {
  lines: DiffLine[];
  compact: boolean;
}) {
  const rows = useMemo(() => toSideBySide(lines), [lines]);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  useEffect(() => {
    setExpanded(new Set());
  }, [lines]);

  const isRowChanged = (row: SideBySideRow) =>
    (row.left !== null && row.left.type !== "context") ||
    (row.right !== null && row.right.type !== "context");

  const chunks = useMemo(
    () =>
      compact
        ? collapseUnchanged(rows, isRowChanged, 3)
        : [{ type: "visible" as const, items: rows }],
    [rows, compact],
  );

  const toggle = (idx: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div className="relative">
      <div className="max-h-[500px] min-h-[60px] overflow-auto pr-2">
        <div className="grid grid-cols-2">
          {chunks.map((chunk, ci) => {
            if (chunk.type === "collapsed" && !expanded.has(ci)) {
              return (
                <div key={`fold-${ci}`} className="col-span-2">
                  <FoldBar
                    count={chunk.items.length}
                    onClick={() => toggle(ci)}
                  />
                </div>
              );
            }
            return chunk.items.map((row, ri) => (
              <div
                key={`${ci}-${ri}`}
                className="col-span-2 grid grid-cols-2"
              >
                <div
                  className={`${LINE_CLS} border-r border-border ${
                    row.left
                      ? (lineStyles[row.left.type] ?? "")
                      : "bg-bg-elevated/30"
                  }`}
                >
                  {row.left?.text ?? ""}
                </div>
                <div
                  className={`${LINE_CLS} ${
                    row.right
                      ? (lineStyles[row.right.type] ?? "")
                      : "bg-bg-elevated/30"
                  }`}
                >
                  {row.right?.text ?? ""}
                </div>
              </div>
            ));
          })}
        </div>
      </div>
      <DiffMinimap lines={lines} />
    </div>
  );
}

export function DiffView({
  result,
  error,
  isEmpty,
  viewMode = "unified",
  compact = true,
}: DiffViewProps) {
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
    return <SplitView lines={result.lines} compact={compact} />;
  }

  return <UnifiedView lines={result.lines} compact={compact} />;
}
