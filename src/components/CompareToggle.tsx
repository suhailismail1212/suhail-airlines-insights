"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { clsx } from "clsx";

export function CompareToggle({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function toggle() {
    const params = new URLSearchParams(searchParams.toString());
    if (enabled) params.delete("compare");
    else params.set("compare", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={clsx(
        "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer",
        enabled ? "bg-red-600 text-white border-red-600" : "bg-surface text-foreground/70 border-border hover:border-red-500"
      )}
    >
      Compare to previous period
    </button>
  );
}
