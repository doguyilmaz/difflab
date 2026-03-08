import type { DiffLine, SideBySideRow } from "@/types";

export function toSideBySide(lines: DiffLine[]): SideBySideRow[] {
  const rows: SideBySideRow[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.type === "context") {
      rows.push({ left: line, right: line });
      i++;
    } else if (line.type === "changed") {
      // Changed: show old on left, new on right
      const text = line.text;
      // Format: "~ key: oldVal → newVal"
      const arrowIdx = text.indexOf(" \u2192 ");
      if (arrowIdx !== -1) {
        const prefix = text.slice(2, arrowIdx); // "key: oldVal"
        const newVal = text.slice(arrowIdx + 3); // "newVal"
        rows.push({
          left: { type: "removed", text: `\u2212 ${prefix}` },
          right: { type: "added", text: `+ ${newVal}` },
        });
      } else {
        rows.push({ left: line, right: line });
      }
      i++;
    } else if (line.type === "removed") {
      // Collect consecutive removed lines
      const removedBlock: DiffLine[] = [];
      while (i < lines.length && lines[i].type === "removed") {
        removedBlock.push(lines[i]);
        i++;
      }
      // Collect consecutive added lines that follow
      const addedBlock: DiffLine[] = [];
      while (i < lines.length && lines[i].type === "added") {
        addedBlock.push(lines[i]);
        i++;
      }
      // Pair them up
      const maxLen = Math.max(removedBlock.length, addedBlock.length);
      for (let j = 0; j < maxLen; j++) {
        rows.push({
          left: removedBlock[j] ?? null,
          right: addedBlock[j] ?? null,
        });
      }
    } else if (line.type === "added") {
      // Added without preceding removed
      rows.push({ left: null, right: line });
      i++;
    } else {
      i++;
    }
  }

  return rows;
}
