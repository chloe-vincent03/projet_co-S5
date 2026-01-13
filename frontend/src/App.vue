<script setup>
import { useUserStore } from "./stores/user";
import HeaderPage from "./components/HeaderPage.vue";
import FooterPage from "./components/FooterPage.vue";

const store = useUserStore();
store.fetchUser(); // récupère l'utilisateur au chargement

</script>


<template>
  <!-- Header -->
  <HeaderPage />

  <!-- Loader Global -->
  

  <!-- Contenu Principal -->
  <main class="pt-24 relative">
    
    <Suspense>
      <!-- Composant dynamique avec fallback -->
      <template #default>
        <RouterView v-slot="{ Component }">
          <component :is="Component" :key="$route.path" />
        </RouterView>
      </template>
      
      <!-- Fallback Loader -->
      <template #fallback>
        <p>Chargement...</p>
      </template>
    </Suspense>
    
  </main>
  <!-- Footer -->
  <FooterPage />
</template>
