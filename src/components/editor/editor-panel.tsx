"use client";

import dynamic from "next/dynamic";
import type { Format } from "@/types";
import { FORMAT_LABELS, STRUCTURED_FORMATS } from "@/types";
import { formatContent } from "@/lib/format/formatter";
import { useCallback, useRef, useState } from "react";

const CodeMirrorEditor = dynamic(
  () =>
    import("@/components/editor/codemirror-editor").then(
      (m) => m.CodeMirrorEditor,
    ),
  { ssr: false, loading: () => <div className="min-h-[260px]" /> },
);

const ALL_FORMATS: Format[] = [
  "json", "yaml", "toml", "text", "markdown",
  "javascript", "typescript", "kotlin", "swift", "html", "css",
];

const FORMAT_EXTENSIONS: Record<Format, string> = {
  json: ".json",
  yaml: ".yaml",
  toml: ".toml",
  text: ".txt",
  markdown: ".md",
  javascript: ".js",
  typescript: ".ts",
  kotlin: ".kt",
  swift: ".swift",
  html: ".html",
  css: ".css",
};

interface EditorPanelProps {
  label: string;
  value: string;
  format: Format;
  formatOnPaste?: boolean;
  onChange: (value: string) => void;
  onFormatChange: (format: Format) => void;
  onFormat: () => void;
  onClear: () => void;
  onFileDrop: (file: File) => void;
  onFileUpload?: (file: File) => void;
  onLabelChange?: (label: string) => void;
}

export function EditorPanel({
  label,
  value,
  format,
  formatOnPaste,
  onChange,
  onFormatChange,
  onFormat,
  onClear,
  onFileDrop,
  onFileUpload,
  onLabelChange,
}: EditorPanelProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const labelInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (e.dataTransfer.files.length) {
        onFileDrop(e.dataTransfer.files[0]);
      }
    },
    [onFileDrop],
  );

  const handleDownload = useCallback(() => {
    if (!value.trim()) return;
    // Format structured content before download
    let downloadContent = value;
    if (STRUCTURED_FORMATS.includes(format)) {
      const result = formatContent(value, format);
      if (result.ok) downloadContent = result.result;
    }
    const blob = new Blob([downloadContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    // Use label as filename, add extension if missing
    let fileName = label.replace(" (edited)", "").trim() || "file";
    const ext = FORMAT_EXTENSIONS[format];
    if (!fileName.includes(".")) fileName += ext;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }, [value, format, label]);

  const handleLabelDoubleClick = useCallback(() => {
    if (!onLabelChange) return;
    setIsEditingLabel(true);
    setTimeout(() => labelInputRef.current?.select(), 0);
  }, [onLabelChange]);

  const handleLabelSubmit = useCallback(() => {
    setIsEditingLabel(false);
    const newLabel = labelInputRef.current?.value.trim();
    if (newLabel && newLabel !== label && onLabelChange) {
      onLabelChange(newLabel);
    }
  }, [label, onLabelChange]);

  const handleUploadClick = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,.yaml,.yml,.toml,.txt,.md,.js,.ts,.kt,.swift,.html,.css,.jsx,.tsx";
    input.onchange = () => {
      const file = input.files?.[0];
      if (file && onFileUpload) onFileUpload(file);
    };
    input.click();
  }, [onFileUpload]);

  const lineCount = value ? value.split("\n").length : 0;

  return (
    <div
      className={`overflow-hidden rounded-lg border bg-bg-surface transition-colors focus-within:border-border-focus ${
        isDragOver ? "border-accent bg-accent-dim/5" : "border-border"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex h-[38px] items-center justify-between border-b border-border bg-bg-elevated px-3 text-xs">
        <div className="flex items-center gap-2 overflow-hidden">
          {isEditingLabel ? (
            <input
              ref={labelInputRef}
              defaultValue={label.replace(" (edited)", "")}
              onBlur={handleLabelSubmit}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleLabelSubmit();
                if (e.key === "Escape") setIsEditingLabel(false);
              }}
              className="max-w-[140px] rounded border border-border-focus bg-bg-surface px-1 py-0.5 text-xs font-medium text-text-secondary outline-none"
              autoFocus
            />
          ) : (
            <span
              className={`max-w-[140px] truncate font-medium text-text-secondary ${onLabelChange ? "cursor-pointer rounded px-1 py-0.5 transition-colors hover:bg-bg-hover" : ""}`}
              onDoubleClick={handleLabelDoubleClick}
              title={onLabelChange ? "Double-click to rename" : undefined}
            >
              {label}
            </span>
          )}
          <select
            value={format}
            onChange={(e) => onFormatChange(e.target.value as Format)}
            className="cursor-pointer rounded border border-border bg-bg-surface px-1.5 py-0.5 text-[11px] text-text-muted outline-none transition-colors hover:border-border-focus hover:text-text-secondary"
          >
            {ALL_FORMATS.map((f) => (
              <option key={f} value={f}>
                {FORMAT_LABELS[f]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-0.5">
          {lineCount > 0 && (
            <span className="px-1.5 text-[10px] tabular-nums text-text-muted">
              {lineCount}L
            </span>
          )}
          {value.trim() && (
            <button
              onClick={handleDownload}
              className="cursor-pointer rounded px-1.5 py-1 text-text-muted transition-colors hover:bg-bg-hover hover:text-text-secondary"
              title="Download (formatted)"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>
          )}
          {onFileUpload && (
            <button
              onClick={handleUploadClick}
              className="cursor-pointer rounded px-1.5 py-1 text-text-muted transition-colors hover:bg-bg-hover hover:text-text-secondary"
              title="Upload file"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </button>
          )}
          <button
            onClick={onFormat}
            className="cursor-pointer rounded px-2.5 py-1 text-xs text-text-muted transition-colors hover:bg-bg-hover hover:text-text-secondary"
          >
            Format
          </button>
          <button
            onClick={onClear}
            className="cursor-pointer rounded px-2.5 py-1 text-xs text-text-muted transition-colors hover:bg-removed-bg hover:text-removed"
          >
            Clear
          </button>
        </div>
      </div>
      <CodeMirrorEditor
        value={value}
        format={format}
        formatOnPaste={formatOnPaste}
        onChange={onChange}
        onFormat={onFormat}
        placeholder={`Paste or drop ${FORMAT_LABELS[format]} here...`}
      />
    </div>
  );
}
