<script setup>
import { ref, watch, nextTick } from "vue";
import { useUserStore } from "@/stores/user";
import { useChatStore } from "@/stores/chat";

const props = defineProps({
  receiverId: { type: Number, required: true },
});

const userStore = useUserStore();
const chat = useChatStore();

const text = ref("");
const messagesEnd = ref(null);

// init socket + charger historique quand receiverId change
watch(
  () => props.receiverId,
  async (id) => {
    if (!id || !userStore.user) return;

    chat.init(userStore.user.user_id);
    await chat.loadHistory(id);
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
</script>

<template>
  <section class="flex flex-col flex-1">

    <!-- HEADER -->
    <header class="h-16 border-b flex items-center px-6 font-semibold">
      Discussion
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

      <div ref="messagesEnd"></div>
    </main>

    <!-- INPUT -->
    <footer class="h-16 border-t flex items-center px-4 gap-2">
      <input
        v-model="text"
        @keyup.enter="send"
        class="flex-1 border rounded-full px-4 py-2 outline-none"
        placeholder="Écrire un message…"
      />
      <button
        @click="send"
        class="px-4 py-2 bg-blue-500 text-white rounded-full"
      >
        Envoyer
      </button>
    </footer>

  </section>
</template>
