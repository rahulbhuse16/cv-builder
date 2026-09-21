import { useMemo, useState } from "react";

import HtmlEditor from "./components/HtmlEditor";
import CvPreview from "./components/CvPreview";
import ExportButtons from "./components/ExportButtons";

import { defaultCvHtml } from "./templates/AtsClassicTemplate";
import { htmlToCv } from "./utils/htmlToCv";

export default function App() {
  const [html, setHtml] =
    useState<string>(
      ""
    );

  const cv = useMemo(
    () => htmlToCv(html),
    [html]
  );

  return (
    <div className="app">
      <header
        className="
          flex
          h-16
          shrink-0
          items-center
          justify-between
          border-b
          border-slate-200
          bg-white
          px-6
        "
      >
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            ATS CV Builder
          </h1>

          <p className="text-xs text-slate-500">
            HTML → ATS CV → PDF / Word
          </p>
        </div>

        <ExportButtons html={html} cv={cv} />
      </header>

      <main
        className="
          grid
          min-h-0
          flex-1
          grid-cols-2
        "
      >
        <section className="min-h-0 border-r border-slate-200">
          <HtmlEditor
            value={html}
            onChange={setHtml}
          />
        </section>

        <section className="min-h-0">
          <CvPreview html={html} />
        </section>
      </main>
    </div>
  );
}