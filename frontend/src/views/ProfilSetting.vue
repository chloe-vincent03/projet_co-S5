<script setup>
import { computed, ref, watchEffect } from "vue";
import { useUserStore } from "../stores/user";
import { useRouter } from "vue-router";
import MyButton from "@/components/MyButton.vue";
import api from "@/api/axios";
import IconOeil from "@/components/icons/IconOeil.vue";
import { useHead } from "@vueuse/head";

useHead({
  title: "Paramètres",
});

const store = useUserStore();
const router = useRouter();

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

const user = computed(() => store.user);
const message = ref("");

const emit = defineEmits(["click"]);
const props = defineProps({
  url: { type: String, default: null },
  variant: { type: String, default: "default" },
  size: { type: String, default: "medium" },
  font: { type: String, default: "pixel" },
  icon: { type: String, default: null },
  target: { type: String, default: "_self" },
});

// formulaire rempli avec les infos utilisateurs
const form = ref({
  username: "",
  email: "",
  bio: "",
  first_name: "",
  last_name: "",
  is_private: 0,
});

const originalData = ref({});
const fileInput = ref(null);
const selectedFile = ref(null);
const previewUrl = ref(null);

// Initialiser le formulaire quand les données utilisateur sont chargées
watchEffect(() => {
  if (user.value) {
    form.value = {
      username: user.value.username || "",
      email: user.value.email || "",
      bio: user.value.bio || "",
      first_name: user.value.first_name || "",
      last_name: user.value.last_name || "",
      is_private: user.value.is_private === 1,
    };
    originalData.value = { ...user.value };
  }
});


function triggerFileInput() {
  fileInput.value.click();
}

function handleFileChange(event) {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
    previewUrl.value = URL.createObjectURL(file);
  }
}

function resetForm() {
  // remet toutes les données comme elles étaient
  form.value = { ...originalData.value };
  selectedFile.value = null;
  previewUrl.value = null;
  // retourne au profil
  router.push("/profil");
}

const isLoading = ref(false);

async function saveChanges() {
  if (isLoading.value) return;
  isLoading.value = true;
  message.value = "";

  try {
    const formData = new FormData();
    formData.append('username', form.value.username);
    formData.append('email', form.value.email);
    formData.append('bio', form.value.bio || "");
    formData.append('first_name', form.value.first_name || "");
    formData.append('last_name', form.value.last_name || "");

    console.log("🔐 Saving is_private:", form.value.is_private, "Type:", typeof form.value.is_private);
    formData.append('is_private', form.value.is_private ? 1 : 0);

    if (selectedFile.value) {
      formData.append('avatar', selectedFile.value);
    }

    const res = await api.put(
      "http://localhost:3000/api/auth/update-profile",
      formData,
      {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" }
      }
    );

    router.push("/profil");

    // mettre à jour le store
    await store.fetchUser();
  } catch (err) {
    message.value =
      err.response?.data?.message || "Erreur lors de la mise à jour.";
  } finally {
    isLoading.value = false;
  }
}

function backToProfile() {
  router.push("/profil");
}
</script>



