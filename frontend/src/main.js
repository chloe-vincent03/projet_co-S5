import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import './index.css'


import { createHead } from "@vueuse/head"; // 👈 Import via VueUse

const app = createApp(App);
const head = createHead(); // 👈 Création de l'instance head

app.use(createPinia());
app.use(router);
app.use(head); // 👈 Activation du SEO

app.mount("#app");
