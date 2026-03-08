"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { EditorPanel } from "@/components/editor/editor-panel";
import { KeysView } from "@/components/diff/keys-view";
import { DiffView } from "@/components/diff/diff-view";
import { StatsBar } from "@/components/diff/stats-bar";
import { Toast, useToast } from "@/components/ui/toast";
import { SampleDropdown } from "@/components/ui/sample-dropdown";
import { ShortcutsModal } from "@/components/ui/shortcuts-modal";
import type { Sample } from "@/data/samples";
import { findMissing, buildDiff, truncate } from "@/lib/diff/engine";
import { buildTextDiff } from "@/lib/diff/text-diff";
import { parseStructured, formatContent, minifyContent } from "@/lib/format/formatter";
import { detectFormat, detectFormatFromExtension } from "@/lib/format/detect";
import { saveComparison } from "@/lib/db";
import { useSettings } from "@/hooks/use-settings";
import { addSuffix, stripSuffix, markEdited } from "@/lib/name-utils";
import type {
  ActiveTab,
  DiffResult,
  Format,
  MissingKeysResult,
} from "@/types";
import { STRUCTURED_FORMATS, FORMAT_LABELS } from "@/types";

const MAX_SIZE = 500_000;

interface PanelData {
  content: string;
  fileName: string;
  format: Format;
}

interface State {
  left: PanelData;
  right: PanelData;
  activeTab: ActiveTab;
  compareValues: boolean;
}

function defaultState(): State {
  return {
    left: { content: "", fileName: "Left", format: "json" },
    right: { content: "", fileName: "Right", format: "json" },
    activeTab: "keys",
    compareValues: false,
  };
}

function loadSavedState(): State {
  if (typeof window === "undefined") return defaultState();
  try {
    const saved = sessionStorage.getItem("difflab-state");
    if (saved) return JSON.parse(saved);
  } catch {}
  return defaultState();
}


function formatMissingDisplay(obj: MissingKeysResult): string {
  return Object.keys(obj).length
    ? JSON.stringify(obj, null, 2)
    : "No missing keys.";
}

