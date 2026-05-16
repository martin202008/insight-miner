"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

interface ExportButtonsProps {
  report: {
    title: string;
    sections: { title: string; content: string; level: number }[];
  } | null;
  disabled?: boolean;
}

type ExportFormat = "pdf" | "docx" | "md" | "html";

const formatLabels: Record<ExportFormat, string> = {
  pdf: "PDF",
  docx: "Word",
  md: "Markdown",
  html: "HTML",
};

export function ExportButtons({ report, disabled }: ExportButtonsProps) {
  const [exporting, setExporting] = useState<ExportFormat | null>(null);

  const handleExport = async (format: ExportFormat) => {
    if (!report || disabled) return;

    setExporting(format);

    try {
      const response = await fetch("/api/report/export", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ report, format }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Export failed: ${response.status} - ${text}`);
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get("content-disposition");
      const filename = contentDisposition?.match(/filename="(.+)"/)?.[1] || `${report.title}.${format}`;

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      const message = error instanceof Error ? error.message : "导出失败，请重试";
      alert(`导出失败: ${message}`);
    } finally {
      setExporting(null);
    }
  };

  if (!report) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {(Object.keys(formatLabels) as ExportFormat[]).map((format) => (
        <button
          key={format}
          onClick={() => handleExport(format)}
          disabled={disabled || exporting !== null}
          className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-all disabled:opacity-50"
        >
          {exporting === format ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span className="text-sm">导出 {formatLabels[format]}</span>
        </button>
      ))}
    </div>
  );
}
