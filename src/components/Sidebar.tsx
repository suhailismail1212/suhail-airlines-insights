"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { PlaneTakeoff, Smile, Map, Route, AlertTriangle } from "lucide-react";

const NAV = [
  { href: "/overview", label: "Overview", icon: PlaneTakeoff },
  { href: "/visits-happiness", label: "Visits & happiness", icon: Smile },
  { href: "/zones", label: "Zone analytics", icon: Map },
  { href: "/journeys", label: "Journeys", icon: Route },
  { href: "/at-risk", label: "At-risk passengers", icon: AlertTriangle },
];

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qs = searchParams.toString();

  return (
    <nav className="w-60 shrink-0 bg-surface border-r border-border min-h-screen flex flex-col">
      <div className="px-5 py-6 flex items-center gap-2 border-b border-border">
        <PlaneTakeoff className="w-5 h-5 text-red-600" strokeWidth={1.75} />
        <span className="text-red-600 font-medium text-sm tracking-wide">Suhail Airlines</span>
      </div>
      <div className="flex-1 py-4 px-3 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={qs ? `${href}?${qs}` : href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-surface-muted text-red-600"
                  : "text-foreground/60 hover:bg-surface-muted hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" strokeWidth={1.75} />
              {label}
            </Link>
          );
        })}
      </div>
      <div className="px-5 py-4 border-t border-border text-foreground/35 text-[11px]">
        Mock data demo &middot; Pulses.ai internship project
      </div>
    </nav>
  );
}
