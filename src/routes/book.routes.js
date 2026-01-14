import express from "express";
import puppeteer from "puppeteer";
import axios from "axios";

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

    // 🔄 Pré-traitement : Télécharger les images pour le PDF
    const worksWithImages = await Promise.all(
      works.map(async (work) => {
        console.log(`🔍 Traitement œuvre: ID=${work.id}, Type=${work.type}, URL=${work.url}`);

        // Normalisation du type (au cas où il y ait des majuscules ou espaces)
        const type = work.type ? work.type.toLowerCase().trim() : "";

        if (type === "image" && work.url) {
          try {
            console.log(`📥 Tentative téléchargement: ${work.url}`);
            const response = await axios.get(work.url, {
              responseType: "arraybuffer",
            });
            const base64 = Buffer.from(response.data, "binary").toString("base64");
            const mimeType = response.headers["content-type"] || "image/jpeg";

            console.log(`✅ Image téléchargée (Base64 length: ${base64.length})`);

            return {
              ...work,
              base64Image: `data:${mimeType};base64,${base64}`,
            };
          } catch (err) {
            console.error(`❌ ÉCHEC téléchargement image (${work.url}):`, err.message);
            // On continue sans faire planter le PDF
            return work;
          }
        } else {
          console.log("👉 Ignoré (pas une image ou pas d'URL)");
        }
        return work;
      })
    );

    const html = generateBookHTML({ title, works: worksWithImages, author });

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
