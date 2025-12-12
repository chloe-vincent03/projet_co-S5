<template>
  <div class="w-full min-h-screen bg-white pt-10 lg:pt-20">
    <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10 px-6">
      <!-- ---------------------- -->
      <!--        COLONNE GAUCHE        -->
      <!-- ---------------------- -->
      <div class="lg:col-span-2">
        <h1 class="text-3xl font-[PlumePixel] mb-10">Votre compte</h1>

        <!-- Image de profil -->
        <div>
          <h2 class="font-[PlumePixel] text-lg mb-3">Image de profil</h2>

          <div class="flex items-center gap-4">
            <!-- image principale -->
            <div class="w-32 h-32 bg-gray-300 border border-gray-800"></div>

            <!-- miniatures -->
            <div class="w-10 h-10 bg-gray-300 border border-gray-800"></div>
            <div class="w-6 h-6 bg-gray-300 border border-gray-800"></div>
          </div>
        </div>

        <!-- Informations personnelles -->
        <div class="mt-10">
          <h2 class="text-lg mb-3">Informations personnelles</h2>

          <!-- First Name -->
          <label class="text-sm block mb-1">Prénom</label>
          <input
            type="text"
            v-model="form.first_name"
            class="w-full border border-black h-9 px-2 mb-5"
          />

          <!-- Last Name -->
          <label class="text-sm block mb-1">Nom de famille</label>
          <input
            type="text"
            v-model="form.last_name"
            class="w-full border border-black h-9 px-2 mb-5"
          />

          <!-- Username -->
          <label class="text-sm block mb-1">Nom d'utilisateur</label>
          <input
            type="text"
            v-model="form.username"
            class="w-full border border-black h-9 px-2 mb-5"
          />

          <!-- Email -->
          <label class="text-sm block mb-1">Adresse mail</label>
          <input
            type="email"
            v-model="form.email"
            class="w-full border border-black h-9 px-2 mb-5"
          />

          <!-- Bio -->
          <label class="text-sm block mb-1">Biographie</label>
          <textarea
            v-model="form.bio"
            class="w-full border border-black h-32 p-2 resize-none mb-5"
          ></textarea>
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
        <MyButton
          @click="saveChanges"
          icon="valider"
          :style="{ backgroundColor: 'var(--color-blue-plumepixel)' }"
          >Sauvegarder</MyButton
        >
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

      <!-- <MyButton variant="rouge" icon="delete">Mon bouton</MyButton>
      <MyButton
        icon="valider"
        :style="{ backgroundColor: 'var(--color-blue-plumepixel)' }"
        >Mon bouton</MyButton
      >
      <MyButton variant="rouge" size="small" icon="search">Mon bouton</MyButton>
      <MyButton variant="rouge" size="small" icon="voir">Mon bouton</MyButton>
      <MyButton
        :style="{
          border: '2px solid var(--color-blue-plumepixel)',
          color: 'var(--color-blue-plumepixel)',
        }"
        variant="transparent"
      >
        Mon bouton
      </MyButton>
      <MyButton
        icon="parcourir"
        :style="{ backgroundColor: 'var(--color-blue-plumepixel)' }"
        >Mon bouton</MyButton
      > -->

      <p v-if="message" class="message">{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useUserStore } from "../stores/user";
import { useRouter } from "vue-router";
import MyButton from "@/components/MyButton.vue";
import api from "@/api/axios";

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
  username: user.value.username,
  email: user.value.email,
  bio: user.value.bio,
  first_name: user.value.first_name,
  last_name: user.value.last_name,
});

const originalData = ref({ ...user.value });

function resetForm() {
  // remet toutes les données comme elles étaient
  form.value = { ...originalData.value };

  // retourne au profil
  router.push("/profil");
}

async function saveChanges() {
  try {
    const res = await api.put(
      "http://localhost:3000/api/auth/update-profile",
      form.value,
      { withCredentials: true }
    );

    router.push("/profil");

    // mettre à jour le store
    await store.fetchUser();
  } catch (err) {
    message.value =
      err.response?.data?.message || "Erreur lors de la mise à jour.";
  }
}

function backToProfile() {
  router.push("/profil");
}
</script>
