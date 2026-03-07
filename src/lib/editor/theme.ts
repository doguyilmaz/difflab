import { EditorView } from "@codemirror/view";

export const diffLabTheme = EditorView.theme(
  {
    "&": {
      fontSize: "13px",
      fontFamily: "var(--font-geist-mono), monospace",
      backgroundColor: "transparent",
    },
    ".cm-content": {
      padding: "12px",
      caretColor: "var(--text)",
      lineHeight: "1.65",
    },
    ".cm-line": {
      padding: "0",
    },
    ".cm-gutters": {
      backgroundColor: "transparent",
      borderRight: "none",
      color: "var(--text-muted)",
      fontSize: "11px",
      minWidth: "32px",
    },
    ".cm-gutter.cm-lineNumbers .cm-gutterElement": {
      padding: "0 8px 0 4px",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "transparent",
      color: "var(--text-secondary)",
    },
    ".cm-activeLine": {
      backgroundColor: "var(--bg-hover)",
    },
    ".cm-selectionBackground": {
      backgroundColor: "var(--accent-dim) !important",
    },
    "&.cm-focused .cm-selectionBackground": {
      backgroundColor: "var(--accent-dim) !important",
    },
    ".cm-cursor": {
      borderLeftColor: "var(--text)",
    },
    ".cm-matchingBracket": {
      backgroundColor: "var(--bg-hover)",
      outline: "1px solid var(--border-focus)",
    },
    ".cm-searchMatch": {
      backgroundColor: "var(--changed-bg)",
      outline: "1px solid var(--changed)",
    },
    ".cm-searchMatch.cm-searchMatch-selected": {
      backgroundColor: "var(--accent-dim)",
    },
    ".cm-foldPlaceholder": {
      backgroundColor: "var(--bg-elevated)",
      border: "1px solid var(--border)",
      color: "var(--text-muted)",
      padding: "0 4px",
      borderRadius: "3px",
    },
    ".cm-tooltip": {
      backgroundColor: "var(--bg-elevated)",
      border: "1px solid var(--border)",
      borderRadius: "6px",
      color: "var(--text-secondary)",
      fontSize: "12px",
    },
    ".cm-panels": {
      backgroundColor: "var(--bg-elevated)",
      borderBottom: "1px solid var(--border)",
      color: "var(--text-secondary)",
    },
    ".cm-panels input": {
      backgroundColor: "var(--bg-surface)",
      border: "1px solid var(--border)",
      borderRadius: "4px",
      color: "var(--text)",
      padding: "2px 6px",
      fontSize: "12px",
    },
    ".cm-panels button": {
      backgroundColor: "var(--bg-surface)",
      border: "1px solid var(--border)",
      borderRadius: "4px",
      color: "var(--text-secondary)",
      padding: "2px 8px",
      fontSize: "12px",
      cursor: "pointer",
    },
    ".cm-scroller": {
      overflow: "auto",
    },
    // Syntax highlighting via CM's own highlight tags
    ".ͼb": { color: "var(--hl-key, #8bb8e0)" },   // keyword
    ".ͼc": { color: "var(--hl-num, #d4a66a)" },   // number
    ".ͼd": { color: "var(--hl-str, #7ecba1)" },   // string
    ".ͼe": { color: "var(--hl-bool, #b09eda)" },  // bool
    ".ͼm": { color: "var(--hl-comment, #555560)", fontStyle: "italic" }, // comment
  },
  { dark: true },
);
