export function generateBookHTML({ title, works, author }) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />

<style>
@page {
  size: A4;
  margin: 2.5cm;
}

body {
  font-family: "Georgia", serif;
  color: #111;
  line-height: 1.6;
}

/* ---------------- COVER ---------------- */
.cover {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  text-align: center;
}

.cover h1 {
  font-size: 42px;
  letter-spacing: 1px;
}

.cover .author {
  margin-top: 20px;
  font-size: 18px;
  color: #555;
}

/* ---------------- SECTIONS ---------------- */
.page-break {
  page-break-after: always;
}

.section-title {
  font-size: 26px;
  margin-bottom: 20px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 6px;
}

/* ---------------- WORK ---------------- */
.work {
  page-break-after: always;
}

.work-title {
  font-size: 24px;
  margin-bottom: 16px;
}

.work-content {
  font-size: 15px;
  line-height: 0.5;
  letter-spacing: 0.02em;
  white-space: pre-line;
}


/* ---------------- FOOTER ---------------- */
.footer {
  position: fixed;
  bottom: 1.5cm;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 11px;
  color: #888;
}
</style>
</head>

<body>

<!-- COVER -->
<div class="cover">
  <h1>${title}</h1>
  <div class="author">Portfolio de ${author}</div>
</div>

<div class="page-break"></div>

<!-- INTRO -->
<div>
  <div class="section-title">À propos</div>
  <p>
    Ce portfolio présente une sélection d’œuvres réalisées par <strong>${author}</strong>.
    <br />
    Compilation générée automatiquement via la plateforme <em>Plume & Pixel</em>.
  </p>
</div>

<div class="page-break"></div>

<!-- WORKS -->
${works
  .map(
    (work, index) => `
  <div class="work">
    <div class="work-title">${index + 1}. ${work.title}</div>

    <div class="work-content">
      ${(work.content || "Œuvre visuelle ou multimédia.").replace(
        /\n/g,
        "<br>"
      )}
    </div>
  </div>
`
  )
  .join("")}

<!-- FOOTER -->
<div class="footer">
  © ${author} — Portfolio généré via Plume & Pixel
</div>

</body>
</html>
`;
}
