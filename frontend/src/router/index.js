import { createRouter, createWebHistory } from "vue-router";
import Register from "../views/Register.vue";
import Login from "../views/Login.vue";
import index from "../views/index.vue";
/* import Gallery from "../views/Gallery.vue"; */
import Details from "@/views/Details.vue";
import AddMedia from "@/views/AddMedia.vue";
import Profil from "@/views/profil/index.vue";
import { useUserStore } from "../stores/user";
import ProfilSetting from "@/views/ProfilSetting.vue";
import ProfilPublic from "@/views/profil/[id].vue";
import Messagerie from "@/views/messagerie.vue";
import Chat from "@/views/Chat.vue";


const routes = [
  { path: "/", name: "index", component: index }, // 👈 accueil ici
  {
    path: "/register",
    name: "Register",
    component: Register,
    meta: { guestOnly: true },
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { guestOnly: true },
  },
  { path: "/oeuvre/:id", component: Details },
  { path: "/oeuvre/edit/:id", component: () => import("@/views/EditMedia.vue") }, 
  { path: "/ajouter", component: AddMedia },
  { path: "/profil", component: Profil, meta: { requiresAuth: true } },
  {
    path: "/profil/:id",
    name: "ProfilPublic",
    component: ProfilPublic,
  },

  {
    path: "/profil/settings",
    name: "ProfilSettings",
    component: ProfilSetting,
    meta: { requiresAuth: true },
  },

  {
    path: "/messagerie",
    name: "messagerie",
    component: Messagerie,
    meta: { requiresAuth: true },
  },

  {
    path: "/messagerie/:userId",
    name: "Chat",
    component: Chat,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const store = useUserStore();

  // attendre fetchUser seulement la première fois
  if (!store.user && !store.isLoggedIn) {
    await store.fetchUser();
  }

  // Page protégée + utilisateur NON connecté
  if (to.meta.requiresAuth && !store.isLoggedIn) {
    return next("/login");
  }

  // Page guestOnly + utilisateur connecté
  if (to.meta.guestOnly && store.isLoggedIn) {
    return next("/");
  }

  next();
});

export default router;
