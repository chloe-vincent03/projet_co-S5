import { defineStore } from "pinia";
import { io } from "socket.io-client";
import api from "@/api/axios"; // ✅ PAS axios brut
import { useUserStore } from "@/stores/user";


// 🔌 connexion socket (UNE SEULE FOIS)
const socket = io("http://localhost:3000", {
  withCredentials: true,
});

export const useChatStore = defineStore("chat", {
  state: () => ({
    messages: [],
    receiverId: null,
    lastMessage: null,
    conversations: [], // 🔥 NOUVEAU → pour la colonne gauche
  }),

  actions: {
    // 🔑 initialisation socket
    init(userId) {
      if (!userId) return;

      socket.off("message"); // évite les doublons

      socket.emit("register", userId);

socket.on("message", (msg) => {
  const userStore = useUserStore();

  // 🔴 si je reçois un message
  if (msg.receiver_id === userStore.user?.user_id) {
    userStore.unreadMessagesCount++;
  }

  this.lastMessage = msg;

  if (
    msg.sender_id === this.receiverId ||
    msg.receiver_id === this.receiverId
  ) {
    this.messages.push(msg);
  }
});

    },

    // 📜 charger l'historique
    async loadHistory(receiverId) {
      this.receiverId = receiverId;
      const res = await api.get(`/messages/${receiverId}`);
      this.messages = res.data;
    },

    // ✉️ envoyer un message
    sendMessage(senderId, content = null, image_url = null) {
      if (!this.receiverId) return;

      socket.emit("message", {
        sender_id: senderId,
        receiver_id: this.receiverId,
        content,
        image_url,
      });
    },
    async fetchConversations() {
      const res = await api.get("/messages/conversations");
      this.conversations = res.data.map(c => ({
        ...c,
        unread_count: c.unread_count ?? 0,
      }));
    },

    setUnreadForUser(userId, count = 0) {
      const convo = this.conversations.find(c => c.user_id === userId);
      if (convo) convo.unread_count = count;
    },
  },

  
});
