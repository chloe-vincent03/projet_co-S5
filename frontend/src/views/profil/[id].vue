<script setup>
import router from "@/router";
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import api from "@/api/axios";
import MyButton from "@/components/MyButton.vue";
import { useUserStore } from "@/stores/user";
import MediaCard from "@/components/MediaCard.vue";
import { useHead } from "@vueuse/head";

const route = useRoute();
const userStore = useUserStore();

const user = ref(null);
const allMedia = ref([]);
const threads = ref([]);
const activeTab = ref("galerie");

// SEO
useHead({
  title: computed(() => user.value ? `${user.value.first_name} ${user.value.last_name}` : "Profil Utilisateur")
});

const galerie = computed(() => allMedia.value);
const currentUser = computed(() => userStore.user);

const collaborations = computed(() =>
  threads.value.filter(thread => thread.children.length > 0)
);


// 🔁 Charger user quand l’ID change
watch(
  () => route.params.id,
  async (id) => {
    if (!id) return;
    try {
      const resUser = await api.get(`/auth/users/${id}`);
      user.value = resUser.data;

      const resMedia = await api.get(`/media/user/${id}`);
      allMedia.value = resMedia.data;

      const resThreads = await api.get(`/media/user/${id}/threads`);
      threads.value = resThreads.data;
    } catch (err) {
      console.error("Erreur chargement profil :", err);
    }
  },
  { immediate: true }
);

const goToChat = () => {
  const userId = Number(route.params.id);
  if (!userId) return;
  router.push({ path: "/messagerie", query: { userId } });
};

const deleteUser = async () => {
  if (!confirm("Supprimer cet utilisateur définitivement ?")) return;
  await api.delete(`/auth/admin/users/${route.params.id}`);
  router.push("/");
};
</script>

<template>
  <div class="px-4 pt-24 pb-20">
    <div class="max-w-6xl mx-auto">

      <!-- PROFIL -->
      <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div class="w-24 h-24 sm:w-36 sm:h-36 bg-gray-200 border border-blue-plumepixel rounded-lg overflow-hidden">
          <img v-if="user?.avatar" :src="user.avatar" class="w-full h-full object-cover" />
        </div>

        <div class="text-center sm:text-left">
          <h1 class="text-3xl sm:text-4xl font-[PlumePixel] text-blue-plumepixel">
            {{ user?.first_name }} {{ user?.last_name }}
          </h1>

          <p class="text-gray-600">@{{ user?.username }}</p>

          <p class="text-xs text-gray-500 mt-1">
            Membre depuis le
            {{ new Date(user?.created_at).toLocaleDateString("fr-FR") }}
          </p>

          <p class="mt-3 max-w-xl text-gray-700 leading-relaxed">
            {{ user?.bio || "Cet utilisateur n'a pas encore rempli sa biographie." }}
          </p>
        </div>
      </div>

      <!-- ACTIONS -->
      <div class="flex flex-col sm:flex-row gap-4 mt-8">
        <MyButton v-if="user" class="w-full sm:w-auto" :style="{ backgroundColor: 'var(--color-blue-plumepixel)' }"
          @click="goToChat">
          Envoyer un message
        </MyButton>
      </div>

      <!-- ADMIN -->
      <div v-if="currentUser?.is_admin && user && currentUser.user_id !== user.user_id" class="mt-6">
        <button @click="deleteUser" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">
          Supprimer cet utilisateur (Admin)
        </button>
      </div>

      <!-- TABS -->
      <div class="
          flex gap-6 mt-16
          text-blue-plumepixel font-[PlumePixel] text-lg
          border-b pb-2
          overflow-x-auto
        ">
        <button class="whitespace-nowrap" @click="activeTab = 'galerie'"
          :class="activeTab === 'galerie' ? 'underline' : 'opacity-50'">
          Galerie
        </button>

        <button class="whitespace-nowrap" @click="activeTab = 'collab'"
          :class="activeTab === 'collab' ? 'underline' : 'opacity-50'">
          Collaborations
        </button>
      </div>

      <!-- GALERIE -->
      <!-- GALERIE -->
      <div v-if="activeTab === 'galerie'" class="mt-10 columns-2 sm:columns-3 lg:columns-4 gap-4">
        <MediaCard v-for="m in galerie" :key="m.id" :item="m" class="mb-4" />

        <p v-if="galerie.length === 0" class="text-gray-500 italic mt-6">
          Aucune œuvre publiée.
        </p>
      </div>

      <!-- COLLABORATIONS -->
      <div v-if="activeTab === 'collab'" class="mt-10">
        <div v-if="threads.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="thread in threads" :key="thread.id"
            class="border border-blue-plumepixel p-3 bg-white hover:shadow-md transition">
            <div class="flex flex-col sm:flex-row gap-2 sm:h-48">
              <!-- Parent -->
              <router-link :to="`/oeuvre/${thread.id}`"
                class="w-full sm:w-3/4 h-48 sm:h-full bg-gray-100 overflow-hidden">
                <img v-if="thread.type === 'image'" :src="thread.url" class="w-full h-full object-cover" />
              </router-link>

              <!-- Enfants -->
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
                <span>
                  {{ new Date(thread.created_at).toLocaleDateString("fr-FR") }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <p v-else class="text-gray-600 text-sm italic">
          Aucune collaboration trouvée.
        </p>
      </div>

    </div>
  </div>
</template>
