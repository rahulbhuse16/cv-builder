import express from "express";
import cors from "cors";
import { chromium } from "playwright";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.post("/api/resume/pdf", async (req, res) => {
  const { html } = req.body;

  if (typeof html !== "string" || !html.trim()) {
    return res.status(400).send("Invalid HTML");
  }

  let browser;

  try {
    browser = await chromium.launch();

    const page = await browser.newPage({
      viewport: {
        width: 794,
        height: 1123,
      },
      deviceScaleFactor: 1,
    });

    // Render the EXACT HTML supplied by the editor.
    await page.setContent(html, {
      waitUntil: "networkidle",
    });

    // Wait for fonts.
    await page.evaluate(async () => {
      if (document.fonts) {
        await document.fonts.ready;
      }
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="resume.pdf"'
    );
    res.setHeader("Cache-Control", "no-store");

    res.send(pdf);
  } catch (error) {
    console.error("PDF generation failed:", error);

    res.status(500).send(
      error instanceof Error
        ? error.message
        : "PDF generation failed"
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

app.listen(3001, () => {
  console.log("PDF server running at http://localhost:3001");
});