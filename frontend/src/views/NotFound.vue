<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
    <h1 class="text-9xl font-[PlumePixel] text-blue-plumepixel opacity-20 select-none">404</h1>
    
    <div class="-mt-12 relative z-10">
      <h2 class="text-3xl font-[PlumePixel] text-blue-plumepixel mb-4">
        Oups ! Cette page n'existe pas...
      </h2>
      
      <p class="text-gray-600 mb-8 max-w-md mx-auto">
        Il semblerait que vous ayez atteint une page blanche. 
        L'inspiration est peut-être ailleurs ?
      </p>

      <MyButton 
        to="/" 
        icon="plume" 
        :style="{ backgroundColor: 'var(--color-blue-plumepixel)' }"
      >
        Retour à l'accueil
      </MyButton>
    </div>
  </div>
</template>

<script setup>
import MyButton from "@/components/MyButton.vue";
</script>
