/**
 * Helpers for turning HTML into a real (vector, selectable-text) PDF using the
 * browser's own print engine. This keeps the layout identical to the HTML and
 * produces text that ATS parsers can read.
 */

export type Paper = "a4" | "letter";
export type Orientation = "portrait" | "landscape";

export interface PdfSettings {
  paper: Paper;
  orientation: Orientation;
  marginMm: number;
}

const PAPER_MM: Record<Paper, [number, number]> = {
  a4: [210, 297],
  letter: [215.9, 279.4],
};
const MM_TO_PX = 96 / 25.4;

export function getLayout(s: PdfSettings) {
  const [w, h] = PAPER_MM[s.paper];
  const pageWmm = s.orientation === "portrait" ? w : h;
  const pageHmm = s.orientation === "portrait" ? h : w;
  return {
    pageWpx: pageWmm * MM_TO_PX,
    pageHpx: pageHmm * MM_TO_PX,
    marginPx: s.marginMm * MM_TO_PX,
    contentWpx: Math.round((pageWmm - s.marginMm * 2) * MM_TO_PX),
    contentHpx: Math.floor((pageHmm - s.marginMm * 2) * MM_TO_PX),
  };
}

/**
 * Prepares the HTML for printing.
 *
 * The @page margin is set to 0, which stops the browser from printing its own
 * date / title / URL headers and footers. Your margin is then recreated inside
 * the document with a wrapper table: its header and footer rows repeat on every
 * page, so each page keeps the same top and bottom space.
 * Your own CSS is left untouched.
 */
export function buildPrintableHtml(html: string, s: PdfSettings): string {
  const doctype = html.match(/^\s*(<!doctype[^>]*>)/i)?.[1] ?? "";
  const parsed = new DOMParser().parseFromString(html, "text/html");
  const m = s.marginMm;

  let css =
    `@page{size:${s.paper} ${s.orientation};margin:0}` +
    `html,body{-webkit-print-color-adjust:exact;print-color-adjust:exact}`;

  if (m > 0) {
    css +=
      `table.pdfx-frame{width:100%!important;max-width:none!important;margin:0!important;` +
      `border:0!important;border-collapse:collapse!important;border-spacing:0!important;` +
      `table-layout:fixed!important;background:none!important}` +
      `table.pdfx-frame>thead>tr>td,table.pdfx-frame>tbody>tr>td,table.pdfx-frame>tfoot>tr>td{` +
      `border:0!important;background:none!important;vertical-align:top!important}` +
      `table.pdfx-frame>thead>tr>td,table.pdfx-frame>tfoot>tr>td{` +
      `height:${m}mm!important;padding:0!important;line-height:0!important;font-size:0!important}` +
      `table.pdfx-frame>tbody>tr>td{padding:0 ${m}mm!important}` +
      `table.pdfx-frame>tbody>tr,table.pdfx-frame>tbody>tr>td{` +
      `break-inside:auto!important;page-break-inside:auto!important}`;

    const table = parsed.createElement("table");
    table.className = "pdfx-frame";
    table.innerHTML =
      "<thead><tr><td></td></tr></thead>" +
      "<tbody><tr><td></td></tr></tbody>" +
      "<tfoot><tr><td></td></tr></tfoot>";
    const cell = table.querySelector("tbody td")!;
    while (parsed.body.firstChild) cell.appendChild(parsed.body.firstChild);
    parsed.body.appendChild(table);
  }

  const style = parsed.createElement("style");
  style.id = "pdfx-page-setup";
  style.textContent = css;
  parsed.head.appendChild(style);

  return `${doctype}${parsed.documentElement.outerHTML}`;
}

async function waitForAssets(doc: Document) {
  const images = Array.from(doc.images).map((img) =>
    img.complete
      ? Promise.resolve()
      : new Promise<void>((r) => {
          img.onload = () => r();
          img.onerror = () => r();
        })
  );
  await Promise.race([
    Promise.all([doc.fonts?.ready, ...images]),
    new Promise((r) => setTimeout(r, 3000)),
  ]);
}

/**
 * Prints the preview frame directly (no re-loading), so it is instant.
 * Choose "Save as PDF" in the print window.
 */
export async function printFrame(frame: HTMLIFrameElement, filename: string) {
  const win = frame.contentWindow;
  const doc = frame.contentDocument;
  if (!win || !doc) {
    throw new Error("The preview isn't ready yet. Try again in a moment.");
  }
  await waitForAssets(doc);

  // Browsers use the page title as the default PDF file name.
  const previousTitle = document.title;
  const restore = () => {
    document.title = previousTitle;
  };
  document.title = filename;
  doc.title = filename;
  win.addEventListener("afterprint", restore, { once: true });
  setTimeout(restore, 30_000); // safety net

  win.focus();
  win.print();
}