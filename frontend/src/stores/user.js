import { defineStore } from "pinia";
import axios from "axios";

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null, // info utilisateur
    isLoggedIn: false,
  }),

  actions: {
    async login(email, password) {
      try {
        const res = await axios.post("/api/auth/login", {
          email,
          password,
        });

        this.user = res.data.user;
        this.isLoggedIn = true;

        return { success: true };
      } catch (err) {
        return { success: false, message: err.response?.data?.message };
      }
    },

    async register(data) {
      try {
        await axios.post("/api/auth/register", data);
        return { success: true };
      } catch (err) {
        return { success: false, message: err.response?.data?.message };
      }
    },

    async logout() {
      await axios.post("/api/auth/logout");
      this.user = null;
      this.isLoggedIn = false;
    },

    async fetchUser() {
      try {
        const res = await axios.get("/api/auth/me");
        this.user = res.data.user;
        this.isLoggedIn = true;
      } catch {
        this.user = null;
        this.isLoggedIn = false;
      }
    },
  },
});
