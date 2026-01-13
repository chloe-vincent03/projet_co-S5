<template>
    <main class=" flex items-center justify-center px-6 py-12">
        <div class="w-full max-w-2xl bg-white p-8 shadow-sm border border-blue-plumepixel">
            <!-- Title -->
            <h1 class="text-4xl font-bold text-blue-plumepixel font-[PlumePixel] text-center">
                Nous contacter
            </h1>

            <p class="mt-6 text-center text-black">
                Une question, un problème technique, une idée à partager ou simplement
                envie de nous écrire ?
                <br />
                L’équipe <span class="font-medium">Plume & Pixel</span> vous lit avec
                attention.
            </p>

            <!-- Contact card -->
            <div class="mt-10 border border-blue-plumepixel/30 bg-blue-plumepixel/5 p-6 text-center">
                <p class="text-sm text-black mb-2">Adresse e-mail</p>

                <a href="mailto:contact@plume-pixel.fr"
                    class="text-lg font-semibold text-blue-plumepixel underline underline-offset-4 hover:opacity-80">
                    contact@plume-pixel.fr
                </a>

                <p class="mt-4 text-sm text-black">
                    Nous faisons notre possible pour répondre rapidement.
                </p>
            </div>

            <!-- Extra info -->
            <div class="mt-8 text-center text-sm text-gray-500">
                <p>
                    Pour toute question liée à vos données personnelles, consultez notre
                    <RouterLink to="/politique-confidentialite" class="underline hover:text-blue-plumepixel">
                        politique de confidentialité
                    </RouterLink>.
                </p>
            </div>

            <!-- Footer -->
            <div class="mt-10 border-t pt-6 text-center text-xs text-gray-500">
                © {{ new Date().getFullYear() }} Plume & Pixel — Tous droits réservés
            </div>
        </div>
    </main>
</template>

<script setup>
import { useHead } from "@vueuse/head";

useHead({
  title: "Contact",
});
</script>
