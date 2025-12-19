<script setup>
import { ref, watch, nextTick } from "vue";
import { useUserStore } from "@/stores/user";
import { useChatStore } from "@/stores/chat";
import api from "@/api/axios";
import MyButton from "./MyButton.vue";



const props = defineProps({
  receiverId: { type: Number, required: true },
});

const userStore = useUserStore();
const chat = useChatStore();

const text = ref("");
const messagesEnd = ref(null);

// init socket + charger historique
watch(
  () => props.receiverId,
  async (id) => {
    if (!id || !userStore.user) return;

    chat.init(userStore.user.user_id);
    await chat.loadHistory(id);

    // 🔥 charger l'utilisateur avec qui on discute
    const res = await api.get(`/auth/users/${id}`);
    receiver.value = res.data;
  },
  { immediate: true }
);

// auto-scroll
watch(
  () => chat.messages.length,
  async () => {
    await nextTick();
    messagesEnd.value?.scrollIntoView({ behavior: "smooth" });
  }
);

const send = () => {
  if (!text.value.trim()) return;
  chat.sendMessage(userStore.user.user_id, text.value);
  text.value = "";
};

const formatTime = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  });
};


const receiver = ref(null);
</script>

<template>
  <section class="flex flex-col flex-1 ">

    <!-- HEADER -->
    <header class="h-16 bg-white">
      <div class="max-w-3xl mx-auto px-4 h-full flex items-center gap-3">
        <img v-if="receiver?.avatar" :src="receiver.avatar" class="w-9 h-9 object-cover border border-blue-600" />
        <div v-if="receiver">
          <div class="font-semibold leading-tight">
            {{ receiver.first_name }} {{ receiver.last_name }}
          </div>
          <div class="text-xs text-gray-500">
            @{{ receiver.username }}
          </div>
        </div>
      </div>
    </header>

    <!-- MESSAGES -->
    <main class="flex-1 overflow-y-auto py-6">
      <div class="max-w-3xl mx-auto px-4 space-y-4">

        <div v-for="(m, i) in chat.messages" :key="m.id || i" class="flex"
          :class="m.sender_id === userStore.user.user_id ? 'justify-end' : 'justify-start'">
          <div :class="[
            'max-w-[65%] px-4 py-3 text-sm border',
            m.sender_id === userStore.user.user_id
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-800 border-blue-600'
          ]">
            <p class="whitespace-pre-line break-words">
              {{ m.content }}
            </p>

            <div class="mt-1 text-[10px] opacity-60 text-right">
              {{ formatTime(m.created_at) }}
            </div>
          </div>
        </div>

        <div ref="messagesEnd"></div>
      </div>
    </main>

    <!-- INPUT -->
    <footer class=" bg-white py-3">
      <div class="max-w-3xl mx-auto px-4 flex items-center gap-3">
        <input v-model="text" @keyup.enter="send" placeholder="Écrire un message…" class="flex-1 bg-transparent border border-blue-600 px-4 py-2 outline-none
                 focus:ring-1 focus:ring-blue-600" />
        <MyButton @click="send" :style="{ backgroundColor: 'var(--color-blue-plumepixel)' }">
          Envoyer
        </MyButton>
      </div>
    </footer>

  </section>
</template>


<style scoped>
.message-enter-active {
  transition: all 0.25s ease;
}

.message-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
</style>
