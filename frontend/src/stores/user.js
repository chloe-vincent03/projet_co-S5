import { defineStore } from "pinia";
import axios from "axios";

// 🔧 Configuration globale d'Axios (IMPORTANT)
axios.defaults.baseURL = "http://localhost:3000/api";
axios.defaults.withCredentials = true;

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null,
    isLoggedIn: false,
  }),

  actions: {
    // 🔹 LOGIN
    async login(email, password) {
      try {
        const res = await axios.post("/auth/login", { email, password });

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
        const res = await axios.post("/auth/register", data);

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
        await axios.post("/auth/logout");
      } catch (err) {}

      this.user = null;
      this.isLoggedIn = false;
    },

    // 🔹 DELETE ACCOUNT
    async deleteAccount() {
      try {
        await axios.delete("/auth/delete-account");

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
        const res = await axios.get("/auth/me");
        this.user = res.data.user;
        this.isLoggedIn = true;
      } catch (err) {
        // Ne PAS bloquer les pages Login/Register ici !
        this.user = null;
        this.isLoggedIn = false;
      }
    },
  },
});
