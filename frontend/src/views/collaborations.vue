<script setup>
import { ref, onMounted } from 'vue';
import MyButton from "@/components/MyButton.vue";

const threads = ref([]);
const isLoading = ref(true);

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
    <h1 class="text-4xl font-['PlumePixel'] mb-12 text-center text-blue-plumepixel">Galerie des Collaborations</h1>

    <div v-if="isLoading" class="text-center">Chargement...</div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      
      <!-- CARTE (Thread) -->
      <div v-for="thread in threads" :key="thread.id" class="border border-blue-500 p-2 flex flex-col gap-2 bg-white shadow-sm hover:shadow-md transition">
        
        <!-- PARTIE HAUTE : Images -->
        <div class="flex gap-2 h-48">
            
            <!-- GAUCHE : Image Principale (Parent) -->
            <router-link :to="`/oeuvre/${thread.id}`" class="w-3/4 h-full relative group overflow-hidden bg-gray-100 border border-blue-200">
                <img v-if="thread.type === 'image'" :src="thread.url" class="w-full h-full object-cover">
                <video v-else-if="thread.type === 'video'" :src="thread.url" class="w-full h-full object-cover"></video>
                <div v-else class="w-full h-full flex items-center justify-center text-blue-500">
                    <!-- Icone selon type -->
                    <span v-if="thread.type === 'audio'" class="text-4xl">🎵</span>
                    <span v-else class="text-xl font-['PlumePixel']">TxT</span>
                </div>
            </router-link>

            <!-- DROITE : Miniatures (Enfants) - Max 2 affichées -->
            <div class="w-1/4 h-full flex flex-col gap-2">
                <div v-for="child in thread.children.slice(0, 2)" :key="child.id" class="h-1/2 w-full bg-gray-50 border border-blue-200 overflow-hidden relative">
                    <router-link :to="`/oeuvre/${child.id}`" class="block w-full h-full">
                        <img v-if="child.type === 'image'" :src="child.url" class="w-full h-full object-cover">
                        <div v-else class="w-full h-full flex items-center justify-center text-blue-300">
                             <span v-if="child.type === 'audio'" class="text-xl">🎵</span>
                             <span v-else class="text-xs">TxT</span>
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
    
    <div v-if="!isLoading && threads.length === 0" class="text-center text-gray-500 mt-12">
        Pas encore de collaborations.
    </div>

  </div>
</template>
