<script setup>
import { ref } from "vue";
import { useUserStore } from "../stores/user";
import { useRouter } from "vue-router";
import MyButton from "@/components/MyButton.vue";
import { useHead } from "@vueuse/head";

const store = useUserStore();
const router = useRouter();

useHead({
  title: "Inscription",
});

const username = ref("");
const email = ref("");
const password = ref("");
const first_name = ref("");
const last_name = ref("");
const bio = ref("");
const isPrivate = ref(false);
const errorMessage = ref("");
const acceptLegal = ref(false);


async function registerUser() {
  if (!acceptLegal.value) {
    errorMessage.value =
      "Vous devez accepter les mentions légales et les conditions générales d’utilisation.";
    return;
  }

  const res = await store.register({
    username: username.value,
    email: email.value,
    password: password.value,
    first_name: first_name.value,
    last_name: last_name.value,
    bio: bio.value,
    is_private: isPrivate.value,
    accept_legal: acceptLegal.value, // prêt pour le back
  });

  if (res.success) {
    router.push("/profil");
  } else {
    errorMessage.value = res.message;
  }
}

</script>

<template>
  <div class="flex items-center justify-center px-8 py-10 lg:py-4 lg:pt-10">

    <div class="bg-white shadow-lg w-full 
      max-w-2xl p-6 lg:p-10 
      border border-blue-plumepixel">

      <h1 class="text-4xl text-blue-plumepixel mb-8 font-[PlumePixel]">
        Inscrivez-vous !
      </h1>

      <form @submit.prevent="registerUser" class="space-y-6">

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div class="space-y-5">
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input
                v-model="first_name"
                type="text"
                required
                class="w-full px-4 py-2 border border-gray-300
                  focus:ring-0 focus:ring-blue-plumepixel focus:border-blue-plumepixel outline-none"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Adresse mail</label>
              <input
                v-model="email"
                type="email"
                required
                class="w-full px-4 py-2 border border-gray-300
                  focus:ring-0 focus:ring-blue-plumepixel focus:border-blue-plumepixel outline-none"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <input
                v-model="password"
                type="password"
                required
                class="w-full px-4 py-2 border border-gray-300
                  focus:ring-0 focus:ring-blue-plumepixel focus:border-blue-plumepixel outline-none"
              />
            </div>

          </div>

          <div class="space-y-5">

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                v-model="last_name"
                type="text"
                required
                class="w-full px-4 py-2 border border-gray-300
                  focus:ring-0 focus:ring-blue-plumepixel focus:border-blue-plumepixel outline-none"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nom d'utilisateur</label>
              <input
                v-model="username"
                type="text"
                required
                class="w-full px-4 py-2 border border-gray-300
                  focus:ring-0 focus:ring-blue-plumepixel focus:border-blue-plumepixel outline-none"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                v-model="bio"
                rows="2"
                class="w-full px-4 py-2 border border-gray-300
                  focus:ring-0 focus:ring-blue-plumepixel focus:border-blue-plumepixel outline-none resize-none"
              ></textarea>
            </div>

          </div>

        </div>

        <!-- Privacy Toggle -->
        <div class="border-t pt-6 mt-6">
          <h3 class="font-bold text-blue-plumepixel mb-4">Confidentialité du compte</h3>
          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div class="flex-1">
              <label class="font-medium text-gray-700">Compte Privé</label>
              <p class="text-sm text-gray-500 mt-1">
                Toutes vos œuvres seront automatiquement privées
              </p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="isPrivate" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-plumepixel"></div>
            </label>
          </div>
        </div>
        <!-- Acceptation légale -->
        <div class="border-t pt-6 mt-6">
          <label class="flex items-start gap-3 text-sm text-gray-700">
            <input type="checkbox" v-model="acceptLegal" class="mt-1 h-4 w-4 rounded border-gray-300
        text-blue-plumepixel focus:ring-blue-plumepixel" required />

            <span>
              J’ai lu et j’accepte les
              <RouterLink to="/mentions-legales" target="_blank"
                class="font-medium underline hover:text-blue-plumepixel">
                mentions légales
              </RouterLink>
              ainsi que les
              <RouterLink to="/cgu" target="_blank" class="font-medium underline hover:text-blue-plumepixel">
                conditions générales d’utilisation
              </RouterLink>.
            </span>
          </label>
        </div>

        <p v-if="errorMessage" class="text-red-600 text-sm">{{ errorMessage }}</p>

        <MyButton
          type="submit"
        :style="{ backgroundColor: 'var(--color-blue-plumepixel)' }"
         
        >
          S'inscrire
        </MyButton>

      </form>

      <p class="text-center text-sm text-gray-600 mt-6">
        Vous avez déjà un compte ?
        <RouterLink to="/login" class="text-blue-plumepixel font-medium hover:underline">
          Se connecter
        </RouterLink>
      </p>

    </div>
  </div>
</template>

