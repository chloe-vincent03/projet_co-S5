<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const item = ref(null);

onMounted(async () => {
  const res = await fetch(`http://localhost:3000/api/media/${route.params.id}`);
  item.value = await res.json();
});
</script>

<template>
  <router-link to="/">← Retour à la galerie</router-link>

  <div v-if="!item">Chargement...</div>

  <div v-else>
    <h1>{{ item.title }}</h1>

    <img v-if="item.type === 'image'" :src="item.url" width="400">

    <audio v-else-if="item.type === 'audio'" controls>
      <source :src="item.url" type="audio/mpeg">
    </audio>

    <video v-else-if="item.type === 'video'" width="400" controls>
      <source :src="item.url" type="video/mp4">
    </video>

    <pre v-else-if="item.type === 'text'">
      {{ item.content }}
    </pre>

    <p>{{ item.description }}</p>

    <p v-if="item.tags?.length">Tags : {{ item.tags.join(', ') }}</p>

    <small>Ajouté le {{ new Date(item.created_at).toLocaleDateString() }}</small>
  </div>
</template>
