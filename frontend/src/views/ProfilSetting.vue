<template>
  <div class="settings-container">
    <h1>Paramètres du Profil</h1>

    <div v-if="user" class="settings-card">
      <label>Nom d'utilisateur :</label>
      <input v-model="form.username" type="text" />

      <label>Email :</label>
      <input v-model="form.email" type="email" />

      <label>Bio :</label>
      <textarea v-model="form.bio" rows="4"></textarea>

      <label>Prénom :</label>
      <input v-model="form.first_name" type="text" />

      <label>Nom :</label>
      <input v-model="form.last_name" type="text" />

      <button @click="saveChanges" class="btn save">
        Enregistrer les modifications
      </button>
      <button @click="backToProfile" class="btn back">Retour au profil</button>
      <MyButton variant="rouge" icon="delete">Mon bouton</MyButton>
 <MyButton icon="valider" :style="{ backgroundColor: 'var(--color-blue-plumepixel)' }"
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
      <MyButton icon="parcourir" :style="{ backgroundColor: 'var(--color-blue-plumepixel)' }"
        >Mon bouton</MyButton
      >

      <p v-if="message" class="message">{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useUserStore } from "../stores/user";
import axios from "axios";
import { useRouter } from "vue-router";
import MyButton from "@/components/MyButton.vue";

const store = useUserStore();
const router = useRouter();

const user = computed(() => store.user);
const message = ref("");

// formulaire rempli avec les infos utilisateurs
const form = ref({
  username: user.value.username,
  email: user.value.email,
  bio: user.value.bio,
  first_name: user.value.first_name,
  last_name: user.value.last_name,
});

async function saveChanges() {
  try {
    const res = await axios.put(
      "http://localhost:3000/api/auth/update-profile",
      form.value,
      { withCredentials: true }
    );

    message.value = "Profil mis à jour ✔️";

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
