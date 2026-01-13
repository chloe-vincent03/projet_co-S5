<template>
  <div class="flex items-center justify-center px-4 py-10 lg:py-4 lg:pt-10">

    <div class="bg-white shadow-lg w-full 
      max-w-md p-6 lg:p-10 
      border border-blue-plumepixel">

   
      <h1 class="text-4xl text-blue-plumepixel mb-8 font-[PlumePixel] text-center lg:text-left">
        Connectez-vous !
      </h1>

      <form @submit.prevent="loginUser" class="space-y-5">

        <div>
          <label class="block text-sm font-medium text-black mb-1">Adresse mail</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-2 border border-gray-300 
              focus:ring-0 focus:ring-blue-plumepixel focus:border-blue-plumepixel outline-none"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-black mb-1">Mot de passe</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full px-4 py-2 border border-gray-300 
              focus:ring-0 focus:ring-blue-plumepixel focus:border-blue-plumepixel outline-none"
          />
        </div>

        <p v-if="errorMessage" class="text-red-600 text-sm">{{ errorMessage }}</p>

        <MyButton
          type="submit"
        :style="{ backgroundColor: 'var(--color-blue-plumepixel)' }"
     
        >
          Se connecter
        </MyButton>

      </form>

      <p class="text-center text-sm text-gray-600 mt-6">
        Pas encore de compte ?
        <RouterLink to="/register" class="text-blue-plumepixel font-medium hover:underline">
          Créer un compte
        </RouterLink>
      </p>

    </div>
  </div>
</template>



<script setup>
import { ref } from "vue";
import { useUserStore } from "../stores/user"
import { useRouter } from "vue-router";
import MyButton from "@/components/MyButton.vue";
import api from "@/api/axios";
import { useHead } from "@vueuse/head";

useHead({
  title: "Connexion",
});

const router = useRouter();
const store = useUserStore()


const email = ref("");
const password = ref("");
const errorMessage = ref("");

async function loginUser() {
  try {
    const res = await api.post("http://localhost:3000/api/auth/login", {
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
