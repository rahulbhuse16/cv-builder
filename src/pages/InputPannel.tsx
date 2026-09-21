import { useEffect, useState, type ChangeEvent, type DragEvent } from "react";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
type Tab = "file" | "code";

interface Props {
  fileName: string | null;
  onHtml: (name: string, html: string, fromFile: boolean) => void;
}

export default function InputPanel({ fileName, onHtml }: Props) {
  const [tab, setTab] = useState<Tab>('code');
  const [code, setCode] = useState("");
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (!/\.html?$/i.test(file.name) && file.type !== "text/html") {
      setError("That file isn't HTML. Choose a .html or .htm file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("That file is over 5 MB. Choose a smaller HTML file.");
      return;
    }
    try {
      const html = await file.text();
      if (!html.trim()) {
        setError("That file is empty. Choose a file with HTML content.");
        return;
      }
      onHtml(file.name, html, true);
    } catch {
      setError("The file couldn't be read. Try selecting it again.");
    }
  }

  // Pasted code updates the preview automatically as you type.
  useEffect(() => {
    if (tab !== "code" || !code.trim()) return;
    const t = setTimeout(() => {
      if (!/<[a-z!][\s\S]*>/i.test(code)) {
        setError("That doesn't look like HTML. Paste the page code, including tags.");
        return;
      }
      if (new Blob([code]).size > MAX_BYTES) {
        setError("That code is over 5 MB. Paste a smaller document.");
        return;
      }
      setError(null);
      onHtml("document.html", code, false);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, tab]);

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
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div
        role="tablist"
        aria-label="Input method"
        className="inline-flex rounded-lg bg-slate-100 p-1 text-sm"
      >
        {(
          [
            ["code", "Paste code"],
            ["file", "Upload file"],
            
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
              "rounded-md px-3 py-1.5 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
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
            "mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors",
            "focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2",
            dragging
              ? "border-indigo-500 bg-indigo-50"
              : "border-slate-300 hover:border-slate-400",
          ].join(" ")}
        >
          <input
            type="file"
            accept=".html,.htm,text/html"
            onChange={onChange}
            className="sr-only"
          />
          <span className="text-sm font-medium">
            {fileName ? fileName : "Drop an HTML file here"}
          </span>
          <span className="mt-1 text-xs text-slate-500">
            {fileName ? "Drop or click to replace it" : "or click to browse (up to 5 MB)"}
          </span>
        </label>
      ) : (
        <div className="mt-3">
          <label htmlFor="html-code" className="sr-only">
            HTML code
          </label>
          <textarea
            id="html-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            rows={12}
            placeholder="Paste your HTML here. The preview updates as you type."
            className="block w-full rounded-xl border border-slate-300 bg-white p-3 font-mono text-xs leading-relaxed focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {error}
        </p>
      )}
    </div>
  );
}