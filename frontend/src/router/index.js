import { createRouter, createWebHistory } from "vue-router";
import Register from "../views/Register.vue";
import Login from "../views/Login.vue";
import index from "../views/index.vue";
/* import Gallery from "../views/Gallery.vue"; */
import Details from "@/views/Details.vue";
import AddMedia from "@/views/AddMedia.vue";
const routes = [
  { path: "/", name: "index", component: index }, // 👈 accueil ici
  { path: "/register", name: "Register", component: Register },
  { path: "/login", name: "Login", component: Login },
  { path: "/oeuvre/:id", component: Details },
  { path: "/ajouter", component: AddMedia },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
