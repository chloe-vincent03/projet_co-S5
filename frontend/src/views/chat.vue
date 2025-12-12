<script setup>
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "@/stores/user";
import { useChatStore } from "@/stores/chat";

const route = useRoute();
const userStore = useUserStore();
const chat = useChatStore();

const text = ref("");
const receiverId = Number(route.params.userId);

// initialisation quand l'utilisateur est prêt
watch(
  () => userStore.user,
  async (user) => {
    if (user) {
      chat.init(user.user_id);
      await chat.loadHistory(receiverId);
    }
  },
  { immediate: true }
);

const send = () => {
  chat.sendMessage(userStore.user.user_id, text.value);
  text.value = "";
};
</script>

<template>
  <div class="chat">
    <h2>Discussion avec l’utilisateur {{ receiverId }}</h2>

    <div class="messages">
      <div v-for="(m, i) in chat.messages" :key="i">
        <b>{{ m.sender_id === userStore.user.user_id ? "Moi" : "Lui" }}</b>
        : {{ m.content }}
      </div>
    </div>

    <input v-model="text" @keyup.enter="send" />
    <button @click="send">Envoyer</button>
  </div>
</template>