export default function Home() {
  const [state, setState] = useState<State>(loadSavedState);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);
  const { toast, show: showToast } = useToast();
  const { settings, updateSetting } = useSettings();
  const [isSaved, setIsSaved] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const dragCountRef = useRef(0);
  const [dragOverlay, setDragOverlay] = useState(false);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  });

  const saveState = useCallback((next: State) => {
    try {
      sessionStorage.setItem("difflab-state", JSON.stringify(next));
    } catch {}
  }, []);

  const update = useCallback(
    (patch: Partial<State>) => {
      setState((prev) => {
        const next = { ...prev, ...patch };
        saveState(next);
        return next;
      });
    },
    [saveState],
  );

  const updatePanel = useCallback(
    (
      side: "left" | "right",
      content: string,
      fileName?: string,
      format?: Format,
    ) => {
      setState((prev) => {
        const panel = prev[side];
        const clipped =
          content.length > MAX_SIZE ? content.slice(0, MAX_SIZE) : content;
        const newFormat =
          format ?? (content ? detectFormat(content, fileName ?? panel.fileName) : panel.format);
        const next = {
          ...prev,
          [side]: {
            content: clipped,
            fileName: fileName ?? panel.fileName,
            format: newFormat,
          },
        };
        if (content.length > MAX_SIZE) {
          showToast(
            `Input too large (${(content.length / 1000).toFixed(0)}KB). Max ${MAX_SIZE / 1000}KB.`,
            true,
          );
        }
        saveState(next);
        return next;
      });
    },
    [saveState, showToast],
  );

  const handleChange = useCallback(
    (side: "left" | "right", value: string) => {
      setState((prev) => {
        const panel = prev[side];
        const clipped =
          value.length > MAX_SIZE ? value.slice(0, MAX_SIZE) : value;
        const newFormat = value
          ? detectFormat(value, panel.fileName)
          : panel.format;
        const next = {
          ...prev,
          [side]: {
            content: clipped,
            fileName: markEdited(panel.fileName),
            format: newFormat,
          },
        };
        if (value.length > MAX_SIZE) {
          showToast(
            `Input too large (${(value.length / 1000).toFixed(0)}KB). Max ${MAX_SIZE / 1000}KB.`,
            true,
          );
        }
        saveState(next);
        return next;
      });
      setIsSaved(false);
    },
    [saveState, showToast],
  );

  const handleSave = useCallback(async () => {
    const s = stateRef.current;
    if (!s.left.content.trim() && !s.right.content.trim()) {
      showToast("Nothing to save", true);
      return;
    }
    const title = `${stripSuffix(s.left.fileName)} vs ${stripSuffix(s.right.fileName)}`;
    await saveComparison({
      title,
      leftContent: s.left.content,
      rightContent: s.right.content,
      leftFormat: s.left.format,
      rightFormat: s.right.format,
      leftFileName: stripSuffix(s.left.fileName),
      rightFileName: stripSuffix(s.right.fileName),
      tags: [],
    });
    setIsSaved(true);
    showToast("Saved to history");
  }, [showToast]);

  const handleLabelChange = useCallback(
    (side: "left" | "right", newLabel: string) => {
      setState((prev) => {
        const next = {
          ...prev,
          [side]: { ...prev[side], fileName: newLabel },
        };
        saveState(next);
        return next;
      });
    },
    [saveState],
  );

  const handleFormatChange = useCallback(
    (side: "left" | "right", format: Format) => {
      setState((prev) => {
        const next = {
          ...prev,
          [side]: { ...prev[side], format },
        };
        saveState(next);
        return next;
      });
    },
    [saveState],
  );

  const handleFormat = useCallback(
    (side: "left" | "right") => {
      setState((prev) => {
        const panel = prev[side];
        const content = panel.content.trim();
        if (!content) return prev;
        const result = formatContent(content, panel.format);
        if (result.ok) {
          const next = {
            ...prev,
            [side]: { ...panel, content: result.result },
          };
          saveState(next);
          showToast("Formatted");
          return next;
        }
        showToast(result.error, true);
        return prev;
      });
    },
    [saveState, showToast],
  );

  const handleMinify = useCallback(
    (side: "left" | "right") => {
      setState((prev) => {
        const panel = prev[side];
        const content = panel.content.trim();
        if (!content) return prev;
        const result = minifyContent(content, panel.format);
        if (result.ok) {
          const next = {
            ...prev,
            [side]: { ...panel, content: result.result },
          };
          saveState(next);
          showToast("Minified");
          return next;
        }
        showToast(result.error, true);
        return prev;
      });
    },
    [saveState, showToast],
  );

  const handleClear = useCallback(
    (side: "left" | "right") => {
      const defaultName = side === "left" ? "Left" : "Right";
      setState((prev) => {
        const next = {
          ...prev,
          [side]: { content: "", fileName: defaultName, format: prev[side].format },
        };
        saveState(next);
        return next;
      });
    },
    [saveState],
  );

  const handleSwap = useCallback(() => {
    setState((prev) => {
      const next: State = {
        ...prev,
        left: { ...prev.right },
        right: { ...prev.left },
      };
      saveState(next);
      return next;
    });
    showToast("Swapped");
  }, [saveState, showToast]);

  const handleSample = useCallback(
    (sample: Sample) => {
      setState((prev) => {
        const next: State = {
          ...prev,
          left: {
            content: sample.left,
            fileName: addSuffix(sample.label, "old"),
            format: sample.format,
          },
          right: {
            content: sample.right,
            fileName: addSuffix(sample.label, "new"),
            format: sample.format,
          },
          compareValues: true,
        };
        saveState(next);
        return next;
      });
      setIsSaved(false);
      showToast(`Loaded: ${sample.label}`);
    },
    [saveState, showToast],
  );

  const readFile = useCallback(
    (file: File, side: "left" | "right") => {
      if (file.size > MAX_SIZE) {
        showToast(
          `File too large (${(file.size / 1000).toFixed(0)}KB). Max ${MAX_SIZE / 1000}KB.`,
          true,
        );
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const detectedFormat = detectFormatFromExtension(file.name);
        updatePanel(
          side,
          result,
          file.name,
          detectedFormat ?? undefined,
        );
        showToast(`Loaded ${file.name}`);
      };
      reader.readAsText(file);
    },
    [updatePanel, showToast],
  );

  const handleFormatBoth = useCallback(() => {
    handleFormat("left");
    handleFormat("right");
  }, [handleFormat]);

  const handleToggleView = useCallback(() => {
    setState((prev) => {
      const next = {
        ...prev,
        activeTab: (prev.activeTab === "keys" ? "diff" : "keys") as ActiveTab,
      };
      saveState(next);
      return next;
    });
  }, [saveState]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();

      if (mod && e.shiftKey && key === "s") {
        e.preventDefault();
        handleSwap();
      } else if (mod && !e.shiftKey && key === "s") {
        e.preventDefault();
        handleSave();
      } else if (mod && e.shiftKey && key === "f") {
        e.preventDefault();
        handleFormatBoth();
      } else if (mod && e.shiftKey && key === "d") {
        e.preventDefault();
        handleToggleView();
      } else if (e.key === "?" && !mod && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target as HTMLElement).closest?.(".cm-editor"))) {
        e.preventDefault();
        setShowShortcuts((v) => !v);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [handleSwap, handleSave, handleFormatBoth, handleToggleView]);

  // Global drag & drop
  useEffect(() => {
    const enter = (e: DragEvent) => {
      e.preventDefault();
      dragCountRef.current++;
      setDragOverlay(true);
    };
    const leave = (e: DragEvent) => {
      e.preventDefault();
      dragCountRef.current--;
      if (dragCountRef.current <= 0) {
        dragCountRef.current = 0;
        setDragOverlay(false);
      }
    };
    const over = (e: DragEvent) => e.preventDefault();
    const drop = (e: DragEvent) => {
      e.preventDefault();
      dragCountRef.current = 0;
      setDragOverlay(false);
      const target = (e.target as HTMLElement).closest("[data-panel]");
      if (target) return;
      const files = e.dataTransfer?.files;
      if (!files?.length) return;
      const s = stateRef.current;
      if (files.length === 1) {
        const slot = !s.left.content.trim()
          ? "left"
          : !s.right.content.trim()
            ? "right"
            : null;
        if (slot) readFile(files[0], slot);
      } else {
        readFile(files[0], "left");
        if (files[1]) readFile(files[1], "right");
      }
    };
    document.addEventListener("dragenter", enter);
    document.addEventListener("dragleave", leave);
    document.addEventListener("dragover", over);
    document.addEventListener("drop", drop);
    return () => {
      document.removeEventListener("dragenter", enter);
      document.removeEventListener("dragleave", leave);
      document.removeEventListener("dragover", over);
      document.removeEventListener("drop", drop);
    };
  }, [readFile]);

  // Diff computation
  const v1 = state.left.content.trim();
  const v2 = state.right.content.trim();
  const isEmpty = !v1 || !v2;
  const leftFormat = state.left.format;
  const rightFormat = state.right.format;
  const isStructuredLeft = STRUCTURED_FORMATS.includes(leftFormat);
  const isStructuredRight = STRUCTURED_FORMATS.includes(rightFormat);
  const isMismatch =
    !isEmpty && isStructuredLeft !== isStructuredRight
      ? false // allow structured vs structured or text vs text freely
      : !isEmpty && isStructuredLeft && isStructuredRight && leftFormat !== rightFormat;

  let error: string | null = null;
  let diffResult: DiffResult | null = null;
  let missingInLeft: MissingKeysResult = {};
  let missingInRight: MissingKeysResult = {};
  let isTextMode = false;

  if (!isEmpty) {
    if (isMismatch) {
      error = `Format mismatch: ${FORMAT_LABELS[leftFormat]} vs ${FORMAT_LABELS[rightFormat]}. Both panels must use the same structured format for key comparison. Use "Text" mode to force text diff.`;
    } else if (isStructuredLeft && isStructuredRight && leftFormat === rightFormat) {
      // Structured diff (JSON, YAML, TOML)
      const p1 = parseStructured(v1, leftFormat);
      const p2 = parseStructured(v2, rightFormat);
      if (!p1.ok) {
        error = `Left: ${p1.error}`;
      } else if (!p2.ok) {
        error = `Right: ${p2.error}`;
      } else {
        const label1 = truncate(stripSuffix(state.left.fileName), 24);
        const label2 = truncate(stripSuffix(state.right.fileName), 24);
        missingInLeft = findMissing(
          p1.data,
          p2.data,
          state.compareValues,
          label1,
          label2,
        );
        missingInRight = findMissing(
          p2.data,
          p1.data,
          state.compareValues,
          label2,
          label1,
        );
        diffResult = buildDiff(p1.data, p2.data, state.compareValues);
      }
    } else {
      // Text diff for everything else
      isTextMode = true;
      diffResult = buildTextDiff(v1, v2, {
        ignoreWhitespace: settings.ignoreWhitespace,
        ignoreCase: settings.ignoreCase,
      });
    }
  }

  const showKeysTab = !isTextMode;

  function handleCopy() {
    let text: string;
    if (state.activeTab === "keys" && showKeysTab) {
      text = `Missing in ${stripSuffix(state.left.fileName)}:\n${formatMissingDisplay(missingInLeft)}\n\nMissing in ${stripSuffix(state.right.fileName)}:\n${formatMissingDisplay(missingInRight)}`;
    } else {
      text = diffResult?.lines.map((l) => l.text).join("\n") ?? "";
    }
    navigator.clipboard.writeText(text).then(() => showToast("Copied"));
  }

  if (!hydrated) {
    return (
      <>
        <Navbar />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-5" />
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar onSave={handleSave} isSaved={isSaved} />

      {dragOverlay && (
        <div className="fixed inset-2 z-50 flex items-center justify-center rounded-lg border-2 border-dashed border-accent bg-accent-dim/5">
          <span className="rounded-md border border-accent-dim bg-bg-elevated px-5 py-2.5 text-sm font-medium text-accent">
            Drop files here
          </span>
        </div>
      )}

      <Toast {...toast} />
      <ShortcutsModal open={showShortcuts} onClose={() => setShowShortcuts(false)} />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-5" aria-label="Comparison editor">
        <div className="mb-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
          <EditorPanel
            label={state.left.fileName}
            value={state.left.content}
            format={state.left.format}
            formatOnPaste={settings.formatOnPaste}
            onChange={(v) => handleChange("left", v)}
            onFormatChange={(f) => handleFormatChange("left", f)}
            onFormat={() => handleFormat("left")}
            onMinify={STRUCTURED_FORMATS.includes(state.left.format) ? () => handleMinify("left") : undefined}
            onClear={() => handleClear("left")}
            onFileDrop={(f) => readFile(f, "left")}
            onFileUpload={(f) => readFile(f, "left")}
            onLabelChange={(l) => handleLabelChange("left", l)}
          />
          <EditorPanel
            label={state.right.fileName}
            value={state.right.content}
            format={state.right.format}
            formatOnPaste={settings.formatOnPaste}
            onChange={(v) => handleChange("right", v)}
            onFormatChange={(f) => handleFormatChange("right", f)}
            onFormat={() => handleFormat("right")}
            onMinify={STRUCTURED_FORMATS.includes(state.right.format) ? () => handleMinify("right") : undefined}
            onClear={() => handleClear("right")}
            onFileDrop={(f) => readFile(f, "right")}
            onFileUpload={(f) => readFile(f, "right")}
            onLabelChange={(l) => handleLabelChange("right", l)}
          />
        </div>

        <div className="mb-4 flex items-center justify-center gap-2">
          <SampleDropdown onSelect={handleSample} />
          <button
            onClick={handleSwap}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-bg-surface px-3 py-1.5 text-xs font-medium text-text-muted transition-all hover:border-border-focus hover:bg-bg-elevated hover:text-text"
            title="Swap inputs (Ctrl+Shift+S)"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            Swap
          </button>
        </div>

        {!v1 && !v2 && (
          <div className="mb-4 rounded-lg border border-dashed border-border bg-bg-surface/50 py-6 text-center">
            <p className="text-sm text-text-muted">
              Paste, drop, or upload content in both panels to compare.
            </p>
            <div className="mt-1.5 text-xs text-text-muted">
              Not sure how it works?{" "}
              <SampleDropdown onSelect={handleSample} />
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-lg border border-border bg-bg-surface" role="region" aria-label="Diff results">
          <div className="flex flex-wrap items-center gap-3 border-b border-border bg-bg-elevated px-3 py-2 lg:h-[42px] lg:py-0">
            <div className="flex items-center gap-1" role="tablist" aria-label="View mode">
              {showKeysTab && (
                <button
                  role="tab"
                  aria-selected={state.activeTab === "keys"}
                  onClick={() => update({ activeTab: "keys" })}
                  className={`cursor-pointer rounded-[5px] px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    state.activeTab === "keys"
                      ? "bg-bg-hover text-text"
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  Keys
                </button>
              )}
              <button
                role="tab"
                aria-selected={state.activeTab === "diff" || (isTextMode && state.activeTab === "keys")}
                onClick={() => update({ activeTab: "diff" })}
                className={`cursor-pointer rounded-[5px] px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  state.activeTab === "diff" || (isTextMode && state.activeTab === "keys")
                    ? "bg-bg-hover text-text"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                Diff
              </button>
              {isTextMode && !isEmpty && !error && (
                <span className="ml-1 rounded bg-bg-hover px-2 py-0.5 text-[10px] text-text-muted">
                  Text mode
                </span>
              )}
              {diffResult && (
                <div className="ml-1 flex items-center rounded-[5px] border border-border" role="group" aria-label="Diff layout">
                  <button
                    onClick={() => updateSetting("diffViewMode", "unified")}
                    className={`cursor-pointer rounded-l-[4px] px-2 py-1 text-[11px] transition-colors ${
                      settings.diffViewMode === "unified"
                        ? "bg-bg-hover text-text"
                        : "text-text-muted hover:text-text-secondary"
                    }`}
                    title="Unified view"
                    aria-label="Unified view"
                    aria-pressed={settings.diffViewMode === "unified"}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                  </button>
                  <button
                    onClick={() => updateSetting("diffViewMode", "split")}
                    className={`cursor-pointer rounded-r-[4px] px-2 py-1 text-[11px] transition-colors ${
                      settings.diffViewMode === "split"
                        ? "bg-bg-hover text-text"
                        : "text-text-muted hover:text-text-secondary"
                    }`}
                    title="Side-by-side view"
                    aria-label="Side-by-side view"
                    aria-pressed={settings.diffViewMode === "split"}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="12" y1="3" x2="12" y2="21" />
                    </svg>
                  </button>
                </div>
              )}
              {diffResult && (
                <button
                  onClick={() => updateSetting("compactDiff", !settings.compactDiff)}
                  className={`ml-1 cursor-pointer rounded-[5px] px-2 py-1 text-[11px] transition-colors ${
                    settings.compactDiff
                      ? "bg-bg-hover text-text"
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                  title={settings.compactDiff ? "Showing changes only — click to show all" : "Showing all lines — click to hide unchanged"}
                  aria-label="Toggle compact diff"
                  aria-pressed={settings.compactDiff}
                >
                  {settings.compactDiff ? "Changes only" : "Show all"}
                </button>
              )}
            </div>
            <div className="ml-auto flex items-center gap-2">
              {diffResult && (
                <StatsBar
                  added={diffResult.added}
                  removed={diffResult.removed}
                  changed={diffResult.changed}
                />
              )}
              <label
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-[5px] px-2.5 py-1 text-xs text-text-secondary transition-colors hover:bg-bg-hover"
                title="Auto-format content when pasting"
              >
                <input
                  type="checkbox"
                  checked={settings.formatOnPaste}
                  onChange={(e) => updateSetting("formatOnPaste", e.target.checked)}
                  className="h-[13px] w-[13px] cursor-pointer accent-accent"
                />
                Format on paste
              </label>
              {isTextMode && (
                <>
                  <label
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-[5px] px-2.5 py-1 text-xs text-text-secondary transition-colors hover:bg-bg-hover"
                    title="Ignore leading/trailing whitespace when comparing lines"
                  >
                    <input
                      type="checkbox"
                      checked={settings.ignoreWhitespace}
                      onChange={(e) => updateSetting("ignoreWhitespace", e.target.checked)}
                      className="h-[13px] w-[13px] cursor-pointer accent-accent"
                    />
                    Ignore whitespace
                  </label>
                  <label
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-[5px] px-2.5 py-1 text-xs text-text-secondary transition-colors hover:bg-bg-hover"
                    title="Treat uppercase and lowercase as equal"
                  >
                    <input
                      type="checkbox"
                      checked={settings.ignoreCase}
                      onChange={(e) => updateSetting("ignoreCase", e.target.checked)}
                      className="h-[13px] w-[13px] cursor-pointer accent-accent"
                    />
                    Ignore case
                  </label>
                </>
              )}
              {showKeysTab && (
                <label
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-[5px] px-2.5 py-1 text-xs text-text-secondary transition-colors hover:bg-bg-hover"
                  title="Also detect value differences for keys that exist in both"
                >
                  <input
                    type="checkbox"
                    checked={state.compareValues}
                    onChange={(e) =>
                      update({ compareValues: e.target.checked })
                    }
                    className="h-[13px] w-[13px] cursor-pointer accent-accent"
                  />
                  Include value changes
                </label>
              )}
              <button
                onClick={handleCopy}
                className="cursor-pointer rounded px-2.5 py-1 text-xs text-text-muted transition-colors hover:bg-bg-hover hover:text-text-secondary"
              >
                Copy
              </button>
            </div>
          </div>

          {state.activeTab === "keys" && showKeysTab ? (
            <KeysView
              missingInLeft={missingInLeft}
              missingInRight={missingInRight}
              leftLabel={stripSuffix(state.left.fileName)}
              rightLabel={stripSuffix(state.right.fileName)}
              compareValues={state.compareValues}
              error={error}
              isEmpty={isEmpty}
            />
          ) : (
            <DiffView result={diffResult} error={error} isEmpty={isEmpty} viewMode={settings.diffViewMode} compact={settings.compactDiff} />
          )}
        </div>

        <div className="pt-4 pb-2 text-center text-[11px] text-text-muted">
          Drop files anywhere &middot; Press{" "}
          <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px]">
            ?
          </kbd>{" "}
          for shortcuts
        </div>
      </main>

      <Footer />
    </>
  );
}
