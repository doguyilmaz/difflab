const EXT_RE = /\.[a-z0-9]+$/i;
const SUFFIX_RE = /\s+\((old|new|edited)\)/;

export function addSuffix(name: string, suffix: string): string {
  const match = name.match(EXT_RE);
  if (match) {
    const idx = match.index!;
    return `${name.slice(0, idx)} (${suffix})${name.slice(idx)}`;
  }
  return `${name} (${suffix})`;
}

export function stripSuffix(name: string): string {
  return name.replace(SUFFIX_RE, "");
}

export function markEdited(name: string): string {
  if (!SUFFIX_RE.test(name)) return name;
  return addSuffix(stripSuffix(name), "edited");
}
