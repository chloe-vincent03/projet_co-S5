<script setup>
import { RouterLink } from "vue-router";
import axios from "axios";
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
  <div class="media-card">
    <!-- carte cliquable vers la page détail -->
    <RouterLink :to="'/oeuvre/' + item.id" class="block">
      <img v-if="item.type === 'image'" :src="item.url" :alt="item.title" />

      <div v-else-if="item.type === 'audio'">🎵 {{ item.title }}</div>
      <div v-else-if="item.type === 'video'">🎬 {{ item.title }}</div>
    <div
  v-else-if="item.type === 'text'"
  class="whitespace-pre-line"
>
  {{ item.content.replace(/\\n/g, '\n').slice(0, 150) + "…" }}
</div>

    </RouterLink>

    <!-- bouton like -->
         <LikeButton :item="item" class="mt-2" />

    <!-- <button
      type="button"
      @click.stop="toggleLike"
      class="flex items-center gap-1 mt-2"
    >
      <span v-if="item.is_liked">❤️</span>
      <span v-else>🤍</span>
      <span>{{ item.likes_count ?? 0 }}</span>
    </button> -->
  </div>
</template>
