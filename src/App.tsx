import { useState } from "react";

import UploadPage from "./pages/UploadPage";
import PreviewPage from "./pages/PreviewPage";
import ExportPage from "./pages/ExportPage";
import { PdfSettings } from "./pages/PdfTools";
import Stepper from "./pages/Stepper";

export type Page = "upload" | "preview" | "export";

export interface HtmlDoc {
  name: string;
  size: number;
  html: string;
}

export default function App() {
  const [page, setPage] = useState<Page>("upload");
  const [doc, setDoc] = useState<HtmlDoc | null>(null);
  const [settings, setSettings] = useState<PdfSettings>({
    paper: "a4",
    orientation: "portrait",
    marginMm: 10,
  });

  // Without content, the only valid page is Upload.
  const current: Page = doc ? page : "upload";

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <h1 className="font-serif text-xl font-semibold tracking-tight">
            HTML to PDF
          </h1>
          <Stepper current={current} hasDoc={!!doc} onNavigate={setPage} />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {current === "upload" && (
          <UploadPage
            onLoaded={(d) => {
              setDoc(d);
              setPage("preview");
            }}
          />
        )}
        {current === "preview" && doc && (
          <PreviewPage
            doc={doc}
            settings={settings}
            onSettings={setSettings}
            onReplace={() => setPage("upload")}
            onNext={() => setPage("export")}
          />
        )}
        {current === "export" && doc && (
          <ExportPage
            doc={doc}
            settings={settings}
            onBack={() => setPage("preview")}
          />
        )}
      </main>
    </div>
  );
}