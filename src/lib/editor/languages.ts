import type { Extension } from "@codemirror/state";
import type { Format } from "@/types";

const langCache = new Map<Format, Extension>();

export async function getLanguageExtension(format: Format): Promise<Extension> {
  const cached = langCache.get(format);
  if (cached) return cached;

  let ext: Extension;

  switch (format) {
    case "json": {
      const { json } = await import("@codemirror/lang-json");
      ext = json();
      break;
    }
    case "yaml": {
      const { yaml } = await import("@codemirror/lang-yaml");
      ext = yaml();
      break;
    }
    case "javascript": {
      const { javascript } = await import("@codemirror/lang-javascript");
      ext = javascript();
      break;
    }
    case "typescript": {
      const { javascript } = await import("@codemirror/lang-javascript");
      ext = javascript({ typescript: true });
      break;
    }
    case "html": {
      const { html } = await import("@codemirror/lang-html");
      ext = html();
      break;
    }
    case "css": {
      const { css } = await import("@codemirror/lang-css");
      ext = css();
      break;
    }
    case "markdown": {
      const { markdown } = await import("@codemirror/lang-markdown");
      ext = markdown();
      break;
    }
    default:
      // For formats without CM6 support (toml, kotlin, swift, text)
      // return empty extension — plain text editing
      ext = [];
      break;
  }

  langCache.set(format, ext);
  return ext;
}
