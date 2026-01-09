<script setup>
import IconInstagram from "./icons/IconInstagram.vue";
import IconDiscord from "./icons/IconDiscord.vue";
import IconFacebook from "./icons/IconFacebook.vue";
import IconLinkedin from "./icons/IconLinkedin.vue";
import IconTiktok from "./icons/IconTiktok.vue";
import IconX from "./icons/IconX.vue";
import IconLogo from "./icons/IconLogo.vue";
</script>

<template>
  <footer class="w-full mt-10 text-blue-plumepixel">
    <div class="border-t-2 border-blue-plumepixel pt-6 pb-10 lg:px-24">
      <div
        class="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-between"
      >
        <div class="flex flex-col items-center lg:items-start gap-4">
          <RouterLink to="/">
            <IconLogo class="w-40 text-blue-plumepixel" />
          </RouterLink>

          <p class="text-sm text-center lg:text-left leading-tight">
            Copyright © 2026 Plume & Pixel<br />
            Tous droits réservés
          </p>

          <div class="flex gap-4 items-center">
            <IconInstagram class="w-6 cursor-pointer hover:opacity-60" />
            <IconTiktok class="w-6 cursor-pointer hover:opacity-60" />
            <IconX class="w-6 cursor-pointer hover:opacity-60" />
            <IconDiscord class="w-6 cursor-pointer hover:opacity-60" />
            <IconLinkedin class="w-6 cursor-pointer hover:opacity-60" />
            <IconFacebook class="w-6 cursor-pointer hover:opacity-60" />
          </div>
        </div>

        <ul
          class="flex flex-col items-center gap-4 text-sm lg:flex-row lg:items-start lg:gap-12"
        >
         <li>
            <a href="/contact" class="hover:font-bold focus:font-bold">Contact</a>
          </li>
          <li>
            <a href="/mentions-legales" class="hover:font-bold focus:font-bold"
              >Mentions légales</a
            >
          </li>
          <li>
            <a href="/cgu" class="hover:font-bold focus:font-bold"
              >Conditions générales d'utilisation</a
            >
          </li>
          <li>
            <a href="/politique-confidentialite" class="hover:font-bold focus:font-bold"
              >Politique de confidentialité</a
            >
          </li>
        </ul>
      </div>
    </div>
  </footer>
</template>
