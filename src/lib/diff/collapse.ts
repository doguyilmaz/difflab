export interface VisibleChunk<T> {
  type: "visible";
  items: T[];
}

export interface CollapsedChunk<T> {
  type: "collapsed";
  items: T[];
}

export type DiffChunk<T> = VisibleChunk<T> | CollapsedChunk<T>;

export function collapseUnchanged<T>(
  items: T[],
  isChanged: (item: T) => boolean,
  contextLines = 3,
): DiffChunk<T>[] {
  if (items.length === 0) return [];

  const show = new Uint8Array(items.length);

  for (let i = 0; i < items.length; i++) {
    if (isChanged(items[i])) {
      const from = Math.max(0, i - contextLines);
      const to = Math.min(items.length - 1, i + contextLines);
      for (let j = from; j <= to; j++) show[j] = 1;
    }
  }

  const chunks: DiffChunk<T>[] = [];
  let i = 0;

  while (i < items.length) {
    if (show[i]) {
      const visible: T[] = [];
      while (i < items.length && show[i]) {
        visible.push(items[i]);
        i++;
      }
      chunks.push({ type: "visible", items: visible });
    } else {
      const collapsed: T[] = [];
      while (i < items.length && !show[i]) {
        collapsed.push(items[i]);
        i++;
      }
      chunks.push({ type: "collapsed", items: collapsed });
    }
  }

  return chunks;
}
