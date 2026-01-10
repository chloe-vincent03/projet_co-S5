<script setup>
import { useUserStore } from "@/stores/user";
import api from "@/api/axios";
import { ref, watch } from "vue";
import IconLike from "@/components/icons/IconLike.vue";


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
  <button @click.stop="toggleLike" class="
      flex items-center gap-2
      px-2 py-1 
      transition-all
      duration-200
      cursor-pointer
    " :class="item.is_liked
      ? 'bg-red-100 text-red-500'
      : 'bg-transparent text-blue-plumepixel'
      ">
    <IconLike class="w-6 h-6" />

    <span class="text-sm">
      {{ props.item.likes_count }}
    </span>
  </button>
</template>

