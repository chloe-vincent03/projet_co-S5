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

import { nextTick } from "vue";
import MyButton from "@/components/MyButton.vue";

const messagesEnd = ref(null);

watch(
  () => chat.messages.length,
  async () => {
    await nextTick();
    messagesEnd.value?.scrollIntoView({ behavior: "smooth" });
  }
);
</script>

<template>
  <div class="flex h-[calc(100vh-80px)] bg-white">

    <!-- COLONNE GAUCHE : conversations -->
    <aside class="w-72  overflow-y-auto">
      <div class="p-4 font-semibold">Messages</div>

      <div
        v-for="u in users"
        :key="u.user_id"
        class="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer"
        @click="goToChat(u.user_id)"
      >
        <img
          class="w-10 h-10 rounded-full object-cover"
          :src="u.avatar || '/avatar.png'"
        />
        <div>
          <div class="font-medium">{{ u.username }}</div>
          <div class="text-xs text-gray-500 truncate">
            Dernier message…
          </div>
        </div>
      </div>
    </aside>

    <!-- COLONNE DROITE : chat -->
    <section class="flex flex-col flex-1">

      <!-- HEADER -->
      <header class="h-16  flex items-center px-6 font-semibold">
        {{ receiver?.username || "Discussion" }}
      </header>

      <!-- MESSAGES -->
      <main class="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50">
        <div
          v-for="(m, i) in chat.messages"
          :key="i"
          :class="[
            'max-w-[60%] px-4 py-2 rounded-lg text-sm',
            m.sender_id === userStore.user.user_id
              ? 'ml-auto bg-blue-500 text-white rounded-br-none'
              : 'mr-auto bg-white border rounded-bl-none'
          ]"
        >
          {{ m.content }}
        </div>
        
      </main>

      <!-- INPUT -->
      <footer class="h-16 flex items-center px-4 gap-2">
        <input
          v-model="text"
          @keyup.enter="send"
          class="flex-1 border rounded-full px-4 py-2 outline-none"
          placeholder="Écrire un message…"
        />
        <MyButton
          @click="send"
:style="{ backgroundColor: 'var(--color-blue-plumepixel)' }"        >
        >
          Envoyer
      </MyButton>
      </footer>
<div ref="messagesEnd"></div>

    </section>
  </div>
</template>

