<script setup>
import { ref } from "vue";
import { useUserStore } from "@/stores/user";
import api from "@/api/axios";
import MediaCard from "@/components/MediaCard.vue";
import { watch } from "vue";
import { useHead } from "@vueuse/head";

useHead({
  title: "Mes Coups de Cœur",
});

const userStore = useUserStore();
const likedWorks = ref([]);
const loading = ref(true);
const error = ref("");

watch(
    () => userStore.user?.user_id,
    async (id) => {
        if (!id) return;

        const res = await api.get(`/media/liked/${id}`);

        likedWorks.value = res.data.map(item => ({
            ...item,
            is_liked: true   
        }));

        loading.value = false;
    },
    { immediate: true }
);


</script>

<template>
    <div class="px-4 lg:pt-6 max-w-6xl mx-auto ">

        <!-- EN-TÊTE -->
        <div class="mb-10">
            <h1 class="text-4xl mb-2 font-[PlumePixel] text-blue-plumepixel">
                Mes coups de cœur
            </h1>
            <p class="text-sm text-gray-500">
                Les œuvres que vous avez aimées et gardées près de vous
            </p>
        </div>

        <!-- ÉTATS -->
        <p v-if="loading" class="italic text-gray-400">
            Chargement de vos coups de cœur…
        </p>

        <p v-else-if="error" class="text-red-500">
            {{ error }}
        </p>

        <p v-else-if="likedWorks.length === 0"
            class="italic text-gray-500 border border-dashed p-6 text-center rounded">
            Vous n’avez encore liké aucune œuvre.<br />
            Explorez la galerie et laissez parler votre cœur 
        </p>

        <!-- GALERIE -->
        <div v-else class="columns-2 sm:columns-3 lg:columns-4 gap-4">
            <MediaCard v-for="item in likedWorks" :key="item.id" :item="item" class="mb-4" />
        </div>

    </div>
</template>

