import express from "express";
import puppeteer from "puppeteer";

import { getWorksByIds } from "../services/book.service.js";
import { generateBookHTML } from "../templates/bookPdf.template.js";

const router = express.Router();

router.post("/pdf", async (req, res) => {
  try {
    const { title, worksIds, author } = req.body;

    const works = await getWorksByIds(worksIds);

    if (!works.length) {
      return res.status(404).json({ message: "Aucune œuvre trouvée" });
    }

    const html = generateBookHTML({ title, works, author });

    const browser = await puppeteer.launch({
      headless: "new",
      executablePath: puppeteer.executablePath(),
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${title}.pdf"`,
    });

    res.send(pdfBuffer);
  } catch (err) {
    console.error("❌ PDF ERROR:", err);
    res.status(500).json({ message: "Erreur génération PDF" });
  }
});



export default router;
