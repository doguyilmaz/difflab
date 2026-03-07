import type { Format } from "@/types";

const EXTENSION_MAP: Record<string, Format> = {
  json: "json",
  yaml: "yaml",
  yml: "yaml",
  toml: "toml",
  txt: "text",
  md: "markdown",
  mdx: "markdown",
  js: "javascript",
  jsx: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  ts: "typescript",
  tsx: "typescript",
  mts: "typescript",
  cts: "typescript",
  kt: "kotlin",
  kts: "kotlin",
  swift: "swift",
  html: "html",
  htm: "html",
  css: "css",
  scss: "css",
};

export function detectFormatFromExtension(fileName: string): Format | null {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (!ext) return null;
  return EXTENSION_MAP[ext] ?? null;
}

export function detectFormatFromContent(content: string): Format {
  const trimmed = content.trim();
  if (!trimmed) return "text";

  // JSON: starts with { or [
  if (/^[\[{]/.test(trimmed)) {
    try {
      JSON.parse(trimmed);
      return "json";
    } catch {}
  }

  // YAML: starts with --- or has key: value pattern on first line
  if (trimmed.startsWith("---") || /^[\w-]+\s*:/.test(trimmed)) {
    // Avoid false positives with TOML (which also has key: but uses = more)
    if (!trimmed.includes(" = ") && !trimmed.startsWith("[")) {
      return "yaml";
    }
  }

  // TOML: has [section] headers or key = value pattern
  if (/^\[[\w.-]+\]/m.test(trimmed) || /^[\w-]+\s*=\s*/m.test(trimmed)) {
    return "toml";
  }

  // Markdown: starts with # heading or has common markdown patterns
  if (/^#{1,6}\s/.test(trimmed) || /^\*{3,}$/m.test(trimmed)) {
    return "markdown";
  }

  // HTML: starts with < tag
  if (/^<(!DOCTYPE|html|head|body|div|span|p\b)/i.test(trimmed)) {
    return "html";
  }

  // JavaScript/TypeScript heuristics
  if (
    /^(import|export|const|let|var|function|class|interface|type|enum)\s/.test(
      trimmed,
    )
  ) {
    if (/\b(interface|type|enum)\s+\w+/.test(trimmed)) return "typescript";
    return "javascript";
  }

  // Kotlin
  if (/^(package|import|fun|val|var|class|data class|object)\s/.test(trimmed)) {
    return "kotlin";
  }

  // Swift
  if (/^(import|func|let|var|struct|class|enum|protocol)\s/.test(trimmed)) {
    return "swift";
  }

  // CSS
  if (/^(@import|@media|@keyframes|[.#][\w-]+\s*\{|:\s*root)/m.test(trimmed)) {
    return "css";
  }

  return "text";
}

export function detectFormat(
  content: string,
  fileName: string,
): Format {
  const fromExt = detectFormatFromExtension(fileName);
  if (fromExt) return fromExt;
  return detectFormatFromContent(content);
}
