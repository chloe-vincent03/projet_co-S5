import { defineStore } from "pinia";
import { io } from "socket.io-client";
import axios from "axios";

// ✅ ICI tu crées la connexion socket (IL MANQUAIT CETTE LIGNE)
const socket = io("http://localhost:3000", {
  withCredentials: true,
});


export const useChatStore = defineStore("chat", {
  state: () => ({
    messages: [],
    receiverId: null,
  }),

  actions: {
    init(userId) {
      socket.emit("register", userId);

      socket.on("message", (msg) => {
        if (
          msg.sender_id === this.receiverId ||
          msg.receiver_id === this.receiverId
        ) {
          this.messages.push(msg);
        }
      });
    },

    async loadHistory(receiverId) {
      this.receiverId = receiverId;
const res = await axios.get(`/messages/${receiverId}`);
      this.messages = res.data;
    },

    sendMessage(senderId, content) {
      if (!this.receiverId) return;

      const msg = {
        sender_id: senderId,
        receiver_id: this.receiverId,
        content,
      };

      socket.emit("message", msg);
    },
  },

  init(userId) {
    if (!userId) return;

    socket.off("message"); // 🔥 évite doublons

    socket.emit("register", userId);

    socket.on("message", (msg) => {
      if (
        msg.sender_id === this.receiverId ||
        msg.receiver_id === this.receiverId
      ) {
        this.messages.push(msg);
      }
    });
  },
});
