interface StatsBarProps {
  added: number;
  removed: number;
  changed: number;
}

export function StatsBar({ added, removed, changed }: StatsBarProps) {
  if (!added && !removed && !changed) return null;

  return (
    <div className="flex gap-3 text-[11px] font-medium">
      {added > 0 && <span className="text-added">+{added} added</span>}
      {removed > 0 && <span className="text-removed">&minus;{removed} removed</span>}
      {changed > 0 && <span className="text-changed">~{changed} changed</span>}
    </div>
  );
}
