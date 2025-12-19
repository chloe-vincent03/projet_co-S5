<script setup>
import router from "@/router";
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import api from "@/api/axios";
const route = useRoute();
const user = ref(null);
const allMedia = ref([]);

const threads = ref([]);

const galerie = computed(() => allMedia.value);

const resMedia = await fetch(
  `http://localhost:3000/api/media/user/${route.params.id}`
);
allMedia.value = await resMedia.json();

const resThreads = await fetch(
  `http://localhost:3000/api/media/user/${route.params.id}/threads`
);
threads.value = await resThreads.json();

const activeTab = ref("galerie"); // "galerie" ou "collab"

// 🔁 Réagir AU PARAMÈTRE D’URL
watch(
  () => route.params.id,
  async (id) => {
    if (!id) return;

    try {
      const res = await api.get(`/auth/users/${id}`);
      user.value = res.data;
    } catch (err) {
      console.error("Erreur chargement user :", err);
    }
  },
  { immediate: true } // 🔥 remplace onMounted
);

const goToChat = () => {
  const userId = Number(route.params.id);
  if (!userId) return;

  router.push({
    path: "/messagerie",
    query: { userId },
  });
};


import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
const currentUser = computed(() => userStore.user);

const deleteUser = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.")) return;

    try {
        await api.delete(`/auth/admin/users/${route.params.id}`);
        alert("Utilisateur supprimé avec succès.");
        router.push("/");
    } catch (err) {
        alert("Erreur lors de la suppression : " + (err.response?.data?.message || err.message));
    }
};
</script>

<template>
  <div class="px-4 pt-12 lg:pt-20 pb-20">
    <div class="max-w-6xl mx-auto">
      <div class="flex flex-col lg:flex-row items-start gap-6">
        <div class="w-36 h-36 bg-gray-300 border border-blue-plumepixel overflow-hidden rounded-lg">
             <img 
                v-if="user?.avatar" 
                :src="user.avatar" 
                alt="Avatar" 
                class="w-full h-full object-cover"
            >
        </div>

        <div>
          <h1 class="text-4xl font-[PlumePixel] text-blue-plumepixel">
            {{ user?.first_name }} {{ user?.last_name }}
          </h1>

          <p class="text-gray-600 mt-1">@{{ user?.username }}</p>

          <p class="text-xs text-gray-500 mt-1">
            Membre depuis le
            {{ new Date(user?.created_at).toLocaleDateString("fr-FR") }}
          </p>

          <p class="mt-3 max-w-xl text-gray-700">
            {{
              user?.bio ||
              "Cet utilisateur n'a pas encore rempli sa biographie."
            }}
          </p>
        </div>
      </div>

     <div class="flex gap-6 mt-10 text-blue-plumepixel font-[PlumePixel] text-lg">

  <button
    @click="activeTab = 'galerie'"
    :class="activeTab === 'galerie' ? 'underline' : 'opacity-50 hover:opacity-100'"
  >
    Galerie
  </button>

  <button
    @click="activeTab = 'collab'"
    :class="activeTab === 'collab' ? 'underline' : 'opacity-50 hover:opacity-100'"
  >
    Collaborations
  </button>
   <div v-if="user">
    <h1>{{ user.username }}</h1>

    <button @click="goToChat">
      Envoyer un message
    </button>
  </div>

  <div v-else>
    Chargement du profil…
  </div>

</div>

  <!-- ADMIN SECTION -->
  <div v-if="currentUser?.is_admin && user && currentUser.user_id !== user.user_id" class="mt-4">
    <button 
      @click="deleteUser" 
      class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
    >
      Supprimer cet utilisateur (Admin)
    </button>
  </div>

<div v-if="activeTab === 'galerie'" class="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <router-link
          v-for="m in galerie"
          :key="m.id"
          :to="`/oeuvre/${m.id}`"
          class="block bg-gray-300 h-48 overflow-hidden"
        >
          <img
            v-if="m.type === 'image'"
            :src="m.url"
            class="w-full h-full object-cover"
          />

          <video
            v-else-if="m.type === 'video'"
            :src="m.url"
            class="w-full h-full object-cover"
            muted
            autoplay
            loop
          ></video>

          <div
            v-else
            class="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-600"
          >
            {{ m.type.toUpperCase() }}
          </div>
        </router-link>
      </div>

      <div v-if="activeTab === 'collab'" class="mt-10">
        <div v-if="threads.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <!-- THREAD CARD (Copied from collaborations.vue) -->
          <div v-for="thread in threads" :key="thread.id" class="border border-blue-plumepixel p-2 flex flex-col gap-2 bg-white shadow-sm hover:shadow-md transition">
            
            <!-- PARTIE HAUTE : Images -->
            <div class="flex gap-2 h-48">
                
                <!-- GAUCHE : Image Principale (Parent) -->
                <router-link :to="`/oeuvre/${thread.id}`" class="w-3/4 h-full relative group overflow-hidden bg-gray-100 border border-blue-200">
                    <img v-if="thread.type === 'image'" :src="thread.url" class="w-full h-full object-cover">
                    <video v-else-if="thread.type === 'video'" :src="thread.url" class="w-full h-full object-cover"></video>
                    <div v-else class="w-full h-full flex items-center justify-center text-blue-500">
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
        <p v-else class="text-gray-600 text-sm">Aucune collaboration trouvée pour cet utilisateur.</p>
      </div>

    </div>
  </div>
</template>
