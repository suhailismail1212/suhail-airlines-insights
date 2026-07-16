"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { clsx } from "clsx";

const OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All day" },
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
];

export function TimeOfDayFilter({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function select(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") params.delete("tod");
    else params.set("tod", next);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-1 bg-surface-muted rounded-lg p-1">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => select(opt.value)}
          className={clsx(
            "px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer",
            value === opt.value ? "bg-red-600 text-white" : "text-foreground/70 hover:bg-white hover:text-foreground"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
