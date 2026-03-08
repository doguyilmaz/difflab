import type { Format } from "@/types";
import * as YAML from "yaml";
import * as TOML from "smol-toml";

export function formatContent(
  content: string,
  format: Format,
): { ok: true; result: string } | { ok: false; error: string } {
  const trimmed = content.trim();
  if (!trimmed) return { ok: false, error: "Empty content" };

  switch (format) {
    case "json":
      try {
        return { ok: true, result: JSON.stringify(JSON.parse(trimmed), null, 2) };
      } catch (e) {
        return { ok: false, error: `Invalid JSON: ${(e as Error).message}` };
      }

    case "yaml":
      try {
        const parsed = YAML.parse(trimmed);
        return { ok: true, result: YAML.stringify(parsed, { indent: 2 }) };
      } catch (e) {
        return { ok: false, error: `Invalid YAML: ${(e as Error).message}` };
      }

    case "toml":
      try {
        const parsed = TOML.parse(trimmed);
        return { ok: true, result: TOML.stringify(parsed) };
      } catch (e) {
        return { ok: false, error: `Invalid TOML: ${(e as Error).message}` };
      }

    default:
      return { ok: false, error: "Formatting not supported for this format" };
  }
}

export function minifyContent(
  content: string,
  format: Format,
): { ok: true; result: string } | { ok: false; error: string } {
  const trimmed = content.trim();
  if (!trimmed) return { ok: false, error: "Empty content" };

  switch (format) {
    case "json":
      try {
        return { ok: true, result: JSON.stringify(JSON.parse(trimmed)) };
      } catch (e) {
        return { ok: false, error: `Invalid JSON: ${(e as Error).message}` };
      }

    case "yaml":
      try {
        const parsed = YAML.parse(trimmed);
        // Compact YAML using flow collections
        const doc = new YAML.Document(parsed);
        doc.setIn([], parsed);
        return { ok: true, result: doc.toString({ collectionStyle: "flow" }).trim() };
      } catch (e) {
        return { ok: false, error: `Invalid YAML: ${(e as Error).message}` };
      }

    case "toml":
      // TOML doesn't really have a "minified" form, but we can re-stringify
      try {
        const parsed = TOML.parse(trimmed);
        return { ok: true, result: TOML.stringify(parsed) };
      } catch (e) {
        return { ok: false, error: `Invalid TOML: ${(e as Error).message}` };
      }

    default:
      return { ok: false, error: "Minify not supported for this format" };
  }
}

export function parseStructured(
  content: string,
  format: Format,
): { ok: true; data: Record<string, unknown> } | { ok: false; error: string } {
  const trimmed = content.trim();
  if (!trimmed) return { ok: false, error: "Empty content" };

  switch (format) {
    case "json":
      try {
        const data = JSON.parse(trimmed);
        if (typeof data !== "object" || data === null) {
          return { ok: false, error: "JSON root must be an object or array" };
        }
        return { ok: true, data };
      } catch (e) {
        return { ok: false, error: (e as Error).message };
      }

    case "yaml":
      try {
        const data = YAML.parse(trimmed);
        if (typeof data !== "object" || data === null) {
          return { ok: false, error: "YAML root must be a mapping or sequence" };
        }
        return { ok: true, data };
      } catch (e) {
        return { ok: false, error: (e as Error).message };
      }

    case "toml":
      try {
        const data = TOML.parse(trimmed) as Record<string, unknown>;
        return { ok: true, data };
      } catch (e) {
        return { ok: false, error: (e as Error).message };
      }

    default:
      return { ok: false, error: `${format} is not a structured format` };
  }
}
