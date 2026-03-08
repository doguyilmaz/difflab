"use client";

import { useEffect, useRef } from "react";

const isMac = typeof navigator !== "undefined" && /Mac/.test(navigator.userAgent);
const mod = isMac ? "⌘" : "Ctrl";

const shortcuts = [
  { keys: `${mod}+S`, action: "Save comparison to history" },
  { keys: `${mod}+Shift+S`, action: "Swap left and right panels" },
  { keys: `${mod}+Shift+F`, action: "Format both panels" },
  { keys: `${mod}+Shift+D`, action: "Toggle Keys / Diff view" },
  { keys: "?", action: "Show this shortcuts panel" },
];

interface ShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

export function ShortcutsModal({ open, onClose }: ShortcutsModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true" aria-labelledby="shortcuts-title">
      <div
        ref={ref}
        className="mx-4 w-full max-w-sm rounded-xl border border-border bg-bg-surface p-5 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="shortcuts-title" className="text-sm font-semibold text-text">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="cursor-pointer rounded p-1 text-text-muted transition-colors hover:text-text"
            aria-label="Close shortcuts"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="space-y-2">
          {shortcuts.map((s) => (
            <div
              key={s.keys}
              className="flex items-center justify-between rounded-md px-2 py-1.5"
            >
              <span className="text-xs text-text-secondary">{s.action}</span>
              <kbd className="rounded border border-border bg-bg-elevated px-2 py-0.5 text-[11px] font-medium text-text-muted">
                {s.keys}
              </kbd>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-[10px] text-text-muted">
          Press <kbd className="rounded border border-border px-1 py-0.5 text-[10px]">Esc</kbd> to close
        </p>
      </div>
    </div>
  );
}
