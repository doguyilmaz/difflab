import { diffLines, diffTrimmedLines } from "diff";
import type { DiffLine, DiffResult } from "@/types";

interface TextDiffOptions {
  ignoreWhitespace?: boolean;
}

export function buildTextDiff(left: string, right: string, options?: TextDiffOptions): DiffResult {
  const differ = options?.ignoreWhitespace ? diffTrimmedLines : diffLines;
  const changes = differ(left, right);
  const lines: DiffLine[] = [];
  let added = 0;
  let removed = 0;

  for (const change of changes) {
    const changeLines = change.value.replace(/\n$/, "").split("\n");
    for (const line of changeLines) {
      if (change.added) {
        lines.push({ type: "added", text: `+ ${line}` });
        added++;
      } else if (change.removed) {
        lines.push({ type: "removed", text: `\u2212 ${line}` });
        removed++;
      } else {
        lines.push({ type: "context", text: `  ${line}` });
      }
    }
  }

  return { lines, added, removed, changed: 0 };
}
