<template>
  <div>
    <h1>Register</h1>

    <form @submit.prevent="registerUser">
      <input v-model="form.username" placeholder="Username" />
      <input v-model="form.email" placeholder="Email" />
      <input v-model="form.password" type="password" placeholder="Password" />
      <button type="submit">Register</button>
    </form>

    <p>{{ message }}</p>
  </div>
</template>

<script setup>
import api from "../api/axios.js";
import { ref } from "vue";

const form = ref({
  username: "",
  email: "",
  password: "",
});

const message = ref("");

async function registerUser() {
  try {
    const res = await api.post("/auth/register", form.value);
    message.value = "Compte créé ✔️";
  } catch (err) {
    message.value = err.response?.data?.message || "Erreur";
  }
}
</script>
