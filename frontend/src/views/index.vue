<script setup>
import { ref, onMounted, computed } from 'vue';
import GalleryItem from '../components/GalleryItems.vue';
import { useUserStore } from "../stores/user";
import { useRouter } from "vue-router";


const store = useUserStore();
const router = useRouter();



const galleryData = ref([]);
const sort = ref('date-desc');
const filterType = ref('all');
const filterTags = ref('');

async function loadGallery() {
  if (galleryData.value.length === 0) {
    const res = await fetch('http://localhost:3000/api/media');
    galleryData.value = await res.json();
  }
}

onMounted(loadGallery);

const filtered = computed(() => {
  let items = [...galleryData.value];

  // Filtrer par type
  if (filterType.value !== 'all') {
    items = items.filter(i => i.type === filterType.value);
  }

  // Filtrer par tags
  if (filterTags.value.trim() !== "") {
    const tagsWanted = filterTags.value.toLowerCase().split(',').map(t => t.trim());
    items = items.filter(i =>
      i.tags && i.tags.some(t => tagsWanted.includes(t.toLowerCase()))
    );
  }

  // Trier
  items.sort((a, b) => {
    if (sort.value === 'date-desc') return new Date(b.created_at) - new Date(a.created_at);
    if (sort.value === 'date-asc') return new Date(a.created_at) - new Date(b.created_at);
    if (sort.value === 'title-asc') return a.title.localeCompare(b.title);
    if (sort.value === 'title-desc') return b.title.localeCompare(a.title);
    return 0;
  });

  return items;
});

function goLogin() {
  router.push("/login");
}

function goRegister() {
  router.push("/register");
}

function goProfile() {
  router.push("/profil");
}

async function logout() {
  await store.logout();
  router.push("/");
}

</script>

<template>

  <!-- BARRE D'ACTIONS COMPTE -->
<div style="margin-bottom: 20px;">
  
  <!-- 🔹 NON CONNECTÉ -->
  <div v-if="!store.isLoggedIn" >
    <button @click="goLogin" class="">Login</button>
    <button @click="goRegister" class="">Register</button>
  </div>

  <!-- 🔹 CONNECTÉ -->
  <div v-else >
    <button @click="goProfile">Profil</button>
    <button @click="logout">Déconnexion</button>
  </div>

</div>

  <h1>Galerie des œuvres</h1>

  <label>Trier par :</label>
  <select v-model="sort">
    <option value="date-desc">Date : du plus récent au plus ancien</option>
    <option value="date-asc">Date : du plus ancien au plus récent</option>
    <option value="title-asc">Titre : A → Z</option>
    <option value="title-desc">Titre : Z → A</option>
  </select>

  <label>Filtrer par nature :</label>
  <select v-model="filterType">
    <option value="all">Tous</option>
    <option value="image">Images</option>
    <option value="audio">Audio</option>
    <option value="video">Vidéos</option>
    <option value="text">Récit</option>
  </select>

  <label>Filtrer par tag :</label>
  <input type="text" v-model="filterTags" placeholder="Exemple : noël, vidéo">

  <div v-if="filtered.length === 0">
    Aucune œuvre ne correspond à ce(s) tag(s).
  </div>

  <div class="gallery">
    <GalleryItem
      v-for="item in filtered"
      :key="item.id"
      :item="item"
    />
  </div>

  <router-link to="/ajouter">
    <button>➕ Ajouter une œuvre</button>
  </router-link>
</template>

<style>
.media-card img {
  max-width: 150px;
  height: auto;
  object-fit: cover;
}
.gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
