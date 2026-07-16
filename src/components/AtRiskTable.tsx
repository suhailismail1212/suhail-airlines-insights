"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ChevronLeft, ChevronRight, Clock, ArrowUpDown } from "lucide-react";
import { clsx } from "clsx";
import { formatDisplayDate } from "@/lib/dateUtils";
import type { AtRiskVisitor } from "@/lib/queries";

function shortId(id: string): string {
  return `PSGR-${id.slice(0, 8).toUpperCase()}`;
}

type FlagFilter = "all" | "low_happiness" | "long_duration";
type SortKey = "visitCount" | "avgHappiness" | "minHappiness" | "maxDurationMinutes" | "lastVisitDate";

const PAGE_SIZE = 25;

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "visitCount", label: "Visits" },
  { key: "avgHappiness", label: "Avg mood" },
  { key: "minHappiness", label: "Lowest mood" },
  { key: "maxDurationMinutes", label: "Longest visit" },
  { key: "lastVisitDate", label: "Last seen" },
];

export function AtRiskTable({ rows }: { rows: AtRiskVisitor[] }) {
  const [filter, setFilter] = useState<FlagFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("avgHappiness");
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(0);

  const lowCount = rows.filter((r) => r.lowHappinessFlag).length;
  const longCount = rows.filter((r) => r.longDurationFlag).length;

  const filtered = useMemo(() => {
    if (filter === "low_happiness") return rows.filter((r) => r.lowHappinessFlag);
    if (filter === "long_duration") return rows.filter((r) => r.longDurationFlag);
    return rows;
  }, [rows, filter]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const diff = a[sortKey] > b[sortKey] ? 1 : a[sortKey] < b[sortKey] ? -1 : 0;
      return sortAsc ? diff : -diff;
    });
    return copy;
  }, [filtered, sortKey, sortAsc]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const clampedPage = Math.min(page, pageCount - 1);
  const pageRows = sorted.slice(clampedPage * PAGE_SIZE, clampedPage * PAGE_SIZE + PAGE_SIZE);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
    setPage(0);
  }

  function selectFilter(next: FlagFilter) {
    setFilter(next);
    setPage(0);
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        {(
          [
            { value: "all", label: `All (${rows.length})` },
            { value: "low_happiness", label: `Low happiness (${lowCount})` },
            { value: "long_duration", label: `Long duration (${longCount})` },
          ] as { value: FlagFilter; label: string }[]
        ).map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => selectFilter(opt.value)}
            className={clsx(
              "px-2.5 py-1 text-xs rounded-md transition-colors active:opacity-70 cursor-pointer border",
              filter === opt.value
                ? "bg-red-600 text-white border-red-600"
                : "bg-surface text-foreground/70 border-border hover:border-red-500"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-foreground/50 border-b border-border">
              <th className="py-2 pr-4 font-normal">Passenger ID</th>
              {COLUMNS.map((col) => (
                <th key={col.key} className="py-2 pr-4 font-normal">
                  <button
                    type="button"
                    onClick={() => toggleSort(col.key)}
                    className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
                  >
                    {col.label}
                    <ArrowUpDown
                      className={clsx("w-3 h-3", sortKey === col.key ? "text-red-600" : "text-foreground/30")}
                      strokeWidth={1.75}
                    />
                  </button>
                </th>
              ))}
              <th className="py-2 pr-4 font-normal">Flags</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((v) => (
              <tr key={v.visitorId} className="border-b border-border/60 last:border-0">
                <td className="py-2.5 pr-4 font-mono text-xs text-foreground/70">{shortId(v.visitorId)}</td>
                <td className="py-2.5 pr-4 board-numerals">{v.visitCount}</td>
                <td className="py-2.5 pr-4 board-numerals">{v.avgHappiness.toFixed(1)}</td>
                <td className="py-2.5 pr-4 board-numerals">{v.minHappiness.toFixed(1)}</td>
                <td className="py-2.5 pr-4 board-numerals">{v.maxDurationMinutes} min</td>
                <td className="py-2.5 pr-4 text-foreground/60">{formatDisplayDate(v.lastVisitDate)}</td>
                <td className="py-2.5 pr-4">
                  <div className="flex items-center gap-2">
                    {v.lowHappinessFlag && (
                      <span title="Low happiness" className="text-red-600">
                        <AlertTriangle className="w-4 h-4" strokeWidth={1.75} />
                      </span>
                    )}
                    {v.longDurationFlag && (
                      <span title="Long total visit duration" className="text-chart-gold">
                        <Clock className="w-4 h-4" strokeWidth={1.75} />
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-foreground/40">
                  No flagged passengers match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {sorted.length > PAGE_SIZE && (
        <div className="flex items-center justify-between mt-4 text-xs text-foreground/50">
          <span>
            Showing {clampedPage * PAGE_SIZE + 1}&ndash;{Math.min(sorted.length, (clampedPage + 1) * PAGE_SIZE)} of{" "}
            {sorted.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={clampedPage === 0}
              className="p-1.5 rounded-md border border-border hover:border-red-500 active:opacity-70 disabled:opacity-30 disabled:hover:border-border transition-colors cursor-pointer disabled:cursor-default"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.75} />
            </button>
            <span>
              Page {clampedPage + 1} of {pageCount}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={clampedPage >= pageCount - 1}
              className="p-1.5 rounded-md border border-border hover:border-red-500 active:opacity-70 disabled:opacity-30 disabled:hover:border-border transition-colors cursor-pointer disabled:cursor-default"
              aria-label="Next page"
            >
              <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
