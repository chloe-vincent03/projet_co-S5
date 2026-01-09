<script setup>
import { ref } from "vue";
import { useUserStore } from "@/stores/user";
import api from "@/api/axios";
import MediaCard from "@/components/MediaCard.vue";
import { watch } from "vue";

const store = useUserStore();
const likedWorks = ref([]);
const loading = ref(true);
const error = ref("");

watch(
    () => store.user?.user_id,
    async (id) => {
        if (!id) return;

        const res = await api.get(`/media/liked/${id}`);
        likedWorks.value = res.data;
        loading.value = false;
    },
    { immediate: true }
);

</script>

<template>
    <div class="px-4 lg:pt-4 max-w-6xl mx-auto ">
        <h1 class="text-4xl mb-6 font-[PlumePixel] text-blue-plumepixel">Mes coups de cœur</h1>

        <p v-if="loading">Chargement…</p>
        <p v-else-if="error">{{ error }}</p>

        <p v-else-if="likedWorks.length === 0" class="italic text-gray-500">
            Vous n’avez encore liké aucune œuvre.
        </p>

        <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <MediaCard v-for="item in likedWorks" :key="item.id" :item="item" />
        </div>
    </div>
</template>
