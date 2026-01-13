<script setup>
import { ref, watch, onMounted } from "vue";
import { useUserStore } from "@/stores/user";
import Chat from "@/components/Chat.vue";
import api from "@/api/axios";
import { useChatStore } from "@/stores/chat";
import { useRoute } from "vue-router";
import { useHead } from "@vueuse/head";

useHead({
  title: "Messagerie",
});

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

    conversations.value = res.data.map(c => ({
      ...c,
      unread_count: 0, // 🔴 OBLIGATOIRE
    }));
  },
  { immediate: true }
);




watch(
  () => chatStore.lastMessage,
  (msg) => {
    if (!msg || !userStore.user) return;

    const myId = userStore.user.user_id;
    if (msg.receiver_id !== myId) return;

    const conv = conversations.value.find(
      c => c.user_id === msg.sender_id
    );

    if (conv && activeUserId.value !== msg.sender_id) {
      conv.unread_count = (conv.unread_count || 0) + 1;
    }
  }
);




const openConversation = (userId) => {
  activeUserId.value = userId;

  const conv = conversations.value.find(c => c.user_id === userId);
  if (conv) {
    conv.unread_count = 0; // 🔥 DISPARITION IMMÉDIATE DU POINT
  }

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

onMounted(() => {
  if (userStore.user) {
    chatStore.init(userStore.user.user_id);
  }
});

watch(
  () => chatStore.lastMessage,
  (msg) => {
    console.log("🔥 MESSAGE SOCKET REÇU", msg);
  }
);



</script>

<template>
  <div class="flex h-[calc(100vh-80px)] bg-white">

    <!-- COLONNE GAUCHE : conversations -->
    <aside class="border-r border-r-blue-plumepixel overflow-y-auto
             w-full lg:w-72
             " :class="activeUserId ? 'hidden lg:block' : 'block'">
      <div class="p-4 lg:text-2xl text-xl text-blue-plumepixel font-[PlumePixel]">Messages</div>

      <li v-for="c in conversations" @click="openConversation(c.user_id)" :key="c.user_id" 
        class="flex items-center gap-3 p-3 border-b cursor-pointer"
        :class="{
          'bg-blue-50 font-semibold': c.unread_count > 0
        }">
        <div class="flex-1">
          <div class="flex justify-between">
            <span>{{ c.username }}</span>

            <!-- 🔴 PETIT POINT -->
            <span v-if="c.unread_count > 0" class="w-2 h-2 bg-red-500 rounded-full"></span>
          </div>

          <p class="text-sm text-gray-500 truncate">
            {{ c.last_message }}
          </p>
        </div>
      </li>
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
