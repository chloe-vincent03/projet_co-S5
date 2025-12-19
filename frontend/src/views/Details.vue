<script setup>
import MyButton from "@/components/MyButton.vue";
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";

const route = useRoute();
const router = useRouter(); // Pour la redirection après suppression
const item = ref(null);
const userStore = useUserStore();

// Calculer si l'utilisateur connecté est le propriétaire
const isOwner = computed(() => {
  if (!item.value || !userStore.user) return false;
  return item.value.user_id === userStore.user.user_id;
});

// Récupérer l'utilisateur courant au montage (au cas où on refresh la page)
onMounted(async () => {
    // On s'assure d'avoir l'info user
    if (!userStore.user) {
        await userStore.fetchUser();
    }

  try {
    const res = await fetch(
      `http://localhost:3000/api/media/${route.params.id}`
    );

    const txt = await res.text();
    console.log("Réponse brute :", txt); 

    if (!res.ok) throw new Error(`Erreur HTTP : ${res.status}`);

    const data = JSON.parse(txt);
    item.value = data;
  } catch (err) {
    console.error("Erreur lors du fetch :", err);
  }
});

async function deleteItem() {
  if (!confirm("Voulez-vous vraiment supprimer cette œuvre ?")) return;

  try {
    const res = await fetch(`http://localhost:3000/api/media/${item.value.id}`, {
      method: "DELETE",
      credentials: "include" // Important pour l'auth
    });

    if (res.ok) {
        alert("Œuvre supprimée !");
        router.push('/');
    } else {
        const err = await res.json();
        alert("Erreur : " + (err.error || "Impossible de supprimer"));
    }
  } catch (err) {
    console.error(err);
    alert("Erreur réseau");
  }
}
</script>

<template>
  <div class="w-full px-12 lg:px-32 py-6 text-gray-900">
    <!-- RETOUR -->
    <MyButton
      to="/"
      icon="voir"
      size="small"
      font="inter"
      :style="{ backgroundColor: 'var(--color-blue-plumepixel)' }"
      class="mb-2"
    >
      retour à la galerie
    </MyButton>
    <!-- LOADING -->
    <div v-if="!item" class="text-center py-20  font-['PlumePixel'] text-blue-plumepixel">
      Chargement...
    </div>

    <!-- CONTENU -->
    <div v-else class="flex flex-col lg:flex-row gap-8 lg:gap-12">
      <!-- COLONNE GAUCHE (contenu) -->
      <div class="flex-1">
        <!-- IMAGE / VIDEO / AUDIO -->
        <div class="w-full overflow-hidden shadow-sm mb-6">
          <img
            v-if="item.type === 'image'"
            :src="item.url"
            class="w-full h-auto "
          />

          <video
            v-else-if="item.type === 'video'"
            controls
            class="w-full"
          >
            <source :src="item.url" type="video/mp4" />
          </video>

<!-- AUDIO – Version mise en page stylée -->
<div
  v-else-if="item.type === 'audio'"
  class=" border border-blue-plumepixel p-4 shadow-sm"
>
  <p class="text-sm font-['PlumePixel'] text-blue-plumepixel mb-2">
    🎧 Écouter l'œuvre audio
  </p>

  <audio controls class="w-full rounded-md">
    <source :src="item.url" type="audio/mpeg" />
  </audio>
</div>


          <pre
            v-else-if="item.type === 'text'"
            class="whitespace-pre-line bg-white p-4"
          >
            {{ item.content.replace(/\\n/g, '\n') }}
          </pre>
        </div>

        <!-- TITRE -->
        <div class="flex items-center gap-3 mb-2">
          <h1 class="text-xl md:text-3xl font-['PlumePixel']">
            {{ item.title }}
          </h1>
          
          <!-- Badge Privé/Public (visible uniquement pour le propriétaire) -->
          <span 
            v-if="isOwner"
            class="px-3 py-1 rounded-full text-xs font-medium"
            :class="item.is_public === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'"
          >
            {{ item.is_public === 1 ? 'Public' : 'Privé' }}
          </span>
        </div>

        <!-- METADATA -->
        <div class="text-sm text-gray-600 mb-4 flex flex-wrap gap-2">
          <span>{{ new Date(item.created_at).toLocaleDateString() }}</span>

          <!-- Tags -->
          <div class="flex gap-2 flex-wrap ">
            <span
              v-for="tag in item.tags"
              :key="tag"
              class="px-2 py-1 text-xs border border-blue-plumepixel text-blue-plumepixel "
            >
              {{ tag }}
            </span>
          </div>
        </div>

        <!-- DESCRIPTION -->
        <p class="leading-relaxed mb-6">
          {{ item.description }}
        </p>

        <!-- AUTEUR -->
        <div
          class="border border-blue-plumepixel p-4 flex items-center justify-between mb-8"
        >
          <div class="flex items-center gap-4">
            <div>
              <p class="font-semibold text-blue-plumepixel">{{ item.username }}</p>
              <p class="text-xs text-gray-500">@{{ item.username }}</p>
            </div>
          </div>
          <MyButton
      :to="`/profil/${item.user_id}`"
      icon="voir"
      size="small"
      font="inter"
      :style="{ backgroundColor: 'var(--color-blue-plumepixel)' }"
    >
Voir le profil    </MyButton>

        </div>

        <!-- ZONE BOUTONS PROPRIÉTAIRE OU ADMIN -->
        <div v-if="isOwner || (userStore.user && userStore.user.is_admin)" class="border-t pt-4 mt-4 flex gap-4">
            <MyButton 
                v-if="isOwner"
                :to="`/oeuvre/edit/${item.id}`"
                size="small"
                font="inter"
                icon="setting"
                variant="jaune" 
            >
                Modifier
            </MyButton>

            <MyButton 
                variant="rouge" 
                size="small" 
                icon="delete" 
                @click="deleteItem"
            >
                {{ isOwner ? "Supprimer l'œuvre" : "Supprimer (Admin)" }}
            </MyButton>
        </div>

      </div>

      <!-- COLONNE DROITE (bouton collaborer desktop) -->
      <div v-if="item.allow_collaboration" class="lg:w-64 flex-shrink-0 lg:flex lg:flex-col">
        <MyButton
        :to="`/ajouter?parent_id=${item.id}`"
      icon="plume"
      size="large"
      :style="{ backgroundColor: 'var(--color-blue-plumepixel)'}"
    >
         
        
          Collaborer
       </MyButton>
      </div>
    </div>

    <!-- SECTION COLLABORATIONS -->
    <div v-if="item && item.collaborations && item.collaborations.length > 0" class="mt-12 border-t pt-8">
      <h2 class="text-2xl font-['PlumePixel'] mb-6">Collaborations</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="collab in item.collaborations" :key="collab.id" class="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
          <router-link :to="`/oeuvre/${collab.id}`" class="block">
            <div v-if="collab.type === 'image'" class="h-48 overflow-hidden">
               <img :src="collab.url" class="w-full h-full object-cover">
            </div>
            <div v-else class="h-48 bg-gray-100 flex items-center justify-center text-gray-400">
               <span v-if="collab.type === 'video'">Vidéo</span>
               <span v-else-if="collab.type === 'audio'">Audio</span>
               <span v-else>Texte</span>
            </div>
            <div class="p-4">
              <h3 class="font-bold text-lg mb-1">{{ collab.title }}</h3>
              <p class="text-xs text-gray-500">{{ new Date(collab.created_at).toLocaleDateString() }}</p>
            </div>
          </router-link>
        </div>
      </div>
    </div>

  </div>
</template>
