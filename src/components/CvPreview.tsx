import { sanitizeCvHtml } from "../utils/sanitizeHtml";

interface CvPreviewProps {
  html: string;
}

export default function CvPreview({
  html,
}: CvPreviewProps) {
  const safeHtml = sanitizeCvHtml(html);

  return (
    <div className="cv-preview-container">

      <div
        id="cv-document"
        className="cv-page"
        dangerouslySetInnerHTML={{
          __html: safeHtml,
        }}
      />

    </div>
  );
}