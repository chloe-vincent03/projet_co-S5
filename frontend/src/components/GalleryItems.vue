<script setup>
import { RouterLink } from "vue-router";
import { useUserStore } from "@/stores/user";
import LikeButton from "./LikeButton.vue";



const userStore = useUserStore();


const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

// Fonction de like / unlike
// const toggleLike = async () => {
 

//   const media = props.item;

//   if (!userStore.isLoggedIn) {
//     alert("Tu dois être connecté pour liker une œuvre.");
//     return;
//   }

//   try {
//     // SI déjà liké → on UNLIKE (DELETE)
//     if (media.is_liked) {
//       await axios.delete(`/media/${media.id}/like`, {
//         withCredentials: true,
//       });

//       media.is_liked = false;
//       media.likes_count = (media.likes_count || 1) - 1;
//       if (media.likes_count < 0) media.likes_count = 0;
//     } else {
//       // SINON → on LIKE (POST)
//       await axios.post(
//         `/media/${media.id}/like`,
//         {},
//         { withCredentials: true }
//       );

//       media.is_liked = true;
//       media.likes_count = (media.likes_count || 0) + 1;
//     }
//   } catch (error) {
//     console.error("Erreur toggleLike:", error);
    

//     // Si on reçoit 409, ça veut dire que c'était déjà liké en base
//     // → on force l'état en "liké" côté front pour se resynchroniser
//     if (error.response && error.response.status === 409) {
//       media.is_liked = true;
//     }
//   }
// };
</script>

<template>
  <div class="relative border border-blue-plumepixel bg-white
           overflow-hidden hover:shadow-md transition">
    <!-- MEDIA -->
    <RouterLink :to="`/oeuvre/${item.id}`" class="block">
      <!-- IMAGE -->
      <img v-if="item.type === 'image'" :src="item.url" :alt="item.title" class="w-full aspect-square object-cover" />

      <!-- AUDIO -->
      <div v-else-if="item.type === 'audio'" class="w-full aspect-square flex flex-col
               items-center justify-center bg-pink-50 text-sm">
        🎵
        <span class="mt-2 font-medium text-center px-2">
          {{ item.title }}
        </span>
      </div>

      <!-- VIDEO -->
      <div v-else-if="item.type === 'video'" class="w-full aspect-square flex flex-col
               items-center justify-center bg-pink-50 text-sm">
        🎬
        <span class="mt-2 font-medium text-center px-2">
          {{ item.title }}
        </span>
      </div>

      <!-- TEXTE -->
      <div v-else-if="item.type === 'text'" class="w-full aspect-square p-4 text-sm
               whitespace-pre-line overflow-hidden
               bg-pink-50">
        {{ item.content.replace(/\\n/g, '\n').slice(0, 140) }}…
      </div>
    </RouterLink>

    <!-- LIKE -->
    <div class="absolute bottom-2 left-2">
      <LikeButton :item="item" />
    </div>

    <!-- BADGE -->
    <span class="absolute top-2 right-2 text-xs px-2 py-1
             border border-blue-plumepixel bg-white">
      Œuvre
    </span>
  </div>
</template>

