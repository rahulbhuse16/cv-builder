import { useRef, useState } from "react";
import InputPanel from "./pages/InputPannel";
import { PdfSettings, Paper, Orientation } from "./pages/PdfTools";
import PreviewPane from "./pages/Previewpane";


const selectClass =
  "mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30";

export default function App() {
  const previewRef = useRef(null);
  const pendingAutoSave = useRef(false);

  const [doc, setDoc] = useState<{ name: string; html: string } | null>(null);
  const [settings, setSettings] = useState<PdfSettings>({
    paper: "a4",
    orientation: "portrait",
    marginMm: 10,
  });
  const [autoSave, setAutoSave] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filename = (doc?.name ?? "document").replace(/\.html?$/i, "");

  function update<K extends keyof PdfSettings>(key: K, value: PdfSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setError(null);
    setBusy(true);
    try {
      //@ts-ignore
      await previewRef.current?.print();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "The print window couldn't be opened. Check that your browser isn't blocking it."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <h1 className="font-serif text-xl font-semibold tracking-tight">
            HTML to PDF
          </h1>
          <button
            type="button"
            onClick={save}
            disabled={!doc || busy}
            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Opening…" : "Save as PDF"}
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <InputPanel
            fileName={doc?.name ?? null}
            onHtml={(name, html, fromFile) => {
              pendingAutoSave.current = fromFile && autoSave;
              setDoc({ name, html });
            }}
          />

          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="paper" className="text-sm font-medium">
                  Paper
                </label>
                <select
                  id="paper"
                  value={settings.paper}
                  onChange={(e) => update("paper", e.target.value as Paper)}
                  className={selectClass}
                >
                  <option value="a4">A4</option>
                  <option value="letter">US Letter</option>
                </select>
              </div>
              <div>
                <label htmlFor="orientation" className="text-sm font-medium">
                  Orientation
                </label>
                <select
                  id="orientation"
                  value={settings.orientation}
                  onChange={(e) =>
                    update("orientation", e.target.value as Orientation)
                  }
                  className={selectClass}
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>
            </div>

            <label htmlFor="margin" className="mt-4 block text-sm font-medium">
              Page margin: {settings.marginMm} mm
            </label>
            <input
              id="margin"
              type="range"
              min={0}
              max={30}
              step={1}
              value={settings.marginMm}
              onChange={(e) => update("marginMm", Number(e.target.value))}
              className="mt-2 block w-full accent-indigo-600"
            />
            <p className="mt-1 text-xs text-slate-500">
              Use 0 if your HTML already has its own padding.
            </p>

            <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 accent-indigo-600"
              />
              Open the save window right after I upload a file
            </label>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
            >
              {error}
            </p>
          )}

          <p className="text-xs text-slate-500">
            In the print window choose Save as PDF. Keep Margins on Default.
            Styles and images should be inside the HTML.
          </p>
        </aside>

        <PreviewPane
          ref={previewRef}
          html={doc?.html ?? null}
          settings={settings}
          filename={filename}
          onLoaded={() => {
            if (pendingAutoSave.current) {
              pendingAutoSave.current = false;
              save();
            }
          }}
        />
      </main>
    </div>
  );
}