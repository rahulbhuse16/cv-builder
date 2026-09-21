import { useState } from "react";

import { exportPdf } from "../utils/exportPdf";

interface ExportButtonsProps {
  html: string;
}

export default function ExportButtons({
  html,
}: ExportButtonsProps) {
  const [exporting, setExporting] = useState(false);

  const handlePdfExport = async (): Promise<void> => {
    try {
      setExporting(true);

      await exportPdf(html);
    } catch (error) {
      console.error("PDF generation failed:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to generate PDF."
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handlePdfExport}
        disabled={exporting}
        className="
          rounded-lg
          bg-slate-900
          px-4
          py-2
          text-sm
          font-medium
          text-white
          transition
          hover:bg-slate-700
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        {exporting
          ? "Generating PDF..."
          : "Download PDF"}
      </button>
    </div>
  );
}