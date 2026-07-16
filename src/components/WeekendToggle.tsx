"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { clsx } from "clsx";

export function WeekendToggle({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function toggle() {
    const params = new URLSearchParams(searchParams.toString());
    if (enabled) params.set("weekends", "0");
    else params.delete("weekends");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <button type="button" onClick={toggle} className="flex items-center gap-2 text-xs text-foreground/70 cursor-pointer">
      Show weekends
      <span
        className={clsx(
          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
          enabled ? "bg-red-600" : "bg-surface-muted border border-border"
        )}
      >
        <span
          className={clsx(
            "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
            enabled ? "translate-x-[18px]" : "translate-x-1"
          )}
        />
      </span>
    </button>
  );
}
