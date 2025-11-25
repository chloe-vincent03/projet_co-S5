<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="p-8 bg-white rounded-xl shadow-md w-full max-w-sm">
      
      <h1 class="text-2xl font-bold mb-6 text-center">Login</h1>

      <form @submit.prevent="loginUser">

        <div class="mb-4">
          <label class="block font-medium mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            class="w-full p-2 border rounded-lg"
            required
          />
        </div>

        <div class="mb-4">
          <label class="block font-medium mb-1">Mot de passe</label>
          <input
            v-model="password"
            type="password"
            class="w-full p-2 border rounded-lg"
            required
          />
        </div>

        <!-- ERROR MESSAGE -->
        <p v-if="errorMessage" class="text-red-600 mb-3 text-center">
          {{ errorMessage }}
        </p>

        <button 
          type="submit"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold"
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
