import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  buildPrintableHtml,
  getLayout,
  printFrame,
  type PdfSettings,
} from "./PdfTools";

export interface PreviewHandle {
  print: () => Promise<void>;
}

interface Props {
  html: string | null;
  settings: PdfSettings;
  filename: string;
  onLoaded?: () => void;
}

const PreviewPane = forwardRef<PreviewHandle, Props>(function PreviewPane(
  { html, settings, filename, onLoaded },
  ref
) {
  const layout = getLayout(settings);
  const pageW = Math.round(layout.pageWpx);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(700);
  const [avail, setAvail] = useState(800);

  // Same HTML that gets printed, so the preview matches the PDF.
  const srcDoc = useMemo(
    () => (html ? buildPrintableHtml(html, settings) : null),
    [html, settings]
  );

  useImperativeHandle(ref, () => ({
    print: async () => {
      if (!iframeRef.current) throw new Error("Add some HTML first.");
      await printFrame(iframeRef.current, filename);
    },
  }));

  // Fit the paper sheet to the available width (responsive).
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

  const scale = Math.min(1, (avail - 32) / pageW);
  const pages = Math.max(
    1,
    Math.ceil((height - layout.marginPx * 2) / layout.contentHpx)
  );

  return (
    <div ref={wrapRef} className="min-w-0">
      <div className="overflow-hidden rounded-2xl bg-slate-300/70 p-3 sm:p-4">
        {srcDoc ? (
          <>
            <p className="mb-3 text-sm text-slate-700">
              About {pages} {pages === 1 ? "page" : "pages"}. Dashed lines mark
              approximate page breaks.
            </p>
            <div
              className="mx-auto"
              style={{ width: pageW * scale, height: height * scale }}
            >
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
                  title="Document preview"
                  srcDoc={srcDoc}
                  // No allow-scripts: the file's JavaScript never runs.
                  sandbox="allow-same-origin allow-modals"
                  onLoad={() => {
                    measure();
                    setTimeout(measure, 400); // catch late-loading images
                    onLoaded?.();
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
          </>
        ) : (
          <div className="flex min-h-[320px] items-center justify-center text-center text-sm text-slate-600">
            Your preview appears here as soon as you add HTML.
          </div>
        )}
      </div>
    </div>
  );
});

export default PreviewPane;