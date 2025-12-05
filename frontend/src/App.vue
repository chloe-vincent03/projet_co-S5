<script setup>
import { useUserStore } from "./stores/user";

const store = useUserStore();
store.fetchUser(); // récupère l'utilisateur au chargement
</script>


<template>
  

    <div>
    <router-view />
  </div>
</template>

<style scoped></style>
