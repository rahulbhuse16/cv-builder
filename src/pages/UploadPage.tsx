import { useState, type ChangeEvent, type DragEvent } from "react";
import type { HtmlDoc } from "../App";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

type Tab = "file" | "code";

interface Props {
  onLoaded: (doc: HtmlDoc) => void;
}

export default function UploadPage({ onLoaded }: Props) {
  const [tab, setTab] = useState<Tab>("file");
  const [code, setCode] = useState("");
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);

    const isHtml = /\.html?$/i.test(file.name) || file.type === "text/html";
    if (!isHtml) {
      setError("That file isn't HTML. Choose a .html or .htm file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("That file is over 5 MB. Choose a smaller HTML file.");
      return;
    }

    setBusy(true);
    try {
      const html = await file.text();
      if (!html.trim()) {
        setError("That file is empty. Choose a file with HTML content.");
        return;
      }
      onLoaded({ name: file.name, size: file.size, html });
    } catch {
      setError("The file couldn't be read. Try selecting it again.");
    } finally {
      setBusy(false);
    }
  }

  function handleCode() {
    setError(null);
    if (!/<[a-z!][\s\S]*>/i.test(code)) {
      setError("That doesn't look like HTML. Paste the full page code, including tags.");
      return;
    }
    const size = new Blob([code]).size;
    if (size > MAX_BYTES) {
      setError("That code is over 5 MB. Paste a smaller document.");
      return;
    }
    onLoaded({ name: "document.html", size, html: code });
  }

  function onDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    handleFile(e.target.files?.[0]);
    e.target.value = ""; // allow re-selecting the same file
  }

  return (
    <section className="mx-auto max-w-2xl">
      <h2 className="font-serif text-3xl font-semibold tracking-tight">
        Turn HTML into a PDF
      </h2>
      <p className="mt-2 max-w-prose text-slate-600">
        Add your HTML, check the layout, then save it as a text-based PDF that
        matches the page and works with applicant tracking systems.
      </p>

      <div
        role="tablist"
        aria-label="Input method"
        className="mt-8 inline-flex rounded-lg bg-slate-200 p-1 text-sm"
      >
        {(
          [
            ["file", "Upload file"],
            ["code", "Paste code"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => {
              setTab(value);
              setError(null);
            }}
            className={[
              "rounded-md px-4 py-1.5 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
              tab === value
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "file" ? (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={[
            "mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-16 text-center transition-colors",
            "focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2",
            dragging
              ? "border-indigo-500 bg-indigo-50"
              : "border-slate-300 bg-white hover:border-slate-400",
          ].join(" ")}
        >
          <input
            type="file"
            accept=".html,.htm,text/html"
            onChange={onChange}
            className="sr-only"
          />
          <svg
            className="h-10 w-10 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 16V4m0 0L8 8m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
            />
          </svg>
          <span className="mt-4 text-lg font-medium">
            {busy ? "Reading file…" : "Drop your HTML file here"}
          </span>
          <span className="mt-1 text-sm text-slate-500">
            or{" "}
            <span className="font-medium text-indigo-600 underline">
              browse your computer
            </span>
          </span>
          <span className="mt-4 text-xs text-slate-500">
            .html or .htm, up to 5 MB
          </span>
        </label>
      ) : (
        <div className="mt-4">
          <label htmlFor="html-code" className="sr-only">
            HTML code
          </label>
          <textarea
            id="html-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            rows={14}
            placeholder="<!DOCTYPE html>&#10;<html>&#10;  ...&#10;</html>"
            className="block w-full rounded-2xl border border-slate-300 bg-white p-4 font-mono text-xs leading-relaxed shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={handleCode}
              disabled={!code.trim()}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Preview HTML
            </button>
          </div>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </p>
      )}

      <p className="mt-6 text-sm text-slate-500">
        Styles and images should be inside the HTML (inline CSS, base64 images)
        or use full https:// links. Scripts are not run.
      </p>
    </section>
  );
}