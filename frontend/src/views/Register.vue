<template>
  <div class="">
    <div class="">

      <h1 class="">Créer un compte</h1>

      <form @submit.prevent="registerUser" class="">

        <input v-model="username" type="text" placeholder="Username"
               class="" required />

        <input v-model="email" type="email" placeholder="Email"
               class="" required />

        <input v-model="password" type="password" placeholder="Password"
               class="" required />
                <textarea 
        v-model="bio"
        placeholder="Votre description / bio"
        rows="4"
        class=""
      ></textarea>

        <button class="">
          S'inscrire
        </button>

      </form>

      <p v-if="errorMessage" class="">
        {{ errorMessage }}
      </p>

    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useUserStore } from "../stores/user"; // IMPORTANT !
import { useRouter } from "vue-router";

const store = useUserStore();  // IMPORTANT !
const router = useRouter();

const username = ref("");
const email = ref("");
const password = ref("");
const bio = ref('');
const errorMessage = ref("");

async function registerUser() {
  const res = await store.register({
    username: username.value,
    email: email.value,
    password: password.value,
    bio: bio.value,
  });

  if (res.success) {
    router.push("/profil");  // user connecté automatiquement
  } else {
    errorMessage.value = res.message;
  }
}
</script>
