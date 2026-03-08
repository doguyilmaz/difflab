export type DiffLineType = "added" | "removed" | "changed" | "context";

export interface DiffLine {
  type: DiffLineType;
  text: string;
}

export interface DiffResult {
  lines: DiffLine[];
  added: number;
  removed: number;
  changed: number;
}

export interface PanelState {
  content: string;
  fileName: string;
  format: Format;
}

export type ActiveTab = "keys" | "diff";
export type DiffViewMode = "unified" | "split";

export interface SideBySideRow {
  left: DiffLine | null;
  right: DiffLine | null;
}

export interface MissingKeysResult {
  [key: string]: unknown;
}

export type Format =
  | "json"
  | "yaml"
  | "toml"
  | "text"
  | "markdown"
  | "javascript"
  | "typescript"
  | "kotlin"
  | "swift"
  | "html"
  | "css";

export const STRUCTURED_FORMATS: Format[] = ["json", "yaml", "toml"];
export const TEXT_FORMATS: Format[] = [
  "text",
  "markdown",
  "javascript",
  "typescript",
  "kotlin",
  "swift",
  "html",
  "css",
];

export const FORMAT_LABELS: Record<Format, string> = {
  json: "JSON",
  yaml: "YAML",
  toml: "TOML",
  text: "Plain Text",
  markdown: "Markdown",
  javascript: "JavaScript",
  typescript: "TypeScript",
  kotlin: "Kotlin",
  swift: "Swift",
  html: "HTML",
  css: "CSS",
};
