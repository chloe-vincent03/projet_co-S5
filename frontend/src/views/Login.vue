<template>
  <div class="">
    <div class="">
      
      <h1 class="">Login</h1>

      <form @submit.prevent="loginUser">

        <div class="">
          <label class="">Email</label>
          <input
            v-model="email"
            type="email"
            class=""
            required
          />
        </div>

        <div class="mb-4">
          <label class="">Mot de passe</label>
          <input
            v-model="password"
            type="password"
            class=""
            required
          />
        </div>

        <!-- ERROR MESSAGE -->
        <p v-if="errorMessage" class="">
          {{ errorMessage }}
        </p>

        <button 
          type="submit"
          class=""
        >
          Se connecter
        </button>

      </form>
    </div>
  </div>
</template>


<script setup>
import { ref } from "vue";
import { useUserStore } from "../stores/user"

import axios from "axios";
import { useRouter } from "vue-router";

const router = useRouter();
const store = useUserStore()


const email = ref("");
const password = ref("");
const errorMessage = ref("");

async function loginUser() {
  try {
    const res = await axios.post("http://localhost:3000/api/auth/login", {
      email: email.value,
      password: password.value,
    }, { withCredentials: true });

    console.log("LOGIN OK :", res.data);

    // redirect to home page
    router.push("/");

  } catch (err) {
    console.log(err);
    errorMessage.value = err.response?.data?.message || "Erreur lors de la connexion.";
  }
}
</script>
