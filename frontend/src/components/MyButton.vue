<script setup>
import { RouterLink } from "vue-router";
import IconConnexion from "./icons/IconConnexion.vue";
import IconCroix from "./icons/IconCroix.vue";
import IconParcourir from "./icons/IconParcourir.vue";
import IconPublier from "./icons/IconPublier.vue";
import IconReglage from "./icons/IconReglage.vue";
import IconSearch from "./icons/IconSearch.vue";
import IconDelete from "./icons/IconDelete.vue";
import IconVoir from "./icons/IconVoir.vue";
import IconValider from "./icons/IconValider.vue";
import IconLogout from "./icons/IconLogout.vue";
import IconPlume from "./icons/IconPlume.vue";

const props = defineProps({
  url: { type: String, default: null },
  to: { type: String, default: null },
  variant: { type: String, default: "default" },
  size: { type: String, default: "medium" },
  font: { type: String, default: "pixel" },
  icon: { type: String, default: null },
  target: { type: String, default: "_self" },
});

const emit = defineEmits(["click"]);

const variants = {
  default: "text-white",
  rouge: "bg-red-500 text-white",
  transparent: "bg-transparent border ",
  jaune: "bg-yellow-500 text-white",
};

const sizes = {
  small: "px-2 py-1 text-xs",
  medium: "px-4 py-2 text-sm",
  large: "px-6 py-3 text-base",
};

const fonts = {
  pixel: "font-[PlumePixel]",
  inter: "font-inter",
  serif: "font-serif",
  mono: "font-mono",
};

const icons = {
  setting: IconReglage,
  annuler: IconCroix,
  parcourir: IconParcourir,
  publier: IconPublier,
  search: IconSearch,
  connexion: IconConnexion,
  delete: IconDelete,
  voir: IconVoir,
  valider: IconValider,
  logout: IconLogout,
  plume: IconPlume
};

function handleClick(e) {
  emit("click", e);
}
</script>

<template>
  <a
    v-if="url && url.startsWith('http')"
    :href="url"
    :target="target"
    :class="[
      variants[variant],
      sizes[size],
      fonts[font],
      'inline-flex items-center justify-center cursor-pointer w-fit',
    ]"
    @click="handleClick"
  >
    <span class="flex items-center gap-2">
      <component v-if="icon" :is="icons[icon]" class="w-5 h-5" />
      <slot />
    </span>
  </a>

  <RouterLink
    v-else-if="to"
    :to="to"
    :class="[
      variants[variant],
      sizes[size],
      fonts[font],
      icons[icon],

      'inline-flex items-center justify-center cursor-pointer w-fit',
    ]"
    @click="handleClick"
  >
    <span class="flex items-center gap-2">
      <component v-if="icon" :is="icons[icon]" class="w-5 h-5" />
      <slot />
    </span>
  </RouterLink>
  <button
    v-else
    :class="[
      variants[variant],
      sizes[size],
      fonts[font],

      'inline-flex items-center justify-center cursor-pointer w-fit',
    ]"
    @click="handleClick"
  >
    <span class="flex items-center gap-2">
      <component v-if="icon" :is="icons[icon]" class="w-5 h-5" />
      <slot />
    </span>
  </button>
</template>
