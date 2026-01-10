<script setup>
import { useUserStore } from "@/stores/user";
import api from "@/api/axios";
import { ref, watch } from "vue";

const userStore = useUserStore();



const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

const isLiked = ref(props.item.is_liked);

const toggleLike = async () => {
  try {
    if (isLiked.value) {
      await api.delete(
        `http://localhost:3000/api/media/${props.item.id}/like`,
        { withCredentials: true }
      );
      props.item.likes_count--;
      props.item.is_liked = false;
      isLiked.value = false;
    } else {
      await api.post(
        `http://localhost:3000/api/media/${props.item.id}/like`,
        {},
        { withCredentials: true }
      );
      props.item.likes_count++;
      props.item.is_liked = true;
      isLiked.value = true;
    }
  } catch (err) {
    console.error("Erreur toggleLike:", err);
  }
};

watch(
  () => props.item.is_liked,
  (newVal) => {
    isLiked.value = newVal;
  },
  { immediate: true }
);

</script>

<template>
  <button
    @click.stop="toggleLike"
    class="flex items-center gap-2 select-none cursor-pointer"
  >
    <!-- ❤️ ton icon rouge -->
    <svg
      v-if="item.is_liked"
      xmlns="http://www.w3.org/2000/svg"
      class="w-6 h-6 text-red-500 fill-red-500"
      viewBox="0 0 24 24"
    >
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 
           5.42 4.42 3 7.5 3c1.74 0 3.41 1 4.5 2.09C13.09 4 
           14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 
           6.86-8.55 11.54L12 21.35z"
      />
    </svg>

    <!-- 🤍 ton icon blanc -->
    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      class="w-6 h-6 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M4.318 6.318a4.5 4.5 0 
           016.364 0L12 7.636l1.318-1.318a4.5 
           4.5 0 116.364 6.364L12 21l-7.682-7.682a4.5 
           4.5 0 010-6.364z"
      />
    </svg>

    <span class="text-sm"> {{ props.item.likes_count }}</span>
  </button>
</template>
