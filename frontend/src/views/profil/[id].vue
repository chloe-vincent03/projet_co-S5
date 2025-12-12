<script setup>
import router from "@/router";
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import api from "@/api/axios";
const route = useRoute();
const user = ref(null);
const medias = ref([]);

const res = await fetch(
  `http://localhost:3000/api/auth/users/${route.params.id}`
);
user.value = await res.json();

const resMedia = await fetch(
  `http://localhost:3000/api/media/user/${route.params.id}`
);
medias.value = await resMedia.json();

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


</script>

<template>
  <div class="px-4 pt-12 lg:pt-20 pb-20">
    <div class="max-w-6xl mx-auto">
      <div class="flex flex-col lg:flex-row items-start gap-6">
        <div class="w-36 h-36 bg-gray-300 border border-blue-plumepixel"></div>

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


<div v-if="activeTab === 'galerie'" class="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <router-link
          v-for="m in medias"
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
      <div v-if="activeTab === 'collab'" class="mt-10 text-gray-600 text-sm">
  <p>Aucune collaboration pour le moment.</p>
</div>

    </div>
  </div>
</template>
