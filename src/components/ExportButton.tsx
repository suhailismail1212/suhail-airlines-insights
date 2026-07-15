"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface ReportData {
  rangeLabel: string;
  kpis: { label: string; value: string }[];
  zoneRows: { name: string; visits: number; percent: number }[];
}

type AutoTableDoc = jsPDF & { getLastAutoTable: () => { finalY: number } | null };

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportButton({ data }: { data: ReportData }) {
  const [open, setOpen] = useState(false);
  const fileBase = `suhail-airlines-insights-${data.rangeLabel}`.replace(/\s+/g, "_");

  function downloadCsv() {
    const lines = [
      `Suhail Airlines Insights,${data.rangeLabel}`,
      "",
      "KPI,Value",
      ...data.kpis.map((k) => `${k.label},${k.value}`),
      "",
      "Zone,Visits,Share",
      ...data.zoneRows.map((z) => `${z.name},${z.visits},${z.percent.toFixed(1)}%`),
    ];
    triggerDownload(new Blob([lines.join("\n")], { type: "text/csv" }), `${fileBase}.csv`);
    setOpen(false);
  }

  function downloadPdf() {
    const doc = new jsPDF() as AutoTableDoc;
    doc.setFontSize(14);
    doc.text("Suhail Airlines Insights", 14, 16);
    doc.setFontSize(10);
    doc.text(data.rangeLabel, 14, 23);

    autoTable(doc, {
      startY: 30,
      head: [["KPI", "Value"]],
      body: data.kpis.map((k) => [k.label, k.value]),
      styles: { fontSize: 9 },
    });

    const afterKpiY = doc.getLastAutoTable()?.finalY ?? 60;
    autoTable(doc, {
      startY: afterKpiY + 8,
      head: [["Zone", "Visits", "Share"]],
      body: data.zoneRows.map((z) => [z.name, String(z.visits), `${z.percent.toFixed(1)}%`]),
      styles: { fontSize: 9 },
    });

    doc.save(`${fileBase}.pdf`);
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-surface hover:border-navy-900 transition-colors cursor-pointer"
      >
        <Download className="w-3.5 h-3.5" strokeWidth={1.75} />
        Export
      </button>
      {open && (
        <div className="absolute right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg overflow-hidden z-10 w-32">
          <button type="button" onClick={downloadCsv} className="block w-full text-left px-3 py-2 text-xs hover:bg-surface-muted cursor-pointer">
            Export CSV
          </button>
          <button type="button" onClick={downloadPdf} className="block w-full text-left px-3 py-2 text-xs hover:bg-surface-muted cursor-pointer">
            Export PDF
          </button>
        </div>
      )}
    </div>
  );
}
