<script setup>
import { useUserStore } from "../../stores/user";
import { useRouter } from "vue-router";
import { ref, computed } from "vue";
import MyButton from "@/components/MyButton.vue";
import api from "@/api/axios";

const store = useUserStore();
const router = useRouter();

const message = ref("");

// user réactif basé sur le store
// user réactif basé sur le store
const user = computed(() => store.user);

const allMedia = ref([]);
const threads = ref([]);
const galerie = computed(() => allMedia.value);

const activeTab = ref("galerie"); 



// Charger les données quand le user est prêt
import { watchEffect } from "vue";

watchEffect(async () => {
  if (user.value && user.value.user_id) {
    try {
      const resMedia = await api.get(`/media/user/${user.value.user_id}`);
      allMedia.value = resMedia.data;

      const resThreads = await api.get(`/media/user/${user.value.user_id}/threads`);
      threads.value = resThreads.data;
    } catch (e) {
      console.error(e);
    }
  }
});

async function logout() {
  await store.logout();
  router.push("/login");
}

async function deleteAcc() {
  const ok = confirm(
    "Voulez-vous vraiment supprimer votre compte ? Cette action est irréversible."
  );
  if (!ok) return;

  const res = await store.deleteAccount();

  if (res.success) {
    router.push("/register");
  } else {
    message.value = res.message || "Erreur lors de la suppression.";
  }
}
function goToSettings() {
  router.push("/profil/settings");
}
</script>

<template>
  <div class="px-4 pt-24 lg:pt-32 lg:py-20">
    <div class="max-w-5xl mx-auto">
      <div class="flex flex-col lg:flex-row items-start lg:items-center gap-6">
        <div
          class="w-32 h-32 bg-gray-300 border border-blue-plumepixel rounded-lg overflow-hidden"
        >
          <img 
            v-if="user?.avatar" 
            :src="user.avatar" 
            alt="Avatar" 
            class="w-full h-full object-cover"
          >
        </div>

        <div>
          <h1 class="text-3xl font-[PlumePixel] text-blue-plumepixel">
            {{ user?.first_name }} {{ user?.last_name }}
          </h1>

          <p class="text-gray-600 text-sm">@{{ user?.username }}</p>

          <p class="text-xs text-gray-500 mt-1">
            Membre depuis le
            {{ new Date(user?.created_at).toLocaleDateString("fr-FR") }}
          </p>

          <p class="mt-1 max-w-xl text-gray-700 leading-relaxed">
            {{ user?.bio || "Aucune bio renseignée." }}
          </p>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-4 mt-8">
        <MyButton
          @click="goToSettings"
          icon="setting"
        :style="{ backgroundColor: 'var(--color-blue-plumepixel)' }"
        >
          Paramètres
        </MyButton>

        <MyButton
          @click="logout"
 :style="{
          border: '2px solid var(--color-blue-plumepixel)',
          color: 'var(--color-blue-plumepixel)',
        }"        >
          Se déconnecter
        </MyButton>
      </div>

      <p
        v-if="user?.is_admin === 1"
        class="mt-6 px-3 py-1 bg-yellow-300 text-black rounded text-sm w-fit"
      >
        Administrateur
      </p>

      <!-- MESSAGE -->
      <p v-if="message" class="mt-4 text-red-600">{{ message }}</p>

      <!-- TABS -->
      <div class="flex gap-6 mt-16 text-blue-plumepixel font-[PlumePixel] text-lg border-b border-gray-200 pb-2">
        <button
          @click="activeTab = 'galerie'"
          :class="activeTab === 'galerie' ? 'underline' : 'opacity-50 hover:opacity-100'"
        >
          Ma Galerie
        </button>

        <button
          @click="activeTab = 'collab'"
          :class="activeTab === 'collab' ? 'underline' : 'opacity-50 hover:opacity-100'"
        >
          Mes Collaborations
        </button>
      </div>

       <!-- CONTENU DES ONGLETS -->
      <div v-if="activeTab === 'galerie'" class="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
        
        <!-- Empty State Galerie -->
        <div v-if="galerie.length === 0" class="col-span-full text-gray-500 text-sm italic">
            Vous n'avez pas encore publié d'œuvres.
        </div>
      </div>

      <div v-if="activeTab === 'collab'" class="mt-8">
        <div v-if="threads.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <!-- THREAD CARD -->
          <div v-for="thread in threads" :key="thread.id" class="border border-blue-plumepixel p-2 flex flex-col gap-2 bg-white shadow-sm hover:shadow-md transition">
            
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

                <!-- DROITE : Miniatures (Enfants) -->
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
                    <!-- Empty slots if needed -->
                    <div v-if="thread.children.length === 0" class="h-full w-full bg-gray-50 border border-dashed border-blue-200 flex items-center justify-center">
                        <span class="text-xs text-gray-300 text-center">Pas de réponse</span>
                    </div>
                </div>
            </div>

            <!-- INFOS -->
            <div class="mt-2 text-sm">
                <h2 class="font-['PlumePixel'] text-lg truncate">{{ thread.title }}</h2>
                <div class="flex justify-between text-gray-500 text-xs mt-1">
                    <span>{{ thread.username }} {{ thread.children_count > 0 ? '+' + thread.children_count : '' }}</span>
                    <span>{{ new Date(thread.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) }}</span>
                </div>
            </div>
          </div>
        </div>
        <p v-else class="text-gray-600 text-sm">Vous n'avez participé à aucune collaboration.</p>
      </div>
    </div>
  </div>
</template>
