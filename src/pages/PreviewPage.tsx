import { useEffect, useMemo, useRef, useState } from "react";
//@ts-ignore
import type { HtmlDoc } from "../App";
import {
  buildPrintableHtml,
  getLayout,
  type Orientation,
  type Paper,
  type PdfSettings,
} from "./PdfTools";

interface Props {
  doc: HtmlDoc;
  settings: PdfSettings;
  onSettings: (s: PdfSettings) => void;
  onReplace: () => void;
  onNext: () => void;
}

const selectClass =
  "mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30";

export default function PreviewPage({
  doc,
  settings,
  onSettings,
  onReplace,
  onNext,
}: Props) {
  const layout = getLayout(settings);
  const pageW = Math.round(layout.pageWpx);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(700);
  const [avail, setAvail] = useState(800);

  // Same HTML that gets printed, so the preview matches the PDF.
  const srcDoc = useMemo(
    () => buildPrintableHtml(doc.html, settings),
    [doc.html, settings]
  );

  // Fit the paper sheet to the screen width (responsive).
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setAvail(el.clientWidth));
    ro.observe(el);
    setAvail(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  function measure() {
    const f = iframeRef.current;
    const d = f?.contentDocument;
    if (!f || !d) return;
    f.style.height = "0px"; // lets the content report its true height
    const h = Math.max(200, d.documentElement.scrollHeight);
    f.style.height = `${h}px`;
    setHeight(h);
  }

  const scale = Math.min(1, (avail - 48) / pageW);
  const pages = Math.max(
    1,
    Math.ceil((height - layout.marginPx * 2) / layout.contentHpx)
  );

  function update<K extends keyof PdfSettings>(key: K, value: PdfSettings[K]) {
    onSettings({ ...settings, [key]: value });
  }

  return (
    <section>
      <h2 className="font-serif text-3xl font-semibold tracking-tight">
        Preview
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        <span className="font-medium text-slate-900">{doc.name}</span>
        {" — about "}
        {pages} {pages === 1 ? "page" : "pages"} at this size. Dashed lines
        mark approximate page breaks.
      </p>

      <div className="mt-6 grid gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:grid-cols-3">
        <div>
          <label htmlFor="paper" className="text-sm font-medium">
            Paper size
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
            onChange={(e) => update("orientation", e.target.value as Orientation)}
            className={selectClass}
          >
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </select>
        </div>
        <div>
          <label htmlFor="margin" className="text-sm font-medium">
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
            className="mt-3 block w-full accent-indigo-600"
          />
        </div>
        <p className="text-xs text-slate-500 sm:col-span-3">
          If your HTML already has its own padding around the page, set the
          margin to 0 so the PDF matches it exactly.
        </p>
      </div>

      <div ref={wrapRef} className="mt-6 w-full">
        <div className="overflow-hidden rounded-2xl bg-slate-300/70 p-3 sm:p-6">
          <div className="mx-auto" style={{ width: pageW * scale, height: height * scale }}>
            <div
              className="relative bg-white shadow-xl"
              style={{
                width: pageW,
                height,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
              <iframe
                ref={iframeRef}
                title={`Preview of ${doc.name}`}
                srcDoc={srcDoc}
                sandbox="allow-same-origin"
                onLoad={() => {
                  measure();
                  setTimeout(measure, 400); // catch late-loading images
                }}
                className="block max-w-none border-0"
                style={{ width: pageW, height }}
              />

              {Array.from({ length: pages - 1 }, (_, i) => (
                <div
                  key={i}
                  aria-hidden
                  className="pointer-events-none absolute left-0 right-0 border-t border-dashed border-indigo-400"
                  style={{ top: layout.marginPx + (i + 1) * layout.contentHpx }}
                >
                  <span className="absolute right-2 top-1 rounded bg-indigo-50 px-1.5 py-0.5 text-[11px] font-medium text-indigo-700">
                    Page {i + 2}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-between gap-3">
        <button
          type="button"
          onClick={onReplace}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          Change HTML
        </button>
        <button
          type="button"
          onClick={onNext}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          Continue to export
        </button>
      </div>
    </section>
  );
}