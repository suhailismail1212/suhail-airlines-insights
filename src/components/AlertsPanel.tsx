import { AlertTriangle } from "lucide-react";
import type { Alert } from "@/lib/queries";

export function AlertsPanel({ alerts }: { alerts: Alert[] }) {
  if (alerts.length === 0) {
    return <p className="text-sm text-foreground/50">No anomalies vs the trailing 14-day baseline for this range.</p>;
  }

  return (
    <ul className="space-y-2">
      {alerts.map((a) => (
        <li
          key={`${a.zoneId}-${a.metric}`}
          className="flex items-start gap-2.5 p-3 rounded-lg bg-red-600/5 border border-red-600/20"
        >
          <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" strokeWidth={1.75} />
          <div className="text-sm">
            <p className="text-foreground">
              <span className="font-medium">{a.zoneName}</span>{" "}
              {a.metric === "happiness" ? "happiness" : "traffic"} {a.direction === "drop" ? "dropped" : "spiked"}{" "}
              <span className="font-medium">{Math.abs(a.deviationPct).toFixed(0)}%</span> vs baseline
            </p>
            <p className="text-xs text-foreground/50 mt-0.5">
              {a.metric === "happiness"
                ? `${a.latestValue.toFixed(1)} vs ${a.baselineValue.toFixed(1)} avg`
                : `${Math.round(a.latestValue)} vs ${a.baselineValue.toFixed(0)}/day avg`}{" "}
              &middot; {a.date}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
