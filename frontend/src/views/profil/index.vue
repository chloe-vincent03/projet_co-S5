<script setup>
import { useUserStore } from "@/stores/user";
import { useRouter } from "vue-router";
import { ref, computed, watchEffect } from "vue";
import MyButton from "@/components/MyButton.vue";
import MediaCard from "@/components/MediaCard.vue";
import api from "@/api/axios";
import { useHead } from "@vueuse/head";

useHead({
  title: "Mon Profil",
});

const store = useUserStore();
const router = useRouter();

const message = ref("");
const allMedia = ref([]);
const threads = ref([]);
const activeTab = ref("galerie");

const user = computed(() => store.user);
const galerie = computed(() => allMedia.value);

// 🔄 Chargement des données utilisateur
watchEffect(async () => {
  if (!user.value?.user_id) return;

  try {
    const resMedia = await api.get(`/media/user/${user.value.user_id}`);
    allMedia.value = resMedia.data ?? [];

    const resThreads = await api.get(`/media/user/${user.value.user_id}/threads`);
    threads.value = resThreads.data ?? [];
  } catch (err) {
    console.error(err);
  }
});

// ACTIONS
async function logout() {
  await store.logout();
  router.push("/login");
}

function goToSettings() {
  router.push("/profil/settings");
}

async function generateBook() {
  try {
    if (!allMedia.value.length) {
      message.value = "Vous n'avez aucune œuvre à inclure dans le livre.";
      return;
    }

    const res = await fetch("http://localhost:3000/api/book/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `Livre de ${user.value.username}`,
        worksIds: allMedia.value.map(m => m.id),
        author: user.value.username,
      }),
    });

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Livre_${user.value.username}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch {
    message.value = "Impossible de générer le livre.";
  }
}

watchEffect(() => {
  console.log(allMedia.value);
});

// useHead({
//   title: item.value.title,
//   meta: [
//     {
//       name: 'description',
//       content: item.value.description || 'Découvre cette œuvre.'
//     }
//   ]
// })

</script>

<template>
  <div class="px-4 pt-24 pb-16">
    <div class="max-w-5xl mx-auto">

      <!-- PROFIL -->
      <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div class="w-24 h-24 sm:w-32 sm:h-32 border border-blue-plumepixel rounded-lg overflow-hidden bg-gray-200">
          <img v-if="user?.avatar" :src="user.avatar" class="w-full h-full object-cover" />
        </div>

        <div class="text-center sm:text-left">
          <h1 class="text-3xl font-[PlumePixel] text-blue-plumepixel">
            {{ user?.first_name }} {{ user?.last_name }}
          </h1>

          <p class="text-sm text-gray-500">@{{ user?.username }}</p>

          <p class="text-xs text-gray-400 mt-1">
            Membre depuis le
            {{ new Date(user?.created_at).toLocaleDateString("fr-FR") }}
          </p>

          <p class="mt-3 max-w-xl text-gray-700 leading-relaxed">
            {{ user?.bio || "Aucune bio renseignée." }}
          </p>
        </div>
      </div>

      <!-- ACTIONS -->
      <div class="flex flex-col sm:flex-row gap-4 mt-8">
        <MyButton class="w-full sm:w-auto" icon="setting" @click="goToSettings"
          :style="{ backgroundColor: 'var(--color-blue-plumepixel)' }">
          Paramètres
        </MyButton>

        <MyButton class="w-full sm:w-auto" @click="logout" :style="{
          border: '2px solid var(--color-blue-plumepixel)',
          color: 'var(--color-blue-plumepixel)',
        }">
          Se déconnecter
        </MyButton>
      </div>

      <!-- BADGES -->
      <div class="flex flex-wrap gap-3 mt-6">
        <span v-if="user?.is_admin === 1" class="px-3 py-1 bg-yellow-300 text-black rounded text-sm">
          Administrateur
        </span>

        <span class="px-3 py-1 rounded text-sm font-medium"
          :class="user?.is_private ? 'bg-gray-200 text-gray-700' : 'bg-green-100 text-green-700'">
          {{ user?.is_private ? "Compte privé" : "Compte public" }}
        </span>
      </div>

      <p v-if="message" class="mt-4 text-red-600">{{ message }}</p>

      <!-- TABS -->
      <div class="flex gap-6 mt-14 text-blue-plumepixel font-[PlumePixel] text-lg border-b pb-2 overflow-x-auto">
        <button class="whitespace-nowrap" @click="activeTab = 'galerie'"
          :class="activeTab === 'galerie' ? 'underline' : 'opacity-50'">
          Ma galerie
        </button>

        <button class="whitespace-nowrap" @click="activeTab = 'collab'"
          :class="activeTab === 'collab' ? 'underline' : 'opacity-50'">
          Collaborations
        </button>
      </div>

      <!-- GALERIE -->
     <div v-if="activeTab === 'galerie'" class="mt-10 columns-2 sm:columns-3 lg:columns-4 gap-4">
        <MediaCard v-for="m in galerie" :key="m.id" :item="m" class="mb-4" />

        <p v-if="galerie.length === 0" class="text-gray-500 italic mt-6">
          Aucune œuvre publiée.
        </p>
      </div>

      <!-- COLLABORATIONS -->
      <div v-if="activeTab === 'collab'" class="mt-8">
        <div v-if="threads.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="thread in threads" :key="thread.id"
            class="border border-blue-plumepixel p-3 bg-white hover:shadow-md transition">
            <div class="flex flex-col sm:flex-row gap-2 sm:h-48">
              <router-link :to="`/oeuvre/${thread.id}`"
                class="w-full sm:w-3/4 h-48 sm:h-full bg-gray-100 overflow-hidden">
                <img v-if="thread.type === 'image'" :src="thread.url" class="w-full h-full object-cover" />
              </router-link>

              <div class="w-full sm:w-1/4 flex gap-2 sm:flex-col">
                <router-link v-for="child in thread.children.slice(0, 2)" :key="child.id" :to="`/oeuvre/${child.id}`"
                  class="h-24 sm:h-1/2 bg-gray-100 overflow-hidden">
                  <img v-if="child.type === 'image'" :src="child.url" class="w-full h-full object-cover" />
                </router-link>
              </div>
            </div>

            <div class="mt-3 text-sm">
              <h2 class="font-[PlumePixel] text-lg truncate">
                {{ thread.title }}
              </h2>
              <div class="flex justify-between text-xs text-gray-500 mt-1">
                <span>{{ thread.username }}</span>
                <span>{{ new Date(thread.created_at).toLocaleDateString("fr-FR") }}</span>
              </div>
            </div>
          </div>
        </div>

        <p v-else class="text-gray-500 italic">
          Aucune collaboration pour le moment.
        </p>
      </div>

      <!-- PDF -->
      <div class="mt-12 flex justify-center">
        <MyButton class="w-full sm:w-auto" :style="{ backgroundColor: 'var(--color-blue-plumepixel)' }"
          @click="generateBook">
          Télécharger mon portfolio (PDF)
        </MyButton>
      </div>

    </div>
  </div>
</template>
