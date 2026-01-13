<script setup>
import MyButton from "@/components/MyButton.vue";
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import LikeButton from "@/components/LikeButton.vue";
import MediaCard from "@/components/MediaCard.vue";
import { useHead } from "@vueuse/head";


const route = useRoute();
const router = useRouter(); // Pour la redirection après suppression
const item = ref(null);
const userStore = useUserStore();

// SEO Dynamique
useHead({
  title: computed(() => item.value ? item.value.title : "Détails de l'œuvre")
});

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
      `http://localhost:3000/api/media/${route.params.id}`,
      {
        credentials: "include" // 🔥 OBLIGATOIRE
      }
    );


    const txt = await res.text();
    console.log("Réponse brute :", txt); 

    if (!res.ok) throw new Error(`Erreur HTTP : ${res.status}`);

    const data = JSON.parse(txt);
    item.value = {
      ...data,
      likes_count: Number(data.likes_count) || 0,
      is_liked: !!data.is_liked
    };


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

const goToProfile = (profileUserId) => {
  const myId = userStore.user?.user_id;

  if (!myId) return;

  // 🔥 MON PROFIL → page perso
  if (profileUserId === myId) {
    router.push("/profil"); // ou /mon-profil /settings
  }
  // 👤 AUTRE UTILISATEUR → profil public
  else {
    router.push(`/profil/${profileUserId}`);
  }
};

async function updateStatus() {
  if (!item.value) return;
  try {
    const res = await fetch(`http://localhost:3000/api/media/${item.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        ...item.value, // On renvoie tout l'objet pour ne pas casser les autres champs (car PUT écrase souvent)
        status: item.value.status 
      })
    });
    if (res.ok) {
        // Succès
        console.log("Status mis à jour");
    } else {
        alert("Erreur lors de la mise à jour du statut");
    }
  } catch (e) {
    console.error(e);
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
          <LikeButton v-if="item" :item="item" />
          <!-- Badge Privé/Public (visible uniquement pour le propriétaire) -->
          <span 
            v-if="isOwner"
            class="px-3 py-1 rounded-full text-xs font-medium"
            :class="item.is_public === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'"
          >
            {{ item.is_public === 1 ? 'Public' : 'Privé' }}
          </span>
        </div>

        <!-- Status & Badge (Style DA) -->
        <div class="mb-6 w-full max-w-xs" v-if="item.allow_collaboration">
             <label class="block font-bold mb-2 text-sm uppercase tracking-wide text-blue-plumepixel">Statut de la collaboration</label>
             
             <!-- Si Propriétaire : Select Stylisé -->
             <div v-if="isOwner" class="relative">
                 <select 
                    v-model="item.status" 
                    @change="updateStatus"
                    class="w-full border border-blue-plumepixel p-2 bg-white font-medium focus:outline-none focus:border-black transition-colors appearance-none cursor-pointer"
                 >
                     <option value="open">En recherche</option>
                     <option value="in_progress">En cours</option>
                     <option value="finished">Terminé</option>
                 </select>
                 <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-blue-plumepixel">
                    <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
             </div>

             <div v-else class="border border-blue-plumepixel p-2 bg-gray-50 font-medium text-gray-800 flex items-center gap-2">
                <span v-if="item.status === 'open' || !item.status">En recherche</span>
                <span v-else-if="item.status === 'in_progress'">En cours</span>
                <span v-else>Terminé</span>
             </div>

             <div class="mt-2 text-xs text-gray-500 flex items-start gap-1">
                <p>Cette œuvre est ouverte à la collaboration. Toute contribution implique un accord de co-propriété (voir CGU).</p>
             </div>
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
          <MyButton icon="voir" size="small" font="inter" :style="{ backgroundColor: 'var(--color-blue-plumepixel)' }"
            @click="goToProfile(item.user_id)">
            Voir le profil
          </MyButton>

        </div>


        <!-- Copyright -->
        <div class="mb-6 text-sm text-gray-500">
            <p>Protection des droits : <span class="font-medium">© {{ new Date(item.created_at).getFullYear() }} {{ item.username }} - Tous droits réservés.</span></p>
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
      <div v-if="item.allow_collaboration && item.status !== 'finished'" class="lg:w-64 flex-shrink-0 lg:flex lg:flex-col">
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
      <h2 class="text-2xl font-['PlumePixel'] mb-6">
        Collaborations
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MediaCard v-for="collab in item.collaborations" :key="collab.id" :item="collab" />
      </div>
    </div>

  </div>
</template>
