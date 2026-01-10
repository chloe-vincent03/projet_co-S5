import { defineStore } from "pinia";
import { io } from "socket.io-client";
import api from "@/api/axios"; // ✅ PAS axios brut

// 🔌 connexion socket (UNE SEULE FOIS)
const socket = io("http://localhost:3000", {
  withCredentials: true,
});

export const useChatStore = defineStore("chat", {
  state: () => ({
    messages: [],
    receiverId: null,
    lastMessage: null, // 🔥 NOUVEAU → pour la colonne gauche
  }),

  actions: {
    // 🔑 initialisation socket
    init(userId) {
      if (!userId) return;

      socket.off("message"); // évite les doublons

      socket.emit("register", userId);

      socket.on("message", (msg) => {
        // 🔥 1. notifier la messagerie (colonne gauche)
        this.lastMessage = msg;

        // 🔥 2. afficher dans le chat actif si concerné
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
  },
});
