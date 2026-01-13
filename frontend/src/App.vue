<script setup>
import { useUserStore } from "./stores/user";
import HeaderPage from "./components/HeaderPage.vue";
import FooterPage from "./components/FooterPage.vue";
import { useHead } from "@vueuse/head";

// Configuration SEO Globale
useHead({
  titleTemplate: "%s | Plume & Pixel", // %s sera remplacé par le titre de la page spécifique
  title: "Accueil", // Titre par défaut si pas défini ailleurs
  meta: [
    {
      name: "description",
      content: "Plume & Pixel - La plateforme collaborative où l'écriture rencontre l'art numérique."
    }
  ]
});

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
