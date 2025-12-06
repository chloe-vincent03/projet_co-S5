<script setup>
import { ref, computed } from "vue";
import { RouterLink } from "vue-router";
import { useUserStore } from "@/stores/user";
import IconLogo from "@/components/icons/IconLogo.vue";

const userStore = useUserStore();

// menu burger
const menuOpen = ref(false);
const toggleMenu = () => (menuOpen.value = !menuOpen.value);
const closeMenu = () => (menuOpen.value = false);

// détecter connexion
const isLoggedIn = computed(() => userStore.isLoggedIn);
</script>

<template>
  <header
    class="w-full fixed top-0 left-0 z-50 bg-white border-b-2 border-b-blue-plumepixel lg:mx-auto"
  >
    <!-- CONTAINER GLOBAL DU HEADER -->
    <div
      class="max-w-7xl mx-2 flex items-center justify-between py-4 px-4 lg:py-2 relative z-50"
    >
      <!-- LOGO à GAUCHE, SUR LA MÊME LIGNE QUE LES LIENS -->
      <RouterLink
        to="/"
        aria-label="Accueil"
        @click="closeMenu"
        class="flex items-center"
      >
        <IconLogo class="h-12 w-12 lg:h-16 lg:w-16" />
      </RouterLink>

      <!-- MENU DESKTOP : LINKS À DROITE -->
      <ul class="hidden lg:flex items-center gap-8">
        <li><RouterLink to="/galerie">Galerie</RouterLink></li>
        <li><RouterLink to="/collaborations">Collaborations</RouterLink></li>

        <template v-if="!isLoggedIn">
          <li><RouterLink to="/register">Inscription</RouterLink></li>
          <li>
            <RouterLink
              to="/login"
              class="px-4 py-2 bg-blue-plumepixel text-white rounded-md"
            >
              Connexion
            </RouterLink>
          </li>
        </template>

        <template v-else>
          <li>
            <RouterLink
              to="/profil"
              class="px-4 py-2 bg-blue-plumepixel text-white rounded-md"
            >
              Mon Profil
            </RouterLink>
          </li>
        </template>
      </ul>

      <!-- BURGER MOBILE -->
      <button
        class="lg:hidden flex flex-col gap-1 p-3"
        @click="toggleMenu"
        aria-label="Menu"
      >
        <span
          class="w-7 h-[3px] bg-black transition"
          :class="{ 'rotate-45 translate-y-2': menuOpen }"
        ></span>
        <span
          class="w-7 h-[3px] bg-black transition"
          :class="{ 'opacity-0': menuOpen }"
        ></span>
        <span
          class="w-7 h-[3px] bg-black transition"
          :class="{ '-rotate-45 -translate-y-1.5': menuOpen }"
        ></span>
      </button>
    </div>

    <!-- MENU MOBILE FULLSCREEN -->
    <nav
      class="fixed top-0 left-0 w-full h-screen bg-white flex flex-col items-center justify-center p-8 shadow-lg lg:hidden z-40"
      :class="menuOpen ? 'flex' : 'hidden'"
    >
      <ul class="flex flex-col gap-12 text-3xl text-center">
        <li class="">
          <RouterLink @click="closeMenu" to="/galerie">Galerie</RouterLink>
        </li>
        <li>
          <RouterLink @click="closeMenu" to="/collaborations"
            >Collaborations</RouterLink
          >
        </li>

        <template v-if="!isLoggedIn">
          <li>
            <RouterLink @click="closeMenu" to="/register"
              >Inscription</RouterLink
            >
          </li>
          <li>
            <RouterLink
              @click="closeMenu"
              to="/login"
              class="px-4 py-2 bg-indigo-600 text-white rounded-md"
            >
              Connexion
            </RouterLink>
          </li>
        </template>

        <template v-else>
          <li>
            <RouterLink
              @click="closeMenu"
              to="/profil"
              class="px-4 py-2 bg-indigo-600 text-white rounded-md"
            >
              Mon Profil
            </RouterLink>
          </li>
        </template>
      </ul>
    </nav>
  </header>
</template>
