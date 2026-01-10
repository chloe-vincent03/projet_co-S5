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
            <img v-if="item.type === 'image'" :src="item.url" :alt="item.title" class="w-full h-auto object-cover" />

            <!-- VIDEO -->
           <!-- VIDEO -->
            <div v-else-if="item.type === 'video'" class="relative">
                <video :src="item.url" muted preload="metadata" class="w-full h-auto object-cover"></video>

                <!-- OVERLAY PLAY (sans rond) -->
                <div class="
    absolute inset-0
    flex items-center justify-center
  ">
                    <svg xmlns="http://www.w3.org/2000/svg" class="
      w-12 h-12
      sm:w-16 sm:h-16
      lg:w-20 lg:h-20
      text-blue-plumepixel
      opacity-90
      transition
      hover:scale-110
    " viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </div>

                <!-- TITRE -->
                <div class="p-3 text-xl lg:text-2x text-black font-[PlumePixel]">
                    {{ item.title }}
                </div>
            </div>

            <!-- AUDIO -->
            <div v-else-if="item.type === 'audio'" class="
          flex flex-col items-center justify-center
          text-center
          
          py-10 px-4
        ">
               <div class="mt-4 text-xl lg:text-2xl font-medium text-black font-[PlumePixel]">
                    {{ item.title }}
                </div>
      
        <IconMusic class="text-6xl leading-none" ></IconMusic>
                
            </div>

            <!-- TEXTE / POÈME -->
            <div v-else-if="item.type === 'text'" class="
          p-4
          text-sm
          whitespace-pre-line
          leading-relaxed
          bg-white
        ">
                {{ item.content || "" }}
            </div>

        </RouterLink>

        <!-- LIKE -->
        <div class="mt-2 ">
            <LikeButton :item="item" />
        </div>
    </div>
</template>

