"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BarChart3, Smile } from "lucide-react";
import { clsx } from "clsx";

const LENSES = [
  { value: "visits", label: "Visits", icon: BarChart3 },
  { value: "happiness", label: "Happiness", icon: Smile },
] as const;

export type Lens = (typeof LENSES)[number]["value"];

export function LensToggle({ lens }: { lens: Lens }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setLens(value: Lens) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("lens", value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] uppercase tracking-wide text-foreground/40">Lens</span>
      <div className="inline-flex bg-surface-muted rounded-lg p-1 gap-1">
        {LENSES.map(({ value, label, icon: Icon }) => {
          const active = lens === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setLens(value)}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors active:opacity-70 cursor-pointer",
                active ? "bg-foreground text-background" : "text-foreground/60 hover:text-foreground"
              )}
            >
              <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
