import DOMPurify from "dompurify";

const allowedTags = [
  "h1",
  "h2",
  "h3",
  "h4",
  "p",
  "div",
  "span",
  "strong",
  "b",
  "em",
  "i",
  "ul",
  "ol",
  "li",
  "a",
  "br",
];

const allowedAttributes = [
  "href",
  "target",
  "rel",
];

export function sanitizeCvHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttributes,

    // Do not allow arbitrary inline styles.
    FORBID_ATTR: [
      "style",
      "class",
      "id",
      "onclick",
      "onload",
    ],

    FORBID_TAGS: [
      "script",
      "style",
      "iframe",
      "object",
      "embed",
      "table",
      "thead",
      "tbody",
      "tr",
      "td",
      "th",
      "img",
      "svg",
    ],
  });
}