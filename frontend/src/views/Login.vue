<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h2 class="text-2xl font-bold mb-6 text-center">Login</h2>

      <form @submit.prevent="loginUser">
        <div class="mb-4">
          <label class="block mb-1 font-semibold">Email</label>
          <input 
            type="email" 
            v-model="email"
            class="w-full px-3 py-2 border rounded-md"
            placeholder="exemple@mail.com"
            required
          />
        </div>

        <div class="mb-4">
          <label class="block mb-1 font-semibold">Mot de passe</label>
          <input 
            type="password" 
            v-model="password"
            class="w-full px-3 py-2 border rounded-md"
            placeholder="••••••••"
            required
          />
        </div>

        <p v-if="error" class="text-red-600 mb-3 text-sm">{{ error }}</p>

        <button 
          type="submit"
          class="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Se connecter
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import axios from "axios"
import { ref } from "vue"
import { useRouter } from "vue-router"

const email = ref("")
const password = ref("")
const error = ref("")

const router = useRouter()

const loginUser = async () => {
  error.value = ""

  try {
    const response = await axios.post("http://localhost:3000/api/auth/login", {
      email: email.value,
      password: password.value
    }, { withCredentials: true })

    console.log("Réponse login:", response.data)

    // Redirection après login
    router.push("/")
  } catch (err) {
    console.error(err)
    error.value = err.response?.data?.message || "Erreur lors de la connexion"
  }
}
</script>
