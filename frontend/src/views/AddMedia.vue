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

async function submit() {
  const data = {
    title: title.value,
    description: description.value,
    type: type.value,
    url: url.value,
    content: content.value,
    tags: tags.value.split(',').map(t => t.trim()).filter(t => t.length > 0)
  };

const res = await fetch('http://localhost:3000/api/media', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});


  if (res.ok) {
    alert("Œuvre ajoutée !");
    router.push('/');
  } else {
    alert("Erreur lors de l'ajout");
  }
}
</script>

<template>
  <h1>Ajouter une œuvre</h1>

  <form @submit.prevent="submit">

    <label>Titre :</label>
    <input v-model="title">

    <label>Description :</label>
    <textarea v-model="description"></textarea>

    <label>Type :</label>
    <select v-model="type">
      <option value="image">Image</option>
      <option value="audio">Audio</option>
      <option value="video">Vidéo</option>
      <option value="text">Texte</option>
    </select>

    <label>URL :</label>
    <input v-model="url">

    <label>Contenu textuel :</label>
    <textarea v-model="content"></textarea>

    <label>Tags (séparés par virgules) :</label>
    <input v-model="tags">

    <button type="submit">Ajouter</button>
  </form>
</template>
