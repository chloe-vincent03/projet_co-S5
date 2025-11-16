// ----------------------
// GALERIE
// ----------------------
async function loadGallery() {
  const container = document.getElementById('gallery');
  if (!container) return; // on n'est pas sur la page galerie

  try {
    const res = await fetch('/api/media');
    const data = await res.json();

container.innerHTML = data.map(item => `
  <a href="oeuvre.html?id=${item.id}">
    <img src="${item.image_url}" alt="${item.title}" width="200" height="250">
  </a>
`).join('');

  } catch (err) {
    container.innerHTML = "<p>Erreur de chargement de la galerie.</p>";
  }
}

// ----------------------
// DETAIL
// ----------------------
async function loadDetail() {
  const container = document.getElementById('detail');
  if (!container) return; // on n'est pas sur la page détail

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    container.innerHTML = "<p>ID manquant dans l'URL.</p>";
    return;
  }

  try {
    const res = await fetch(`/api/media/${id}`);

    if (res.status === 404) {
      container.innerHTML = "<p>Oeuvre non trouvée.</p>";
      return;
    }

    const item = await res.json();

    container.innerHTML = `
      <h1>${item.title}</h1>
      <img src="${item.image_url}" alt="${item.title}" width="400" height="500"> 
      <p>${item.description || ""}</p>
      <small>Ajouté le ${new Date(item.created_at).toLocaleDateString()}</small>
    `;
  } catch (err) {
    container.innerHTML = "<p>Erreur lors du chargement des détails.</p>";
  }
}

// ----------------------
// LANCEMENT AUTOMATIQUE
// ----------------------
loadGallery();
loadDetail();
