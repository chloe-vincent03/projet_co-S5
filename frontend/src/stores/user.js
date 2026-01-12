import { defineStore } from "pinia";
import axios from "axios";
import api from "@/api/axios";

// 🔧 Configuration globale d'Axios (IMPORTANT)
axios.defaults.baseURL = "http://localhost:3000/api";
axios.defaults.withCredentials = true;

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null,
    isLoggedIn: false,
    unreadMessagesCount: 0,
    unreadNotifications: 0,
  }),

  actions: {
    // 🔹 LOGIN
    async login(email, password) {
      try {
        const res = await api.post("/auth/login", { email, password });

        this.user = res.data.user;
        this.isLoggedIn = true;

        return { success: true };
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message,
        };
      }
    },

    // 🔹 REGISTER
    async register(data) {
      try {
        const res = await api.post("/auth/register", data);

        // 🔥 CONNECTE L'UTILISATEUR DANS LE STORE
        this.user = res.data.user;
        this.isLoggedIn = true;

        return { success: true };
      } catch (err) {
        return { success: false, message: err.response?.data?.message };
      }
    },

    // 🔹 LOGOUT
    async logout() {
      try {
        await api.post("/auth/logout");
      } catch (err) {}

      this.user = null;
      this.isLoggedIn = false;
    },

    // 🔹 DELETE ACCOUNT
    async deleteAccount() {
      try {
        await api.delete("/auth/delete-account");

        this.user = null;
        this.isLoggedIn = false;

        return { success: true };
      } catch (err) {
        return {
          success: false,
          message:
            err.response?.data?.message || "Erreur lors de la suppression.",
        };
      }
    },

    // 🔹 FETCH USER (session)
    async fetchUser() {
      try {
        const res = await api.get("/auth/me");
        this.user = res.data.user;
        this.isLoggedIn = true;
      } catch (err) {
        // Ne PAS bloquer les pages Login/Register ici !
        this.user = null;
        this.isLoggedIn = false;
      }
    },
    async fetchUnreadMessages() {
      if (!this.isLoggedIn) return;

      const res = await api.get("/messages/unread-count");
      this.unreadMessagesCount = res.data.count;
    },
    async fetchUnreadNotifications() {
      if (!this.isLoggedIn) return;
   

      const res = await api.get("/notification/unread-count");
      this.unreadNotifications = res.data.count;
    },



  },
});
