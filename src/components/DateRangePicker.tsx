"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { clsx } from "clsx";
import { differenceInCalendarDays, parseISO } from "date-fns";

const PRESETS = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
];

export function DateRangePicker({ start, end, maxDate }: { start: string; end: string; maxDate: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeDays = end === maxDate ? differenceInCalendarDays(parseISO(end), parseISO(start)) + 1 : null;

  function updateRange(newStart: string, newEnd: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("start", newStart);
    params.set("end", newEnd);
    router.push(`${pathname}?${params.toString()}`);
  }

  function applyPreset(days: number) {
    const endDate = new Date(`${maxDate}T00:00:00Z`);
    const startDate = new Date(endDate);
    startDate.setUTCDate(startDate.getUTCDate() - (days - 1));
    updateRange(startDate.toISOString().slice(0, 10), maxDate);
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1 bg-surface-muted rounded-lg p-1">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => applyPreset(p.days)}
            className={clsx(
              "px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer",
              activeDays === p.days
                ? "bg-red-600 text-white"
                : "text-foreground/70 hover:bg-white hover:text-foreground"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      <input
        type="date"
        value={start}
        max={end}
        onChange={(e) => updateRange(e.target.value, end)}
        className="border border-border rounded-lg px-2 py-1.5 text-sm bg-surface"
      />
      <span className="text-foreground/40 text-sm">to</span>
      <input
        type="date"
        value={end}
        min={start}
        max={maxDate}
        onChange={(e) => updateRange(start, e.target.value)}
        className="border border-border rounded-lg px-2 py-1.5 text-sm bg-surface"
      />
    </div>
  );
}
