<script setup>
defineProps({
  item: Object
});
</script>

<template>
  <router-link :to="'/oeuvre/' + item.id" class="media-card">
    <img v-if="item.type === 'image'" :src="item.url" :alt="item.title" />

    <div v-else-if="item.type === 'audio'">🎵 {{ item.title }}</div>

    <div v-else-if="item.type === 'video'">🎬 {{ item.title }}</div>

    <div v-else-if="item.type === 'text'">
      {{ item.content.slice(0,150) + '…' }}
    </div>
  </router-link>
</template>
