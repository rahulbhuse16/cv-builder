import { useState } from "react";
import type { HtmlDoc } from "../App";
import { printAsPdf, type PdfSettings } from "./PdfTools";

type Status =
  | { kind: "idle" }
  | { kind: "opening" }
  | { kind: "opened" }
  | { kind: "error"; message: string };

interface Props {
  doc: HtmlDoc;
  settings: PdfSettings;
  onBack: () => void;
}

const STEPS = [
  "Select Save as PDF as the destination.",
  "Leave Margins on Default and Scale at 100%.",
  "Turn on Background graphics if it isn't already on.",
  "Click Save.",
];

export default function ExportPage({ doc, settings, onBack }: Props) {
  const [filename, setFilename] = useState(doc.name.replace(/\.html?$/i, ""));
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const safeName =
    filename.trim().replace(/[\\/:*?"<>|]+/g, "-").replace(/\.pdf$/i, "") ||
    "document";

  async function handleExport() {
    setStatus({ kind: "opening" });
    try {
      await printAsPdf(doc.html, settings, safeName);
      setStatus({ kind: "opened" });
    } catch (err) {
      setStatus({
        kind: "error",
        message:
          err instanceof Error
            ? err.message
            : "The print window couldn't be opened. Check that your browser isn't blocking it.",
      });
    }
  }

  return (
    <section className="mx-auto max-w-2xl">
      <h2 className="font-serif text-3xl font-semibold tracking-tight">
        Export PDF
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        {settings.paper === "a4" ? "A4" : "US Letter"}, {settings.orientation},{" "}
        {settings.marginMm} mm margin. The PDF keeps real text, so it can be
        selected, searched and read by applicant tracking systems.
      </p>

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <label htmlFor="filename" className="text-sm font-medium">
          File name
        </label>
        <div className="mt-1.5 flex">
          <input
            id="filename"
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            className="block w-full rounded-l-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
          <span className="inline-flex items-center rounded-r-lg border border-l-0 border-slate-300 bg-slate-50 px-3 text-sm text-slate-500">
            .pdf
          </span>
        </div>

        <h3 className="mt-6 text-sm font-semibold">
          In the print window that opens
        </h3>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-slate-700">
          {STEPS.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-slate-500">
          The date, title and page address that browsers add to printouts are
          removed automatically. If you still see them, turn off Headers and
          footers in the print window.
        </p>
      </div>

      {status.kind === "opened" && (
        <p
          role="status"
          className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          The print window opened. Save it as a PDF there. To export again,
          click Save as PDF.
        </p>
      )}

      {status.kind === "error" && (
        <p
          role="alert"
          className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {status.message}
        </p>
      )}

      <div className="mt-6 flex flex-wrap justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          Back to preview
        </button>
        <button
          type="button"
          onClick={handleExport}
          disabled={status.kind === "opening"}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
        >
          {status.kind === "opening" ? "Opening…" : "Save as PDF"}
        </button>
      </div>
    </section>
  );
}