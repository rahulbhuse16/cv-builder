"use client";

import { useMemo } from "react";
import { RESUME_CSS } from "../templates/resumeCss";
import { buildResumeHtml } from "../templates/resumeHtml";
import { CvDocument } from "../types/cv";


/**
 * Renders the canonical resume HTML. No <PdfResume />, no re-creation of
 * h1/h2/job markup in React: the HTML string is the resume.
 *
 * The outer wrapper is application UI, not resume styling. It simulates the
 * A4 page box (210mm wide, @page margins as padding) so line wrapping in the
 * preview matches the PDF.
 */
export function ResumePreview({ cv }: { cv: CvDocument }) {
  const html = useMemo(() => buildResumeHtml(cv), [cv]);

  return (
    <div
      style={{
        width: "210mm",
        maxWidth: "100%",
        boxSizing: "border-box",
        padding: "0.40in 0.55in",
        margin: "0 auto",
        background: "#fff",
        boxShadow: "0 1px 6px rgba(0,0,0,.25)",
      }}
    >
      <style>{RESUME_CSS}</style>
      <div className="resume-preview" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

/** Direct download: server generates the PDF, no print dialog. */
export async function downloadResumePdf(cv: CvDocument) {
  const res = await fetch("/api/resume/pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cv),
  });
  if (!res.ok) throw new Error(`PDF export failed (${res.status})`);

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${cv.name.replace(/\s+/g, "_") || "resume"}_Resume.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}