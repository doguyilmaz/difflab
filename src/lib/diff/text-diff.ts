import { diffLines, diffTrimmedLines } from "diff";
import type { DiffLine, DiffResult } from "@/types";

interface TextDiffOptions {
  ignoreWhitespace?: boolean;
  ignoreCase?: boolean;
}

export function buildTextDiff(left: string, right: string, options?: TextDiffOptions): DiffResult {
  let l = left;
  let r = right;

  if (options?.ignoreCase) {
    l = l.toLowerCase();
    r = r.toLowerCase();
  }

  const differ = options?.ignoreWhitespace ? diffTrimmedLines : diffLines;
  const changes = differ(l, r);

  // Use original content for display when ignoring case
  const leftLines = left.split("\n");
  const rightLines = right.split("\n");
  let leftIdx = 0;
  let rightIdx = 0;

  const lines: DiffLine[] = [];
  let added = 0;
  let removed = 0;

  for (const change of changes) {
    const count = change.value.replace(/\n$/, "").split("\n").length;
    if (change.added) {
      for (let i = 0; i < count; i++) {
        const originalLine = options?.ignoreCase ? (rightLines[rightIdx + i] ?? "") : change.value.replace(/\n$/, "").split("\n")[i];
        lines.push({ type: "added", text: `+ ${originalLine}` });
        added++;
      }
      rightIdx += count;
    } else if (change.removed) {
      for (let i = 0; i < count; i++) {
        const originalLine = options?.ignoreCase ? (leftLines[leftIdx + i] ?? "") : change.value.replace(/\n$/, "").split("\n")[i];
        lines.push({ type: "removed", text: `\u2212 ${originalLine}` });
        removed++;
      }
      leftIdx += count;
    } else {
      for (let i = 0; i < count; i++) {
        const originalLine = options?.ignoreCase ? (leftLines[leftIdx + i] ?? "") : change.value.replace(/\n$/, "").split("\n")[i];
        lines.push({ type: "context", text: `  ${originalLine}` });
      }
      leftIdx += count;
      rightIdx += count;
    }
  }

  return { lines, added, removed, changed: 0 };
}
