// ----------------------
// GALERIE
// ----------------------
let galleryData = []; // stocke toutes les données récupérées

async function loadGallery(filter = 'all') {
  const container = document.getElementById('gallery');
  if (!container) return;

  try {
    if (galleryData.length === 0) {
      const res = await fetch('/api/media');
      galleryData = await res.json();
    }

    let filteredData = galleryData;
    if (filter !== 'all') {
      filteredData = galleryData.filter(item => item.type === filter);
    }

    container.innerHTML = filteredData.map(item => {
      if (item.type === 'image') {
        return `
          <a class="media-card" href="oeuvre.html?id=${item.id}">
            <img src="${item.url}" alt="${item.title}">
          </a>`;
      }
      if (item.type === 'audio') {
        return `
          <a class="media-card" href="oeuvre.html?id=${item.id}">
            <div class="audio-preview">🎵</div>
            <p>${item.title}</p>
          </a>`;
      }
      if (item.type === 'video') {
        return `
          <a class="media-card" href="oeuvre.html?id=${item.id}">
            <div class="video-preview">🎬</div>
            <p>${item.title}</p>
          </a>`;
      }
      if (item.type === 'text') {
        const preview = item.content.slice(0, 80) + "...";
        return `
          <a class="media-card" href="oeuvre.html?id=${item.id}">
            <div class="text-preview">${preview}</div>
          </a>`;
      }
      return "";
    }).join('');

  } catch (err) {
    container.innerHTML = "<p>Erreur de chargement de la galerie.</p>";
    console.error(err);
  }
}


// ----------------------
// DETAIL
// ----------------------
async function loadDetail() {
  const container = document.getElementById('detail');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    container.innerHTML = "<p>ID manquant dans l'URL.</p>";
    return;
  }

  try {
    const res = await fetch(`/api/media/${id}`);
    
    if (!res.ok) {
      container.innerHTML = `<p>Oeuvre non trouvée (status ${res.status}).</p>`;
      return;
    }

    const item = await res.json();
    console.log("Données reçues de l'API :", item);

    const title = item.title || "Titre inconnu";
    const description = item.description || "";
    const createdAt = item.created_at ? new Date(item.created_at).toLocaleDateString() : "Date inconnue";

    // Préparation du média
    let mediaHTML = "";
    if (item.type === 'image' && item.url) {
      mediaHTML = `<img src="${item.url}" alt="${title}" width="400">`;
    } else if (item.type === 'audio' && item.url) {
      mediaHTML = `
        <audio controls>
          <source src="${item.url}" type="audio/mpeg">
          Votre navigateur ne supporte pas l'audio.
        </audio>`;
    } else if (item.type === 'video' && item.url) { // gestion vidéo
      mediaHTML = `
        <video width="400" controls>
          <source src="${item.url}" type="video/mp4">
          Votre navigateur ne supporte pas la vidéo.
        </video>`;
    } else if (item.type === 'text' && item.content) {
      mediaHTML = `
        <div class="text-full">
          <pre>${item.content}</pre>
        </div>`;
    } else {
      mediaHTML = "<p>Type de média inconnu ou données manquantes.</p>";
    }

    // Préparation des tags
    let tagsHTML = "";
    if (item.tags && item.tags.length > 0) {
      tagsHTML = `<p>Tags : ${item.tags.join(', ')}</p>`; 
    }

    // Injection dans le DOM
    container.innerHTML = `
      <h1>${title}</h1>
      ${mediaHTML}
      <p>${description}</p>
      ${tagsHTML}
      <small>Ajouté le ${createdAt}</small>
    `;

  } catch (err) {
    console.error("Erreur lors du fetch :", err);
    container.innerHTML = "<p>Erreur lors du chargement des détails.</p>";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById('gallery')) {
    loadGallery();

    const filterSelect = document.getElementById('filter-type');
    filterSelect.addEventListener('change', (e) => {
      loadGallery(e.target.value); // recharge la galerie avec le filtre
    });
  }

  if (document.getElementById('detail')) {
    loadDetail();
  }
});

