<script setup>
import { ref, onMounted } from "vue";
import api from "@/api/axios";
import { RouterLink } from "vue-router";
import { useUserStore } from "@/stores/user";
import { useHead } from "@vueuse/head";

useHead({
  title: "Notifications",
});

const userStore = useUserStore();

const likes = ref([]);
const loading = ref(true);

onMounted(async () => {
    try {
        // 1️⃣ Charger les notifications
        const res = await api.get("/notification/likes");
        likes.value = res.data;

        // 2️⃣ Marquer comme lues
        await api.post("/notification/mark-read");

        // 3️⃣ Mettre à jour le badge IMMÉDIATEMENT (sans refresh)
        userStore.unreadNotifications = 0;
    } catch (err) {
        console.error("Erreur chargement notifications:", err);
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <div class="px-4 pt-24 pb-16 max-w-3xl mx-auto">
        <h1 class="text-3xl font-[PlumePixel] text-blue-plumepixel mb-8">
            Notifications
        </h1>

        <p v-if="loading" class="text-gray-400">Chargement…</p>

        <p v-else-if="likes.length === 0" class="text-gray-500 italic">
            Aucune notification pour le moment.
        </p>

        <ul v-else class="flex flex-col gap-4">
            <li v-for="n in likes" :key="n.like_id"
                class="flex items-center gap-4 p-4 border border-blue-plumepixel bg-white hover:shadow ">
                <!-- Avatar -->
                <img v-if="n.avatar" :src="n.avatar" class="w-10 h-10 rounded-full object-cover" />

                <!-- Texte -->
                <div class="flex-1 text-sm">
                    <strong class="text-blue-plumepixel">
                        {{ n.username }}
                    </strong>
                    a aimé votre œuvre
                    <RouterLink :to="`/oeuvre/${n.media_id}`" class="underline ml-1 text-blue-plumepixel">
                        {{ n.title }}
                    </RouterLink>
                </div>

                <!-- Date -->
                <span class="text-xs text-gray-400">
                    {{ new Date(n.created_at).toLocaleDateString("fr-FR") }}
                </span>
            </li>
        </ul>
    </div>
</template>
