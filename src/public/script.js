async function fetchMedia() {
  const res = await fetch('/api/media');
  const data = await res.json();
  const container = document.getElementById('gallery');

  container.innerHTML = data.map(item => `
    <div class="media">
      <h2>${item.title}</h2>
      <p>${item.description || ''}</p>
      ${item.image_url ? `<img src="${item.image_url}" alt="${item.title}">` : ''}
      <small>Ajouté le ${new Date(item.created_at).toLocaleDateString()}</small>
    </div>
  `).join('');
}

fetchMedia();
