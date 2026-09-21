/**
 * The HTML editor is the single source of truth.
 *
 * The complete HTML document entered by the user is used directly
 * for both browser preview and PDF generation.
 */
export function buildResumeDocument(html: string): string {
  if (typeof html !== "string" || !html.trim()) {
    throw new Error("Resume HTML cannot be empty.");
  }

  return html;
}