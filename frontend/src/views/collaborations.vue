<script setup>
import { ref, onMounted, computed, watch } from "vue";
import MyButton from "@/components/MyButton.vue";
import IconMusic from '@/components/icons/IconMusic.vue';
import { useUserStore } from "@/stores/user";
import axios from "axios";
import { useHead } from "@vueuse/head";

useHead({
  title: "Collaborations",
});

const userStore = useUserStore();
const threads = ref([]);
const isLoading = ref(true);

const sort = ref('date-desc');
const filterType = ref('all');
const filterTags = ref('');
const filterAuthor = ref('');
const filterStatus = ref('all');

const filteredThreads = computed(() => {
  let items = [...threads.value];

  // Filtrer par type (du parent)
  if (filterType.value !== 'all') {
    items = items.filter(i => i.type === filterType.value);
  }

  // Filtrer par statut
  if (filterStatus.value !== 'all') {
    items = items.filter(i => {
       // Si pas de status défini, on considère c'est "open" par défaut pour l'instant, ou on exclut ?
       // Le backend renvoie 'open' par défaut maintenant.
       return i.status === filterStatus.value || (!i.status && filterStatus.value === 'open');
    });
  }

  // Filtrer par tags (si le parent a des tags)
  // Note: Pour l'instant le backend ne renvoie pas les tags dans /threads, on filtre sur le titre/description si pas de tags
  if (filterTags.value.trim() !== "") {
    const search = filterTags.value.toLowerCase();
    items = items.filter(i => 
      (i.title && i.title.toLowerCase().includes(search)) || 
      (i.description && i.description.toLowerCase().includes(search))
    );
  }

  // Filtrer par auteur
  if (filterAuthor.value.trim() !== "") {
    const searchAuthor = filterAuthor.value.toLowerCase();
    items = items.filter(i => 
      (i.username && i.username.toLowerCase().includes(searchAuthor)) || 
      (i.children && i.children.some(c => c.username && c.username.toLowerCase().includes(searchAuthor)))
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

onMounted(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/media/threads', { credentials: 'include' });
    if (res.ok) {
      threads.value = await res.json();
    }
  } catch (e) {
    console.error(e);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="px-8 lg:px-12 py-12">
    <h1 class="text-4xl font-['PlumePixel'] mb-8 text-left text-blue-plumepixel">Galerie des Collaborations</h1>

    <!-- FILTRES -->
    <div class="flex flex-wrap items-center justify-start gap-4 mb-12">
        <div class="flex items-center gap-2">
            <label class="text-sm font-medium">Trier :</label>
            <select v-model="sort" class="border border-blue-plumepixel px-2 py-1 text-sm bg-white focus:outline-none">
                <option value="date-desc">Du + récent au + ancien</option>
                <option value="date-asc">Du + ancien au + récent</option>
                <option value="title-asc">Titre A → Z</option>
                <option value="title-desc">Titre Z → A</option>
            </select>
        </div>

        <div class="flex items-center gap-2">
            <label class="text-sm font-medium">Nature :</label>
            <select v-model="filterType" class="border border-blue-plumepixel px-2 py-1 text-sm bg-white focus:outline-none">
                <option value="all">Tous</option>
                <option value="image">Images</option>
                <option value="audio">Audio</option>
                <option value="video">Vidéos</option>
                <option value="text">Récit</option>
            </select>
        </div>

        <div class="flex items-center gap-2">
            <label class="text-sm font-medium">Statut :</label>
            <select v-model="filterStatus" class="border border-blue-plumepixel px-2 py-1 text-sm bg-white focus:outline-none">
                <option value="all">Tous</option>
                <option value="open">En recherche</option>
                <option value="in_progress">En cours</option>
                <option value="finished">Terminé</option>
            </select>
        </div>

        <div class="flex items-center gap-2">
             <label class="text-sm font-medium">Auteur :</label>
             <input type="text" v-model="filterAuthor" class="border border-blue-plumepixel px-2 py-1 text-sm focus:outline-none" placeholder="Nom d'utilisateur...">
        </div>

        <div class="flex items-center gap-2">
             <label class="text-sm font-medium">Recherche :</label>
             <input type="text" v-model="filterTags" class="border border-blue-plumepixel px-2 py-1 text-sm focus:outline-none" placeholder="Titre, description...">
        </div>
    </div>

    <div v-if="isLoading" class="text-center">Chargement...</div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      
      <!-- CARTE (Thread) -->
      <div v-for="thread in filteredThreads" :key="thread.id" class="border border-blue-500 p-2 flex flex-col gap-2 bg-white shadow-sm hover:shadow-md transition">
        
        <!-- PARTIE HAUTE : Images -->
        <div class="flex gap-2 h-48">
            
            <!-- GAUCHE : Image Principale (Parent) -->
            <router-link :to="`/oeuvre/${thread.id}`" class="w-3/4 h-full relative group overflow-hidden bg-gray-100 border border-blue-200">
                <img v-if="thread.type === 'image'" :src="thread.url" class="w-full h-full object-cover">
                <video v-else-if="thread.type === 'video'" :src="thread.url" class="w-full h-full object-cover"></video>
                <div v-else class="w-full h-full flex items-center justify-center text-blue-500">
                    <!-- Icone selon type -->
                    <span v-if="thread.type === 'audio'" class="text-4xl"><icon-music /></span>
                    <span v-else class="text-xl font-['PlumePixel']">{{ thread.content }}</span>
                </div>
            </router-link>

            <!-- DROITE : Miniatures (Enfants) - Max 2 affichées -->
            <div class="w-1/4 h-full flex flex-col gap-2">
                <div v-for="child in thread.children.slice(0, 2)" :key="child.id" class="h-1/2 w-full bg-gray-50 border border-blue-200 overflow-hidden relative">
                    <router-link :to="`/oeuvre/${child.id}`" class="block w-full h-full">
                        <img v-if="child.type === 'image'" :src="child.url" class="w-full h-full object-cover">
                        <div v-else class="w-full h-full flex items-center justify-center text-blue-300">
                             <span v-if="child.type === 'audio'" class="text-xl">
                              <icon-music />
                             </span>
                             <span v-else class="text-xs">{{ thread.content}}</span>
                        </div>
                    </router-link>
                </div>
                <!-- S'il n'y a pas assez d'enfants pour remplir -->
                <div v-if="thread.children.length === 0" class="h-full w-full bg-gray-50 border border-dashed border-blue-200 flex items-center justify-center">
                    <span class="text-xs text-gray-300 text-center">Pas de réponse</span>
                </div>
            </div>

        </div>

        <!-- PARTIE BASSE : Infos -->
        <div class="mt-2 text-sm">
            <h2 class="font-['PlumePixel'] text-lg truncate">{{ thread.title }}</h2>
            <div class="flex justify-between text-gray-500 text-xs mt-1">
                <span>{{ thread.username }} {{ thread.children_count > 0 ? '+' + thread.children_count : '' }}</span>
                <span>{{ new Date(thread.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) }}</span>
            </div>
        </div>

      </div>

    </div>
    
    <div v-if="!isLoading && filteredThreads.length === 0" class="text-center text-gray-500 mt-12">
        Aucune collaboration ne correspond à votre recherche.
    </div>

  </div>
</template>