<template>
  <div class="w-full min-h-screen bg-white pt-10 lg:pt-20">
    <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10 px-6">
      <!-- ---------------------- -->
      <!--        COLONNE GAUCHE        -->
      <!-- ---------------------- -->
      <div class="lg:col-span-2">
        <h1 class="text-3xl font-[PlumePixel] mb-10 text-blue-plumepixel">Votre compte</h1>

        <!-- Image de profil -->
        <div>
          <h2 class="font-[PlumePixel] text-lg mb-3 text-blue-plumepixel">Image de profil</h2>

          <div class="flex items-center gap-4">
            <!-- image principale (Preview) -->
            <div 
              class="w-32 h-32 bg-gray-300 border border-blue-plumepixel relative cursor-pointer overflow-hidden group"
              @click="triggerFileInput"
            >
                <img v-if="previewUrl || user.avatar" :src="previewUrl || user.avatar" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs text-center">
                    Modifier
                </div>
            </div>
            <input type="file" ref="fileInput" class="hidden" @change="handleFileChange" accept="image/*">

            <!-- miniatures -->
            <div class="w-10 h-10 bg-gray-300 border border-blue-plumepixel overflow-hidden">
                <img v-if="previewUrl || user.avatar" :src="previewUrl || user.avatar" class="w-full h-full object-cover">
            </div>
            <div class="w-6 h-6 bg-gray-300 border border-blue-plumepixel overflow-hidden">
                <img v-if="previewUrl || user.avatar" :src="previewUrl || user.avatar" class="w-full h-full object-cover">
            </div>
          </div>
        </div>

        <!-- Informations personnelles -->
        <div class="mt-10">
          <h2 class="text-lg mb-3 font-[PlumePixel] text-blue-plumepixel">Informations personnelles</h2>

          <!-- First Name -->
          <label class="text-sm block mb-1">Prénom</label>
          <input
            type="text"
            v-model="form.first_name"
            class="w-full border border-blue-plumepixel h-9 px-2 mb-5"
          />

          <!-- Last Name -->
          <label class="text-sm block mb-1">Nom de famille</label>
          <input
            type="text"
            v-model="form.last_name"
            class="w-full border border-blue-plumepixel h-9 px-2 mb-5"
          />

          <!-- Username -->
          <label class="text-sm block mb-1">Nom d'utilisateur</label>
          <input
            type="text"
            v-model="form.username"
            class="w-full border border-blue-plumepixel h-9 px-2 mb-5"
          />

          <!-- Email -->
          <label class="text-sm block mb-1">Adresse mail</label>
          <input
            type="email"
            v-model="form.email"
            class="w-full border border-blue-plumepixel h-9 px-2 mb-5"
          />

          <!-- Bio -->
          <label class="text-sm block mb-1">Biographie</label>
          <textarea
            v-model="form.bio"
            class="w-full border border-blue-plumepixel h-32 p-2 resize-none mb-5"
          ></textarea>
        </div>

        <!-- Privacy Toggle -->
        <div class="border-t pt-6 mt-6">
          <h3 class="font-bold text-gray-800 mb-4">Confidentialité du compte</h3>
          <div class="flex items-center justify-between p-4 border border-blue-plumepixel ">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <IconOeil />
                <label class="font-medium text-blue-plumepixel">
                  {{ form.is_private ? 'Compte Privé' : 'Compte Public' }}
                </label>
              </div>
              <p class="text-sm text-gray-500 mt-1">
                {{ form.is_private ? 'Rend toutes vos œuvres automatiquement privées' : 'Vos œuvres sont visibles publiquement' }}
              </p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="form.is_private" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div class="flex flex-col items-end gap-3">
        <MyButton
          @click="resetForm"
          icon="annuler"
          :style="{
            border: '2px solid var(--color-blue-plumepixel)',
            color: 'var(--color-blue-plumepixel)',
          }"
          variant="transparent"
          >Annuler</MyButton
        >
        <!-- Bouton sauvegarder -->
        <!-- Bouton sauvegarder -->
        <MyButton
          @click="saveChanges"
          icon="valider"
          :style="{ backgroundColor: 'var(--color-blue-plumepixel)' }"
          :disabled="isLoading"
          >
          <div v-if="isLoading" class="flex items-center gap-2">
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Sauvegarde...</span>
          </div>
          <span v-else>Sauvegarder</span>
        </MyButton>
      </div>
      <div class="flex flex-col gap-4">
        <MyButton
          @click="logout"
          icon="logout"
          size="small"
          :style="{ backgroundColor: 'var(--color-blue-plumepixel)' }"
        >
          se deconnecter
        </MyButton>

        <MyButton @click="deleteAcc" icon="delete" variant="rouge" size="small">
          supprimer le compte
        </MyButton>
      </div>

      <p v-if="message" class="message">{{ message }}</p>
    </div>
  </div>
</template>

