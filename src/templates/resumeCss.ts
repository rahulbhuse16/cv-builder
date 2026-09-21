/**
 * THE canonical resume stylesheet. One string, used by:
 *   1. the browser preview  (<style>{RESUME_CSS}</style>)
 *   2. the Playwright PDF document (buildResumeDocument)
 *
 * Values are copied verbatim from the user's template. The only mechanical
 * change is scoping: `body { ... }` is applied to `.resume`, and element
 * selectors are prefixed with `.resume` so app styles (Tailwind) can't
 * leak in and the resume can't leak out.
 */
export const RESUME_CSS = `
@page {
    size: A4;
    margin: 0.40in 0.55in;
}

.resume {
    font-family: Arial, Helvetica, sans-serif;
    color: #000;
    background: #fff;
    margin: 0 auto;
    padding: 0;
    font-size: 10pt;
    line-height: 1.22;
    max-width: 800px;
}

.resume header {
    text-align: center;
    margin-bottom: 6px;
}

.resume h1 {
    font-size: 20pt;
    margin: 0 0 2px 0;
    font-weight: 700;
}

.resume .headline {
    font-size: 10.4pt;
    font-weight: 700;
    margin-bottom: 3px;
}

.resume .contact {
    font-size: 8.8pt;
    line-height: 1.3;
}

.resume section {
    margin-top: 6px;
}

.resume h2 {
    font-size: 11pt;
    margin: 0 0 3px 0;
    padding-bottom: 2px;
    border-bottom: 1px solid #000;
    text-transform: uppercase;
    font-weight: 700;
}

.resume p {
    margin: 1.5px 0;
}

.resume .summary {
    text-align: justify;
}

.resume .job {
    margin-bottom: 5px;
}

.resume .job-header {
    display: flex;
    justify-content: space-between;
    font-weight: 700;
    margin-bottom: 1px;
}

.resume .job-subheader {
    display: flex;
    justify-content: space-between;
    font-style: italic;
    margin-bottom: 1px;
}

.resume ul {
    margin: 2px 0 0 16px;
    padding: 0;
    /* Tailwind preflight sets list-style:none; restore the browser default */
    list-style: disc;
}

.resume li {
    margin-bottom: 1.5px;
}

.resume .project {
    margin-bottom: 4px;
}

.resume .project-title {
    font-weight: 700;
    margin-bottom: 1px;
}

.resume .education {
    display: flex;
    justify-content: space-between;
}

/* @media print { ...paste the template's existing print rules here... } */
`;