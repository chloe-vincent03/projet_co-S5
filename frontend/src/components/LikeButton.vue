<script setup>
import { useUserStore } from "@/stores/user";
import api from "@/api/axios";
import { ref, watch, computed } from "vue";
import IconLike from "@/components/icons/IconLike.vue";

const userStore = useUserStore();

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

const isLiked = ref(props.item.is_liked);
const message = ref("");

const toggleLike = async () => {
  try {
    if (isLiked.value) {
      await api.delete(`/media/${props.item.id}/like`);
      props.item.likes_count--;
      props.item.is_liked = false;
      isLiked.value = false;
    } else {
      await api.post(`/media/${props.item.id}/like`);
      props.item.likes_count++;
      props.item.is_liked = true;
      isLiked.value = true;
    }
  } catch (err) {
    // ✅ CAS NORMAL : like sur sa propre œuvre
    if (err.response?.status === 403) {
      message.value = "Vous ne pouvez pas liker votre propre œuvre";
      setTimeout(() => (message.value = ""), 2500);
      return;
    }

    // ❌ vrai bug uniquement
    console.error("Erreur toggleLike:", err);
    message.value = "Une erreur est survenue";
    setTimeout(() => (message.value = ""), 2500);
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
  <div class="flex flex-col items-start gap-1">
    <button @click.stop="toggleLike" class="flex items-center gap-2 transition-all duration-200 cursor-pointer" :class="isLiked
      ? 'bg-red-100 text-red-500'
      : 'bg-transparent text-blue-plumepixel'">
      <IconLike class="w-6 h-6" />
      <span class="text-sm">{{ props.item.likes_count }}</span>
    </button>

    <span v-if="message" class="text-xs text-red-500 italic">
      {{ message }}
    </span>
  </div>
</template>
