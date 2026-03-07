import DOMPurify from "dompurify";
import type { Format } from "@/types";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function highlightJsonStr(escaped: string): string {
  return escaped.replace(
    /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false)\b|\b(null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
    (m, s, colon, bool, nul, num) => {
      if (s)
        return colon
          ? `<span class="hl-key">${s}</span>${colon}`
          : `<span class="hl-str">${s}</span>`;
      if (bool) return `<span class="hl-bool">${bool}</span>`;
      if (nul) return `<span class="hl-null">${nul}</span>`;
      if (num) return `<span class="hl-num">${num}</span>`;
      return m;
    },
  );
}

function highlightYamlStr(escaped: string): string {
  return escaped
    .replace(/^(\s*)([\w.-]+)(\s*:)/gm, '$1<span class="hl-key">$2</span>$3')
    .replace(/:\s+(".*?")/g, ': <span class="hl-str">$1</span>')
    .replace(/:\s+('.*?')/g, ': <span class="hl-str">$1</span>')
    .replace(/\b(true|false|yes|no|on|off)\b/gi, '<span class="hl-bool">$&</span>')
    .replace(/\b(null|~)\b/g, '<span class="hl-null">$&</span>')
    .replace(/(#.*)$/gm, '<span class="hl-comment">$1</span>')
    .replace(/:\s+(-?\d+(?:\.\d+)?)\s*$/gm, ': <span class="hl-num">$1</span>');
}

function highlightTomlStr(escaped: string): string {
  return escaped
    .replace(/^\[([^\]]+)\]/gm, '[<span class="hl-key">$1</span>]')
    .replace(/^(\s*)([\w.-]+)(\s*=)/gm, '$1<span class="hl-key">$2</span>$3')
    .replace(/=\s*(".*?")/g, '= <span class="hl-str">$1</span>')
    .replace(/=\s*('.*?')/g, '= <span class="hl-str">$1</span>')
    .replace(/\b(true|false)\b/g, '<span class="hl-bool">$&</span>')
    .replace(/(#.*)$/gm, '<span class="hl-comment">$1</span>')
    .replace(/=\s*(-?\d+(?:\.\d+)?)\s*$/gm, '= <span class="hl-num">$1</span>');
}

function highlightCodeStr(escaped: string): string {
  return escaped
    .replace(
      /\b(import|export|from|const|let|var|function|class|interface|type|enum|return|if|else|for|while|switch|case|break|continue|new|this|super|extends|implements|async|await|try|catch|throw|finally|default|typeof|instanceof|void|null|undefined|true|false|package|fun|val|struct|protocol|guard|defer|init|self|override|private|public|protected|static|final|abstract|open|sealed|data|object|companion|lazy|suspend|internal|func|import|where|as|is|in|out)\b/g,
      '<span class="hl-key">$&</span>',
    )
    .replace(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)/g, '<span class="hl-str">$&</span>')
    .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="hl-num">$&</span>')
    .replace(/(\/\/.*$)/gm, '<span class="hl-comment">$1</span>')
    .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="hl-comment">$1</span>');
}

const highlighters: Partial<Record<Format, (s: string) => string>> = {
  json: highlightJsonStr,
  yaml: highlightYamlStr,
  toml: highlightTomlStr,
  javascript: highlightCodeStr,
  typescript: highlightCodeStr,
  kotlin: highlightCodeStr,
  swift: highlightCodeStr,
  css: highlightCodeStr,
};

export function highlight(str: string, format: Format): string {
  if (!str) return "";
  const escaped = escapeHtml(str);
  const fn = highlighters[format];
  const highlighted = fn ? fn(escaped) : escaped;
  return DOMPurify.sanitize(highlighted, {
    ALLOWED_TAGS: ["span"],
    ALLOWED_ATTR: ["class"],
  });
}

// Backward compat
export function highlightJson(str: string): string {
  return highlight(str, "json");
}
