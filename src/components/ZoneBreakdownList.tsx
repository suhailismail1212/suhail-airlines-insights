import { GrowBar } from "./GrowBar";

export function ZoneBreakdownList({
  rows,
}: {
  rows: { name: string; widthPercent: number; valueLabel: string; color: string; sublabel?: string }[];
}) {
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.name} className="flex items-center gap-3">
          <span className="w-36 shrink-0 text-sm text-foreground/70 truncate">{r.name}</span>
          <div className="flex-1 h-2.5 rounded-full bg-surface-muted overflow-hidden">
            <GrowBar widthPercent={r.widthPercent} color={r.color} />
          </div>
          <span className="w-28 shrink-0 text-right text-xs board-numerals text-foreground/60 leading-tight">
            {r.valueLabel}
            {r.sublabel && <span className="block text-foreground/35 text-[10px] normal-case">{r.sublabel}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}
