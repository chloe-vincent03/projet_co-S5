<script setup>
import { RouterLink } from "vue-router";
import LikeButton from "./LikeButton.vue";
import IconMusic from "./icons/IconMusic.vue";

defineProps({
    item: {
        type: Object,
        required: true,
    },
});

const previewText = (text, limit = 200) => {
    if (!text) return "";

    const clean = text.replace(/\\n/g, "\n");

    return clean.length > limit
        ? clean.slice(0, limit) + "…"
        : clean;
};

</script>

<template>
    <div v-if="item && item.id" class="
      media-card
      relative
      border border-blue-plumepixel
      bg-white
      mb-4
      break-inside-avoid
      hover:shadow-lg
      transition
    ">
        <RouterLink :to="`/oeuvre/${item.id}`" class="block">

            <!-- IMAGE -->
             
            <img v-if="item.type === 'image'" :src="item.url" :alt="item.title" class="w-full h-auto object-cover"
            />
            
            

            <!-- VIDEO -->
            <div v-else-if="item.type === 'video'" class="relative">
                <video :src="item.url" muted preload="metadata" class="w-full h-auto object-cover" />

                <div class="absolute inset-0 flex items-center justify-center">
                    <svg class="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-blue-plumepixel opacity-90"
                        viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </div>

                <div class="p-3 text-xl font-[PlumePixel] text-black">
                    {{ item.title }}
                </div>
            </div>

            <!-- AUDIO -->
            <div v-else-if="item.type === 'audio'"
                class="flex flex-col items-center justify-center py-10 px-4 text-center">
                <IconMusic class="text-6xl text-blue-plumepixel" />
                <div class="mt-4 font-[PlumePixel]">
                    {{ item.title }}
                </div>
            </div>

            <!-- TEXTE / POÈME (APERÇU) -->
           <!-- TEXTE / POÈME -->
           <!-- TEXTE -->
           <div v-else-if="item.type === 'text'" class="p-4 text-sm leading-relaxed">
                <p v-if="typeof item.content === 'string' && item.content.trim().length" class="whitespace-pre-line">
                    {{ previewText(item.content, 200) }}
                </p>

                <p v-else class="italic text-gray-400">
                    Aperçu indisponible
                </p>
            </div>
        </RouterLink>

        <!-- LIKE -->
        <div class="mt-2">
            <LikeButton :item="item" />
        </div>
    </div>
</template>
