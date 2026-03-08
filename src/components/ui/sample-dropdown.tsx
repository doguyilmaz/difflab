"use client";

import { samples, type Sample } from "@/data/samples";
import { FORMAT_LABELS } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";

interface SampleDropdownProps {
  onSelect: (sample: Sample) => void;
}

export function SampleDropdown({ onSelect }: SampleDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleSelect = useCallback(
    (sample: Sample) => {
      onSelect(sample);
      setOpen(false);
    },
    [onSelect],
  );

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-bg-surface px-3 py-1.5 text-xs font-medium text-text-muted transition-all hover:border-border-focus hover:bg-bg-elevated hover:text-text"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        Try an example
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-1/2 z-40 mt-1.5 w-64 -translate-x-1/2 overflow-hidden rounded-lg border border-border bg-bg-surface shadow-lg">
          <div className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-text-muted">
            Load a sample comparison
          </div>
          {samples.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSelect(sample)}
              className="flex w-full cursor-pointer flex-col gap-0.5 border-t border-border px-3 py-2.5 text-left transition-colors hover:bg-bg-hover"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-text-secondary">
                  {sample.label}
                </span>
                <span className="rounded bg-bg-elevated px-1.5 py-0.5 text-[9px] text-text-muted">
                  {FORMAT_LABELS[sample.format]}
                </span>
              </div>
              <span className="text-[11px] text-text-muted">
                {sample.description}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
