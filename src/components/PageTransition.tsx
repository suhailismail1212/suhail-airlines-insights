"use client";

import { usePathname } from "next/navigation";

/** Keyed by pathname only (not search params), so switching sidebar pages
 * fades in, but changing a date range or filter within the same page — a
 * data update, not a navigation — doesn't retrigger it. */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-page-fade">
      {children}
    </div>
  );
}
