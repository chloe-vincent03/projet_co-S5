<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

const users = ref([]);
const router = useRouter();

onMounted(async () => {
  const res = await axios.get("/auth/users"); // liste des users
  users.value = res.data;
});

const openChat = (userId) => {
  router.push(`/messagerie/${userId}`);
};
</script>

<template>
  <div>
    <h1>Messagerie</h1>

    <ul>
      <li v-for="u in users" :key="u.user_id">
        {{ u.username }}
        <button @click="openChat(u.user_id)">
          Message
        </button>
      </li>
    </ul>
  </div>
</template>
