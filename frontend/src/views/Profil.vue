<script setup>
import { useUserStore } from "../stores/user";
import { useRouter } from "vue-router";
import { ref, computed } from "vue";

const store = useUserStore();
const router = useRouter();

const message = ref("");

// user réactif basé sur le store
const user = computed(() => store.user);

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
  <div class=" px-4 pt-24 lg:pt-32 lg:py-20">

    <div class="max-w-5xl mx-auto">

      <div class="flex flex-col lg:flex-row items-start lg:items-center gap-6">

        <div class="w-32 h-32 bg-gray-300 border border-blue-plumepixel rounded-lg"></div>

        <div>
          <h1 class="text-3xl font-[PlumePixel] text-blue-plumepixel">
            {{ user?.first_name }} {{ user?.last_name }}
          </h1>

          <p class="text-gray-600 text-sm">
            @{{ user?.username }}
          </p>

          <p class="text-xs text-gray-500 mt-1">
            Membre depuis le {{ new Date(user?.created_at).toLocaleDateString("fr-FR") }}
          </p>

          <p class="mt-1 max-w-xl text-gray-700 leading-relaxed">
            {{ user?.bio || "Aucune bio renseignée." }}
          </p>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-4 mt-8">
        
        <button 
          @click="goToSettings"
          class="px-6 py-2 bg-blue-plumepixel text-white rounded-lg shadow hover:bg-blue-700 transition">
          Paramètres
        </button>

        <button 
          @click="logout"
          class="px-6 py-2 bg-gray-800 text-white rounded-lg shadow hover:bg-black transition">
          Se déconnecter
        </button>

        <button 
          @click="deleteAcc"
          class="px-6 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition">
          Supprimer mon compte
        </button>

      </div>

      <p 
        v-if="user?.is_admin === 1"
        class="mt-6 px-3 py-1 bg-yellow-300 text-black rounded text-sm w-fit">
        Administrateur
      </p>

      <!-- MESSAGE -->
      <p v-if="message" class="mt-4 text-red-600">{{ message }}</p>
    </div>
  </div>
</template>


