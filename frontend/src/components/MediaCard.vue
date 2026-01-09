<script setup>
import { RouterLink } from "vue-router";
import LikeButton from "./LikeButton.vue";

defineProps({
    item: {
        type: Object,
        required: true,
    },
});
</script>

<template>
    <div v-if="item && item.id" class="media-card border border-blue-plumepixel p-2">
        <!-- lien vers l'œuvre -->
        <RouterLink :to="'/oeuvre/' + item.id" class="block">
            <img v-if="item.type === 'image'" :src="item.url" :alt="item.title"
                class="w-full h-40 object-cover rounded" />

            <div v-else-if="item.type === 'video'" class="text-center">
                🎬 {{ item.title }}
            </div>

            <div v-else-if="item.type === 'audio'" class="text-center">
                🎵 {{ item.title }}
            </div>

            <div v-else-if="item.type === 'text'" class="text-sm whitespace-pre-line">
                {{
                    ((item.content || "").slice(0, 150)) +
                    ((item.content || "").length > 150 ? "…" : "")
                }}
            </div>
        </RouterLink>

        <!-- bouton like -->
        <LikeButton :item="item" class="mt-2" />
    </div>
</template>
