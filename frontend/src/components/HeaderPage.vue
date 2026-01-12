<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { RouterLink } from "vue-router";
import { useUserStore } from "@/stores/user";
import IconLogo from "@/components/icons/IconLogo.vue";
import MyButton from "./MyButton.vue";
import IconChat from "./icons/IconChat.vue";

const userStore = useUserStore();
const unreadCount = computed(() => userStore.unreadMessagesCount);

onMounted(() => {
  if (userStore.isLoggedIn) {
    userStore.fetchUnreadNotifications();

    userStore.fetchUnreadMessages();      // 👈 AJOUT

  }
});


const menuOpen = ref(false);
const toggleMenu = () => (menuOpen.value = !menuOpen.value);
const closeMenu = () => (menuOpen.value = false);

const isLoggedIn = computed(() => userStore.isLoggedIn);
watch(
  () => userStore.isLoggedIn,
  (logged) => {
    if (logged) {
      userStore.fetchUnreadMessages();
      userStore.fetchUnreadNotifications();
    }
  },
  { immediate: true }
);



</script>

<template>
  <header
    class="w-full fixed top-0 left-0 z-50 bg-white border-b-2 border-b-blue-plumepixel lg:mx-auto "
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
        class="fixed top-0 left-0 w-full h-screen bg-white flex flex-col items-center justify-center p-8 shadow-lg lg:static lg:h-auto lg:w-auto lg:bg-transparent lg:p-0 lg:flex-row lg:items-center lg:justify-end lg:shadow-none z-40"
        :class="menuOpen ? 'flex' : 'hidden lg:flex'"
      >
        <ul
          class="flex flex-col gap-12 text-3xl text-center lg:flex-row lg:gap-8 lg:text-base lg:text-left lg:items-center"
        >
          <li class="hover:underline hover:text-blue-plumepixel">
            <RouterLink @click="closeMenu" to="/galerie">Galerie</RouterLink>
          </li>
          <li class="hover:underline hover:text-blue-plumepixel">
            <RouterLink @click="closeMenu" to="/collaborations"
              >Collaborations</RouterLink
            >
          </li>

          <template v-if="!isLoggedIn">
            <li>
              <MyButton
                @click="closeMenu"
                to="/register"
                :style="{
                  border: '2px solid var(--color-blue-plumepixel)',
                  color: 'var(--color-blue-plumepixel)',
                }"
                variant="transparent"
                >Inscription</MyButton
              >
            </li>
            <li>
              <MyButton
                @click="closeMenu"
                to="/login"
                :style="{
                  backgroundColor: 'var(--color-blue-plumepixel)',
                }"
              >
                Connexion
              </MyButton>
            </li>
          </template>

          <template v-else>
            <li class="hover:underline hover:text-blue-plumepixel">
              <RouterLink @click="closeMenu" to="/coups-de-coeur">
                Mes coups de cœur
              </RouterLink>
            </li>

          <li class="relative">
              <RouterLink @click="closeMenu" to="/messagerie" class="relative inline-flex">
                <IconChat class="w-7 h-7" />

                <!-- 🔴 BADGE -->
                <span
    v-if="unreadCount > 0"
    class="absolute -top-1 -right-2
           bg-red-500 text-white
           text-[10px] font-bold
           rounded-full
           min-w-[18px] h-[18px]
           flex items-center justify-center
           px-1"
  >
    {{ unreadCount }}
  </span>
              </RouterLink>
            </li>
            <li class="relative">
              <RouterLink to="/notifications" class="relative">
notifications
                <span v-if="userStore.unreadNotifications > 0" class="absolute -top-1 -right-2
             bg-red-500 text-white
             text-[10px] font-bold
             rounded-full
             min-w-[18px] h-[18px]
             flex items-center justify-center">
                  {{ userStore.unreadNotifications }}
                </span>
              </RouterLink>
            </li>
            <li class="">
              <MyButton @click="closeMenu" to="/profil" :style="{
                backgroundColor: 'var(--color-blue-plumepixel)',
              }">Mon Profil</MyButton>
              
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
