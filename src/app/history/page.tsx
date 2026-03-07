"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Toast, useToast } from "@/components/ui/toast";
import {
  listComparisons,
  deleteComparison,
  deleteAllComparisons,
  updateComparison,
  exportHistory,
  importHistory,
  getStorageEstimate,
  type Comparison,
} from "@/lib/db";
import { FORMAT_LABELS, type Format } from "@/types";

async function fetchComparisons(search: string, format: string) {
  return listComparisons({
    search: search || undefined,
    format: (format || undefined) as Format | undefined,
    sortBy: "updatedAt",
  });
}

export default function HistoryPage() {
  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [search, setSearch] = useState("");
  const [formatFilter, setFormatFilter] = useState<Format | "">("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTags, setEditingTags] = useState<string | null>(null);
  const [storageWarning, setStorageWarning] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const tagsInputRef = useRef<HTMLInputElement>(null);
  const { toast, show: showToast } = useToast();

  const load = useCallback(async () => {
    const results = await fetchComparisons(search, formatFilter);
    setComparisons(results);
    setLoading(false);
    const estimate = await getStorageEstimate();
    if (estimate && estimate.percentage > 80) {
      setStorageWarning(true);
    }
  }, [search, formatFilter]);

  useEffect(() => {
    // Fetch from IndexedDB on mount and when filters change
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteComparison(id);
      showToast("Deleted");
      load();
    },
    [load, showToast],
  );

  const handleClearAll = useCallback(async () => {
    if (!confirm("Delete all comparison history? This cannot be undone.")) return;
    await deleteAllComparisons();
    showToast("All history cleared");
    load();
  }, [load, showToast]);

  const handleExport = useCallback(async () => {
    const json = await exportHistory();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `difflab-history-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Exported");
  }, [showToast]);

  const handleImport = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        const count = await importHistory(text);
        showToast(`Imported ${count} comparisons`);
        load();
      } catch {
        showToast("Invalid backup file", true);
      }
    };
    input.click();
  }, [load, showToast]);

  const handleLoad = useCallback((comp: Comparison) => {
    sessionStorage.setItem(
      "difflab-state",
      JSON.stringify({
        left: {
          content: comp.leftContent,
          fileName: comp.leftFileName,
          format: comp.leftFormat,
        },
        right: {
          content: comp.rightContent,
          fileName: comp.rightFileName,
          format: comp.rightFormat,
        },
        activeTab: "diff",
        compareValues: true,
      }),
    );
    window.location.href = "/";
  }, []);

  const handleTitleEdit = useCallback((id: string) => {
    setEditingId(id);
    setTimeout(() => titleInputRef.current?.select(), 0);
  }, []);

  const handleTitleSubmit = useCallback(async (id: string, currentTitle: string) => {
    const newTitle = titleInputRef.current?.value.trim();
    setEditingId(null);
    if (newTitle && newTitle !== currentTitle) {
      await updateComparison(id, { title: newTitle });
      load();
    }
  }, [load]);

  const handleTagsEdit = useCallback((id: string) => {
    setEditingTags(id);
    setTimeout(() => tagsInputRef.current?.focus(), 0);
  }, []);

  const handleTagsSubmit = useCallback(async (id: string) => {
    const raw = tagsInputRef.current?.value.trim() ?? "";
    setEditingTags(null);
    const tags = raw ? raw.split(",").map((t) => t.trim()).filter(Boolean) : [];
    await updateComparison(id, { tags });
    load();
  }, [load]);

  return (
    <>
      <Navbar />
      <Toast {...toast} />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-5">
        {storageWarning && (
          <div className="mb-4 rounded-lg border border-changed bg-changed-bg px-4 py-3 text-xs text-changed">
            Storage usage is above 80%. Consider exporting and clearing old comparisons.
          </div>
        )}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-text-muted transition-colors hover:text-text"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>
            <h1 className="text-lg font-semibold">History</h1>
            <span className="text-sm text-text-muted">
              {comparisons.length} saved
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleImport}
              className="cursor-pointer rounded-md border border-border bg-bg-surface px-3 py-1.5 text-xs text-text-muted transition-colors hover:border-border-focus hover:text-text-secondary"
            >
              Import
            </button>
            <button
              onClick={handleExport}
              className="cursor-pointer rounded-md border border-border bg-bg-surface px-3 py-1.5 text-xs text-text-muted transition-colors hover:border-border-focus hover:text-text-secondary"
            >
              Export
            </button>
            {comparisons.length > 0 && (
              <button
                onClick={handleClearAll}
                className="cursor-pointer rounded-md border border-border bg-bg-surface px-3 py-1.5 text-xs text-text-muted transition-colors hover:border-removed hover:bg-removed-bg hover:text-removed"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, filename, or tag..."
            className="flex-1 rounded-md border border-border bg-bg-surface px-3 py-2 text-sm text-text outline-none transition-colors placeholder:text-text-muted focus:border-border-focus"
          />
          <select
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value as Format | "")}
            className="cursor-pointer rounded-md border border-border bg-bg-surface px-3 py-2 text-sm text-text-muted outline-none transition-colors hover:border-border-focus"
          >
            <option value="">All formats</option>
            {(Object.keys(FORMAT_LABELS) as Format[]).map((f) => (
              <option key={f} value={f}>
                {FORMAT_LABELS[f]}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-text-muted">
            Loading...
          </div>
        ) : comparisons.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-text-muted">
              {search || formatFilter
                ? "No matching comparisons found."
                : "No saved comparisons yet."}
            </p>
            <p className="mt-2 text-xs text-text-muted">
              Save comparisons from the main page to access them later.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {comparisons.map((comp) => (
              <div
                key={comp.id}
                className="group flex items-center gap-3 rounded-lg border border-border bg-bg-surface p-3 transition-colors hover:border-border-focus"
              >
                <button
                  onClick={() => handleLoad(comp)}
                  className="flex min-w-0 flex-1 cursor-pointer flex-col gap-1 text-left"
                >
                  <div className="flex items-center gap-2">
                    {editingId === comp.id ? (
                      <input
                        ref={titleInputRef}
                        defaultValue={comp.title}
                        onClick={(e) => e.stopPropagation()}
                        onBlur={() => handleTitleSubmit(comp.id, comp.title)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleTitleSubmit(comp.id, comp.title);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        className="truncate rounded border border-border-focus bg-bg-surface px-1 py-0.5 text-sm font-medium text-text-secondary outline-none"
                        autoFocus
                      />
                    ) : (
                      <span className="truncate text-sm font-medium text-text-secondary">
                        {comp.title}
                      </span>
                    )}
                    <span className="shrink-0 rounded bg-bg-elevated px-1.5 py-0.5 text-[10px] text-text-muted">
                      {FORMAT_LABELS[comp.leftFormat]}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-text-muted">
                    <span>{comp.leftFileName} vs {comp.rightFileName}</span>
                    <span>{new Date(comp.updatedAt).toLocaleDateString()}</span>
                  </div>
                  {editingTags === comp.id ? (
                    <div className="mt-1" onClick={(e) => e.stopPropagation()}>
                      <input
                        ref={tagsInputRef}
                        defaultValue={comp.tags.join(", ")}
                        onBlur={() => handleTagsSubmit(comp.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleTagsSubmit(comp.id);
                          if (e.key === "Escape") setEditingTags(null);
                        }}
                        placeholder="tag1, tag2, ..."
                        className="w-full rounded border border-border-focus bg-bg-surface px-1.5 py-0.5 text-[11px] text-text-secondary outline-none placeholder:text-text-muted"
                        autoFocus
                      />
                    </div>
                  ) : comp.tags.length > 0 ? (
                    <div className="mt-1 flex gap-1">
                      {comp.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-accent-dim px-1.5 py-0.5 text-[10px] text-accent"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </button>
                <div className="flex shrink-0 flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleTitleEdit(comp.id); }}
                    className="cursor-pointer rounded p-1.5 text-text-muted transition-colors hover:bg-bg-hover hover:text-text-secondary"
                    title="Edit title"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleTagsEdit(comp.id); }}
                    className="cursor-pointer rounded p-1.5 text-text-muted transition-colors hover:bg-bg-hover hover:text-text-secondary"
                    title="Edit tags"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(comp.id)}
                    className="cursor-pointer rounded p-1.5 text-text-muted transition-all hover:bg-removed-bg hover:text-removed"
                    title="Delete"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
