import type { DiffLine, DiffResult, MissingKeysResult } from "@/types";

function isObj(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object";
}

function fmtVal(v: unknown): string {
  if (typeof v === "string") return `"${v}"`;
  if (v === null) return "null";
  if (isObj(v)) return JSON.stringify(v);
  return String(v);
}

export function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + "\u2026" : s;
}

export function findMissing(
  source: Record<string, unknown>,
  target: Record<string, unknown>,
  compareValues: boolean,
  srcLabel: string,
  tgtLabel: string,
): MissingKeysResult {
  const result: MissingKeysResult = {};

  (function walk(
    src: Record<string, unknown>,
    tgt: Record<string, unknown>,
    out: MissingKeysResult,
  ) {
    for (const k in tgt) {
      if (!(k in src)) {
        out[k] = tgt[k];
      } else if (isObj(tgt[k]) && isObj(src[k])) {
        const nested: MissingKeysResult = {};
        walk(
          src[k] as Record<string, unknown>,
          tgt[k] as Record<string, unknown>,
          nested,
        );
        if (Object.keys(nested).length) out[k] = nested;
      } else if (compareValues && tgt[k] !== src[k]) {
        out[k] = { [srcLabel]: src[k], [tgtLabel]: tgt[k] };
      }
    }
  })(source, target, result);

  return result;
}

export function buildDiff(
  obj1: Record<string, unknown>,
  obj2: Record<string, unknown>,
  compareValues: boolean,
): DiffResult {
  const lines: DiffLine[] = [];
  let added = 0;
  let removed = 0;
  let changed = 0;

  (function walk(
    src: Record<string, unknown>,
    tgt: Record<string, unknown>,
    path: string,
  ) {
    for (const k in tgt) {
      const p = path ? `${path}.${k}` : k;
      if (!(k in src)) {
        lines.push({ type: "added", text: `+ ${p}: ${fmtVal(tgt[k])}` });
        added++;
      } else if (isObj(tgt[k]) && isObj(src[k])) {
        walk(
          src[k] as Record<string, unknown>,
          tgt[k] as Record<string, unknown>,
          p,
        );
      } else if (compareValues && tgt[k] !== src[k]) {
        lines.push({
          type: "changed",
          text: `~ ${p}: ${fmtVal(src[k])} \u2192 ${fmtVal(tgt[k])}`,
        });
        changed++;
      }
    }
    for (const k in src) {
      const p = path ? `${path}.${k}` : k;
      if (!(k in tgt)) {
        lines.push({ type: "removed", text: `\u2212 ${p}: ${fmtVal(src[k])}` });
        removed++;
      }
    }
  })(obj1, obj2, "");

  return { lines, added, removed, changed };
}

export function tryParse(str: string): { ok: true; data: Record<string, unknown> } | { ok: false; error: string } {
  try {
    return { ok: true, data: JSON.parse(str) };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
