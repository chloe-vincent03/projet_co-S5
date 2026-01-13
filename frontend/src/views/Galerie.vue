<script setup>
import { ref, onMounted, computed } from 'vue';
import GalleryItem from '../components/GalleryItems.vue';
import { useUserStore } from "../stores/user";
import { useRouter } from "vue-router";
import axios from 'axios';
import GalleryItems from '../components/GalleryItems.vue';
import MediaCard from '@/components/MediaCard.vue';
import MyButton from '@/components/MyButton.vue';
import { useHead } from "@vueuse/head";


useHead({
  title: "Galerie",
});

const store = useUserStore();
const router = useRouter();


const galleryData = ref([]);
const sort = ref('date-desc');
const filterType = ref('all');
const filterTags = ref('');
const filterAuthor = ref('');

async function loadGallery() {
  if (galleryData.value.length === 0) {
    const res = await axios.get("/media"); // <-- maintenant le cookie est envoyé
    galleryData.value = res.data;

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

  // Filtrer par auteur
  if (filterAuthor.value.trim() !== "") {
    const searchAuthor = filterAuthor.value.toLowerCase();
    items = items.filter(i => i.username && i.username.toLowerCase().includes(searchAuthor));
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

// useHead({
//   title: 'Galerie des œuvres – PlumePixel',
//   meta: [
//     {
//       name: 'description',
//       content:
//         'Découvrez la galerie des œuvres : images, vidéos, récits et créations audio partagées par la communauté.'
//     }
//   ]
// })


</script>

<template>


  <section class="p-6">
    <h1 class="font-[PlumePixel] text-4xl mb-4 ml-4 text-blue-plumepixel">Galerie des œuvres</h1>

    <div class="flex flex-wrap items-center gap-4 mb-6">

      <label class="text-sm font-medium ml-4">Trier :</label>
      <select v-model="sort" class="border border-blue-plumepixel px-2 py-1 text-sm">
        <option value="date-desc">Du + récent au + ancien</option>
        <option value="date-asc">Du + ancien au + récent</option>
        <option value="title-asc">Titre A → Z</option>
        <option value="title-desc">Titre Z → A</option>
      </select>

      <label class="text-sm font-medium">Nature :</label>
      <select v-model="filterType" class="border px-2 py-1 text-sm border-blue-plumepixel">
        <option value="all">Tous</option>
        <option value="image">Images</option>
        <option value="audio">Audio</option>
        <option value="video">Vidéos</option>
        <option value="text">Récit</option>
      </select>

      <label class="text-sm font-medium">Tags :</label>
      <input type="text" v-model="filterTags" class="border px-2 py-1 text-sm border-blue-plumepixel"
        placeholder="noël, vidéo">

      <label class="text-sm font-medium">Auteur :</label>
      <input type="text" v-model="filterAuthor" class="border px-2 py-1 text-sm border-blue-plumepixel"
        placeholder="Nom d'utilisateur">
    </div>


    <div v-if="filtered.length === 0" class="text-gray-500 text-sm mb-6">
      Aucune œuvre ne correspond à ce(s) tag(s).
    </div>

    <div class="columns-2 sm:columns-3 lg:columns-4 gap-4 px-4">
      <MediaCard v-for="item in filtered" :key="item.id" :item="item" />
    </div>




    <router-link to="/ajouter">
      <MyButton class="fixed bottom-20 right-6 " :style="{ backgroundColor: 'var(--color-blue-plumepixel)' }"
        icon="plume">
        Crée
      </MyButton>
    </router-link>
  </section>
</template>
