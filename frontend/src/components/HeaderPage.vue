<script setup>
import { ref, computed } from "vue";
import { RouterLink } from "vue-router";
import { useUserStore } from "@/stores/user";
import IconLogo from "@/components/icons/IconLogo.vue";

const userStore = useUserStore();

const menuOpen = ref(false);
const toggleMenu = () => (menuOpen.value = !menuOpen.value);
const closeMenu = () => (menuOpen.value = false);

const isLoggedIn = computed(() => userStore.isLoggedIn);
</script>

<template>
  <header
    class="w-full fixed top-0 left-0 z-50 bg-white border-b-2 border-b-blue-plumepixel lg:mx-auto"
  >
    <div
      class="max-w-7xl mx-2 flex items-center justify-between py-4 px-4 lg:py-2 relative z-50"
    >
      <!-- LOGO -->
      <RouterLink
        to="/"
        @click="closeMenu"
        aria-label="Accueil"
        class="flex items-center"
      >
        <IconLogo class="h-12 w-12 lg:h-16 lg:w-16" />
      </RouterLink>

      <!-- NAVIGATION + LIENS (dans le même flex que le logo) -->
      <nav
        class="fixed top-0 left-0 w-full h-screen bg-white flex flex-col items-center justify-center p-8 shadow-lg
               lg:static lg:h-auto lg:w-auto lg:bg-transparent lg:p-0 lg:flex-row lg:items-center lg:justify-end lg:shadow-none
               z-40"
        :class="menuOpen ? 'flex' : 'hidden lg:flex'"
      >
        <ul
          class="flex flex-col gap-12 text-3xl text-center
                 lg:flex-row lg:gap-8 lg:text-base lg:text-left lg:items-center"
        >
          <li><RouterLink @click="closeMenu" to="/galerie">Galerie</RouterLink></li>
          <li><RouterLink @click="closeMenu" to="/collaborations">Collaborations</RouterLink></li>

          <template v-if="!isLoggedIn">
            <li><RouterLink @click="closeMenu" to="/register">Inscription</RouterLink></li>
            <li>
              <RouterLink
                @click="closeMenu"
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
                @click="closeMenu"
                to="/profil"
                class="px-4 py-2 bg-blue-plumepixel text-white rounded-md"
              >
                Mon Profil
              </RouterLink>
            </li>
          </template>
        </ul>
      </nav>

      <!-- BURGER MOBILE aligné dans le même flex -->
      <button
        class="lg:hidden flex flex-col gap-1 p-3 z-50"
        @click="toggleMenu"
        aria-label="Menu"
      >
        <span
          class="w-7 h-[3px] bg-black transition duration-300"
          :class="{ 'rotate-45 translate-y-2': menuOpen }"
        ></span>

        <span
          class="w-7 h-[3px] bg-black transition duration-300"
          :class="{ 'opacity-0': menuOpen }"
        ></span>

        <span
          class="w-7 h-[3px] bg-black transition duration-300"
          :class="{ '-rotate-45 -translate-y-1.5': menuOpen }"
        ></span>
      </button>
    </div>
  </header>
</template>


