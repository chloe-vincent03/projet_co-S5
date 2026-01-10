<script setup>
import { RouterLink } from "vue-router";
import MyButton from "@/components/MyButton.vue";
import IconLogo from "@/components/icons/IconLogo.vue";
</script>

<template>
    <main class="text-blue-plumepixel">

        <!-- HERO -->
        <section class="flex flex-col items-center justify-center text-center px-6 py-20 lg:py-0">
            <IconLogo class="mt-12" />

            <h1 class="lg:text-2xl text-xl sm:text-lg text-black lg:mb-8 lg:mt-7 font-[PlumePixel]">
                Inspirez-vous.
                Inspirez les autres.
            </h1>

            <MyButton to="/register" class="mt-6 lg:mt-0" :style="{ backgroundColor: 'var(--color-blue-plumepixel)' }">
                Rejoins la communauté !
            </MyButton>
        </section>

        <!-- SECTION : INSPIRE -->
        <section class="pt-16 lg:pt-10 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 items-center gap-10 lg:gap-0">

            <!-- VISUEL -->
            <div class="order-2 lg:order-1 flex justify-center lg:block">
                <img src="/public/img/img1_landingPage.png" class="w-full max-w-sm sm:max-w-md lg:max-w-none" />
            </div>

            <!-- TEXTE -->
            <div class="order-1 lg:order-2 text-center lg:text-left lg:pl-20">
                <h2 class="lg:text-4xl text-2xl font-[PlumePixel] mb-4">
                    Inspirez
                </h2>
                <p class="max-w-md mx-auto lg:mx-0 text-black">
                    Vous et d’autres esprits créatifs sur la gallerie communautaire du site.
                </p>
            </div>
        </section>

        <!-- SECTION : CREER -->
        <section class="pt-16 lg:pt-0 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 items-center gap-10 lg:gap-0">

            <!-- TEXTE -->
            <div class="text-center lg:text-left">
                <h2 class="lg:text-4xl text-2xl font-[PlumePixel] mb-4">
                    Créez
                </h2>
                <p class="max-w-md mx-auto lg:mx-0 text-black">
                    Textes, Images, Audio. Exercez la maîtrise de vos médiums de prédilection
                    et exposez vos oeuvres sur votre profil et dans votre portfolio.
                </p>
            </div>

            <!-- VISUEL -->
            <div class="flex justify-center lg:block">
                <img src="/public/img/img2_landingpage.png" class="w-full max-w-sm sm:max-w-md lg:max-w-none" />
            </div>
        </section>

        <!-- SECTION : COLLABORER -->
        <section class="pt-16 lg:pt-0 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 items-center gap-10 lg:gap-0">

            <!-- VISUEL -->
            <div class="order-2 lg:order-1 flex justify-center lg:block">
                <img src="/public/img/img3_landingPage.png" class="w-full max-w-sm sm:max-w-md lg:max-w-none" />
            </div>

            <!-- TEXTE -->
            <div class="order-1 lg:order-2 text-center lg:text-left lg:pl-20">
                <h2 class="lg:text-4xl text-2xl font-[PlumePixel] mb-4">
                    Collaborez
                </h2>
                <p class="max-w-md mx-auto lg:mx-0 text-black">
                    Avec les nombreux artistes de la plateforme. Créez des oeuvres
                    s’étendant a plusieurs médiums artistiques. Partagez votre vision,
                    communiquez et évoluez ensemble !
                </p>
            </div>
        </section>

        <!-- CTA FINAL -->
        <section class="py-24 text-center px-6">
            <RouterLink to="/register"
                class="inline-block bg-blue-plumepixel text-white px-10 py-4 font-[PlumePixel] rounded hover:opacity-90 transition">
                Inscrivez-vous maintenant
            </RouterLink>
        </section>

    </main>
</template>
