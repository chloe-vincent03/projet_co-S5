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
import Chat from "@/views/chat.vue";
import NotFound from "@/views/NotFound.vue";
import MentionsLegales from "@/views/MentionsLegales.vue";
import PolitiqueConfidentialite from "@/views/PolitiqueConfidentialite.vue";
import CGU from "@/views/CGU.vue";
import Contact from "@/views/Contact.vue";
import CoupDeCoeur from "@/views/coupDeCoeur.vue";
import Galerie from "@/views/Galerie.vue";
import Notifications from "@/views/notifications.vue";


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
  {
    path: "/oeuvre/edit/:id",
    component: () => import("@/views/EditMedia.vue"),
  },
  {
    path: "/collaborations",
    component: () => import("@/views/collaborations.vue"),
  },
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
  // 404 - DOIT ETRE EN DERNIER
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFound,
  },
  {
    path: "/mentions-legales",
    name: "mentions-legales",
    component: MentionsLegales,
  },
  {
    path: "/politique-confidentialite",
    name: "politique-confidentialite",
    component: PolitiqueConfidentialite,
  },
  {
    path: "/cgu",
    name: "cgu",
    component: CGU,
  },
  {
    path: "/contact",
    name: "contact",
    component: Contact,
  },
  {
    path: "/coups-de-coeur",
    name: "coups-de-coeur",
    component: CoupDeCoeur,
  },
  {
    path: "/galerie",
    name: "galerie",
    component: Galerie,
  },
  {
    path: "/notifications",
    name: "notifications",
    component: Notifications,
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

router.beforeEach((to) => {
  const userStore = useUserStore();

  // ✅ si l’utilisateur est connecté et veut accéder à la landing
  if (to.path === "/" && userStore.isLoggedIn) {
    return "/galerie";
  }

  // sinon on laisse passer
  return true;
});



export default router;
