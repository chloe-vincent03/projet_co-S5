<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const title = ref('');
const description = ref('');
const type = ref('image');
const url = ref('');
const content = ref('');
const tags = ref('');
const selectedFile = ref(null);

function handleFileUpload(event) {
  selectedFile.value = event.target.files[0];
}

async function submit() {
  const formData = new FormData();
  formData.append('title', title.value);
  formData.append('description', description.value);
  formData.append('type', type.value);
  // Si l'utilisateur a rentré une URL manuelle, on l'envoie aussi
  formData.append('url', url.value);
  formData.append('content', content.value);
  formData.append('tags', tags.value);

  if (selectedFile.value) {
    formData.append('file', selectedFile.value);
  }

  try {
    const res = await fetch('http://localhost:3000/api/media', {
      method: 'POST',
      credentials: 'include', // 🔥 Important pour envoyer le cookie de session
      // Ne PAS mettre 'Content-Type': 'application/json' avec FormData, 
      // le navigateur le gère tout seul (multipart/form-data)
      body: formData
    });

    if (res.ok) {
      const result = await res.json();
      console.log("Success:", result);
      alert("Œuvre ajoutée !");
      router.push('/');
    } else {
      const err = await res.json();
      console.error("Erreur serveur:", err);
      // Gère les différents formats d'erreur (error, message, ou success:false+message)
      alert("Erreur : " + (err.error || err.message || "Erreur inconnue"));
    }
  } catch (error) {
    console.error("Erreur réseau:", error);
    alert("Erreur de connexion au serveur");
  }
}
</script>

<template>
  <h1>Ajouter une œuvre</h1>

  <form @submit.prevent="submit">

    <label>Titre :</label>
    <input v-model="title" required>

    <label>Description :</label>
    <textarea v-model="description"></textarea>

    <label>Type :</label>
    <select v-model="type">
      <option value="image">Image</option>
      <option value="audio">Audio</option>
      <option value="video">Vidéo</option>
      <option value="text">Texte</option>
    </select>

    <!-- Choix : soit une URL externe, soit un fichier -->
    <div style="margin: 10px 0; border: 1px solid #ccc; padding: 10px;">
        <p><strong>Image / Média :</strong></p>
        
        <label>Téléverser un fichier :</label>
        <input type="file" @change="handleFileUpload">
    </div>

    <label>Contenu textuel (optionnel) :</label>
    <textarea v-model="content"></textarea>

    <label>Tags (séparés par virgules) :</label>
    <input v-model="tags" placeholder="art, nature, projet...">

    <button type="submit">Ajouter</button>
  </form>
</template>
