<script setup>
import { ref, watch } from "vue";
import { useUserStore } from "@/stores/user";
import Chat from "@/components/Chat.vue";
import api from "@/api/axios";
import { useChatStore } from "@/stores/chat";
import { useRoute } from "vue-router";

const route = useRoute();

import { useRouter } from "vue-router";

const router = useRouter();

const chatStore = useChatStore();


const conversations = ref([]);
const activeUserId = ref(null);
const userStore = useUserStore();

// charger les conversations quand l'utilisateur est prêt
watch(
  () => userStore.user,
  async (user) => {
    if (!user) return;
    const res = await api.get("/messages/conversations");
    conversations.value = res.data;
  },
  { immediate: true }
);

watch(
  () => chatStore.lastMessage,
  (msg) => {
    if (!msg || !userStore.user) return;

    const myId = userStore.user.user_id;

    // 👉 identifier l'autre utilisateur de la conversation
    const otherUserId =
      msg.sender_id === myId ? msg.receiver_id : msg.sender_id;

    const index = conversations.value.findIndex(
      (c) => c.user_id === otherUserId
    );

    const updatedConversation = {
      user_id: otherUserId,
      username: conversations.value[index]?.username,
      avatar: conversations.value[index]?.avatar,
      last_message: msg.content,
last_date: msg.created_at ?? new Date().toISOString()
    };

    // 🔥 si la conversation existe déjà → on la retire
    if (index !== -1) {
      conversations.value.splice(index, 1);
    }

    // 🔥 on la remet en haut
    conversations.value.unshift(updatedConversation);
  }
);


watch(
  () => chatStore.lastMessage,
  async (msg) => {
    if (!msg || !userStore.user) return;

    const myId = userStore.user.user_id;

    const otherUserId =
      msg.sender_id === myId ? msg.receiver_id : msg.sender_id;

    const index = conversations.value.findIndex(
      (c) => c.user_id === otherUserId
    );

    let username;
    let avatar;

    // 🟢 CAS 1 : la conversation existe déjà
    if (index !== -1) {
      username = conversations.value[index].username;
      avatar = conversations.value[index].avatar;

      conversations.value.splice(index, 1);
    }
    // 🔥 CAS 2 : NOUVELLE conversation → on fetch l'utilisateur
    else {
      const res = await api.get(`/auth/users/${otherUserId}`);
      username = res.data.username;
      avatar = res.data.avatar;
    }

    const updatedConversation = {
      user_id: otherUserId,
      username,
      avatar,
      last_message: msg.content,
      last_date: msg.created_at ?? new Date().toISOString(),
    };

    conversations.value.unshift(updatedConversation);
  }
);



// const openChat = (userId) => {
//   activeUserId.value = userId;
// };
// const formatDate = (date) => {
//   return new Date(date).toLocaleTimeString("fr-FR", {
//     hour: "2-digit",
//     minute: "2-digit",
//     timeZone: "Europe/Paris", // ✅
//   });
// };

const openConversation = (userId) => {
  router.replace({
    query: { userId },
  });
};

watch(
  () => route.query.userId,
  (id) => {
    activeUserId.value = id ? Number(id) : null;
  },
  { immediate: true }
);



</script>

<template>
  <div class="flex h-[calc(100vh-80px)] bg-white">

    <!-- COLONNE GAUCHE : conversations -->
    <aside class="border-r overflow-y-auto
             w-full lg:w-72
             " :class="activeUserId ? 'hidden lg:block' : 'block'">
      <div class="p-4 lg:text-2xl text-xl text-blue-plumepixel font-[PlumePixel]">Messages</div>

      <div v-for="c in conversations" :key="c.user_id" @click="openConversation(c.user_id)"
        class="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-100">
        <img class="w-10 h-10 object-cover border border-blue-600" :src="c.avatar || '/avatar.png'" />

        <div class="flex-1 min-w-0">
          <div class="font-medium truncate">
            {{ c.username }}
          </div>
          <div class="text-xs text-gray-500 truncate">
            {{ c.last_message }}
          </div>
        </div>
      </div>
    </aside>

    <!-- COLONNE DROITE : chat -->
    <section class="flex-1" :class="!activeUserId ? 'hidden lg:flex' : 'flex'">
      <Chat v-if="activeUserId" :receiverId="activeUserId" @back="activeUserId = null" />

      <div v-else class="flex-1 hidden lg:flex items-center justify-center text-gray-400">
        Sélectionne une conversation
      </div>
    </section>

  </div>
</template>
