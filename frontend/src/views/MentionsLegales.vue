<script setup>
import { useHead } from "@vueuse/head";

useHead({
  title: "Mentions Légales",
});
</script>

<template>
    <main class="">
        <div class="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
            <!-- Header -->
            <header class="mb-8">
                <h1 class="text-4xl font-bold  text-blue-plumepixel font-[PlumePixel] sm:text-4xl">
                    Mentions légales
                </h1>
                <p class="mt-2 text-sm text-blue-plumepixel">
                    Dernière mise à jour : <span class="font-medium">01 novembre 2025</span>
                </p>
            </header>

            <!-- Content card -->
            <section class=" bg-white p-6 shadow-sm sm:p-8 space-y-8">
                <!-- Identité -->
                <section>
                    <h2 class="text-xl font-semibold text-blue-plumepixel">Identification</h2>
                    <dl class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div class=" bg-gray-50 p-4">
                            <dt class="text-sm font-medium text-blue-plumepixel">Nom de l’organisateur/trice</dt>
                            <dd class="mt-1 text-sm text-black">Nancy Awad</dd>
                        </div>
                        <div class=" bg-gray-50 p-4">
                            <dt class="text-sm font-medium text-blue-plumepixel">Forme juridique</dt>
                            <dd class="mt-1 text-sm text-black">Société par Actions Simplifiée (SAS)</dd>
                        </div>
                        <div class=" bg-gray-50 p-4">
                            <dt class="text-sm font-medium text-blue-plumepixel">Raison sociale</dt>
                            <dd class="mt-1 text-sm text-black">Plume &amp; Pixel SAS</dd>
                        </div>
                        <div class=" bg-gray-50 p-4">
                            <dt class="text-sm font-medium text-blue-plumepixel">Numéro RCS</dt>
                            <dd class="mt-1 text-sm text-black">XXXXX</dd>
                        </div>
                        <div class=" bg-gray-50 p-4">
                            <dt class="text-sm font-medium text-blue-plumepixel">Numéro de TVA intracommunautaire</dt>
                            <dd class="mt-1 text-sm text-black">XXXXX</dd>
                        </div>
                        <div class=" bg-gray-50 p-4">
                            <dt class="text-sm font-medium text-blue-plumepixel">Adresse</dt>
                            <dd class="mt-1 text-sm text-black">
                                4 Pl. Lucien Tharradin, 25200 Montbéliard
                            </dd>
                        </div>
                        <div class=" bg-gray-50 p-4">
                            <dt class="text-sm font-medium text-blue-plumepixel">Contact</dt>
                            <dd class="mt-1 text-sm text-black">
                                <a class="underline decoration-gray-300 underline-offset-4 hover:decoration-gray-900"
                                    href="mailto:contact@plume-pixel.fr">
                                    contact@plume-pixel.fr
                                </a>
                            </dd>
                        </div>
                        <div class=" bg-gray-50 p-4">
                            <dt class="text-sm font-medium text-blue-plumepixel">Responsable de la publication</dt>
                            <dd class="mt-1 text-sm text-black">Équipe projet Plume &amp; Pixel</dd>
                        </div>
                        <div class=" bg-gray-50 p-4 sm:col-span-2">
                            <dt class="text-sm font-medium text-blue-plumepixel">Développement réalisé par</dt>
                            <dd class="mt-1 text-sm text-black">
                                Équipe projet Plume &amp; Pixel (BUT MMI Montbéliard)
                            </dd>
                        </div>
                    </dl>
                </section>

                <!-- Hébergeur -->
                <section>
                    <h2 class="text-xl font-semibold text-blue-plumepixel">Hébergeur</h2>
                    <div class="mt-4  bg-gray-50 p-4">
                        <p class="text-sm text-black">
                            Le site Plume &amp; Pixel est hébergé par la société <span
                                class="font-medium">Infomaniak</span>,
                            située <span class="font-medium">Rue Eugène-Marziano 25, 1227 Genève, Suisse</span>,
                            (contact téléphonique ou email : <span class="font-medium">(+41) 22 820 35 44</span>).
                        </p>
                        <p class="mt-3 text-sm">
                            La sécurité de vos données est une priorité. Le site est hébergé de manière sécurisée afin
                            de garantir
                            la protection des données.
                        </p>
                    </div>
                </section>

                <!-- Objet du site -->
                <section>
                    <h2 class="text-xl font-semibold text-blue-plumepixel">Objet du site</h2>
                    <p class="mt-4 text-sm text-gray-700">
                        Plume &amp; Pixel est une plateforme dédiée à la création et au partage d’œuvres artistiques
                        (textes, images, poèmes, etc.).
                    </p>
                    <ul class="mt-4 list-disc space-y-2 pl-5 text-sm text-gray-700">
                        <li>Créer un compte et gérer leur profil,</li>
                        <li>Publier leurs œuvres et consulter celles des autres,</li>
                        <li>Interagir via une messagerie interne,</li>
                        <li>Interagir avec les œuvres.</li>
                    </ul>
                    <p class="mt-4 text-sm text-gray-700">
                        Le site a également pour vocation de permettre la valorisation des créations artistiques et la
                        mise en relation entre auteurs.
                    </p>
                </section>

                <!-- Propriété intellectuelle -->
                <section>
                    <h2 class="text-xl font-semibold text-blue-plumepixel">Droits de propriété intellectuelle</h2>

                    <div class="mt-4 space-y-3 text-sm text-gray-700">
                        <p>
                            L’ensemble du contenu du site Plume &amp; Pixel (textes, images, illustrations, logo, etc.)
                            est la propriété
                            exclusive de Plume &amp; Pixel ou de leurs auteurs respectifs. Toute reproduction, diffusion
                            ou exploitation,
                            même partielle, sans autorisation écrite préalable, est strictement interdite.
                        </p>
                        <p>
                            Les utilisateurs conservent l’intégralité de leurs droits d’auteur sur leurs œuvres publiées
                            sur la plateforme.
                            En publiant sur Plume &amp; Pixel, ils accordent simplement une licence d’affichage non
                            exclusive à la plateforme
                            pour présenter leurs œuvres.
                        </p>
                        <p>
                            Pour les œuvres collaboratives, chaque contributeur conserve les droits sur sa partie, mais
                            le créateur du projet
                            détient les droits sur l’œuvre globale. Une obligation de citation des contributeurs est
                            imposée et leurs œuvres
                            ne peuvent être utilisées à des fins commerciales.
                        </p>
                        <p class=" bg-amber-50 p-4 text-amber-900 ring-1 ring-amber-200">
                            Toute violation des droits d’auteur pourra donner lieu à des poursuites conformément aux
                            articles
                            <span class="font-medium">L.335-2 et suivants</span> du Code de la Propriété Intellectuelle.
                        </p>
                    </div>
                </section>

                <!-- Responsabilité -->
                <section>
                    <h2 class="text-xl font-semibold text-blue-plumepixel">Responsabilité</h2>

                    <div class="mt-4 space-y-3 text-sm text-gray-700">
                        <p>
                            L’équipe Plume &amp; Pixel s’efforce de garantir l’exactitude et la mise à jour des
                            informations présentes sur le site.
                        </p>

                        <div class=" bg-gray-50 p-4">
                            <p class="text-sm font-medium text-black">Plume &amp; Pixel s’engage au maximum à :</p>
                            <ul class="mt-2 list-disc space-y-2 pl-5 text-sm text-gray-700">
                                <li>Modérer activement les contenus interdits (NSFW, nudité, propos haineux, œuvres
                                    générées par IA non déclarées).</li>
                                <li>Supprimer immédiatement tout contenu illicite signalé.</li>
                                <li>Protéger les données personnelles conformément au RGPD.</li>
                            </ul>
                        </div>

                        <div class=" bg-gray-50 p-4">
                            <p class="text-sm font-medium text-black">Cependant, elle ne saurait être tenue
                                responsable :</p>
                            <ul class="mt-2 list-disc space-y-2 pl-5 text-sm text-gray-700">
                                <li>D’erreurs ou d’omissions dans le contenu,</li>
                                <li>Des contenus publiés par les utilisateurs,</li>
                                <li>D’éventuelles interruptions du service,</li>
                                <li>Ou de dommages résultant de l’utilisation du site.</li>
                            </ul>
                        </div>

                        <p>
                            L’utilisateur est seul responsable du contenu qu’il publie et s’engage à ne pas diffuser de
                            propos ou d’œuvres illicites,
                            injurieuses ou contraires aux bonnes mœurs.
                        </p>
                    </div>
                </section>

                <!-- Protection des mineurs -->
                <section>
                    <h2 class="text-xl font-semibold text-blue-plumepixel">Protection des mineurs</h2>
                    <div class="mt-4  bg-gray-50 p-4">
                        <ul class="list-disc space-y-2 pl-5 text-sm text-gray-700">
                            <li><span class="font-medium">Âge minimum :</span> 18 ans (16 ans avec accord parental).
                            </li>
                            <li><span class="font-medium">Signalement :</span> Tout compte suspect (mineur non
                                accompagné) sera suspendu.</li>
                        </ul>
                    </div>
                </section>

                <!-- Données personnelles -->
                <section>
                    <h2 class="text-xl font-semibold text-blue-plumepixel">Collecte des données personnelles</h2>
                    <div class="mt-4 space-y-3 text-sm text-gray-700">
                        <p>Le site Plume &amp; Pixel peut collecter des données personnelles nécessaires à son
                            fonctionnement, notamment :</p>
                        <ul class="list-disc space-y-2 pl-5">
                            <li>Identité (nom, prénom, pseudo)</li>
                            <li>Adresse e-mail</li>
                            <li>Œuvres et messages échangés via la plateforme</li>
                        </ul>

                        <p>
                            Ces informations sont traitées conformément au Règlement Général sur la Protection des
                            Données (RGPD) et à la loi
                            Informatique et Libertés.
                        </p>

                        <p class="font-medium text-black">Les données sont utilisées exclusivement pour :</p>
                        <ul class="list-disc space-y-2 pl-5">
                            <li>La création et la gestion du compte utilisateur,</li>
                            <li>L’accès aux fonctionnalités (publication, messagerie),</li>
                            <li>L’amélioration du service.</li>
                        </ul>

                        <p>
                            Aucune donnée n’est cédée à des tiers sans consentement explicite.
                            Pour plus d’informations sur la gestion de vos données, consultez notre
                            <RouterLink to="/politique-confidentialite"
                                class="underline decoration-gray-300 underline-offset-4 hover:decoration-gray-900">
                                Politique de confidentialité
                            </RouterLink>.
                        </p>
                    </div>
                </section>

                <!-- Footer -->
                <footer class="border-t border-gray-200 pt-6">
                    <p class="text-xs text-gray-500">
                        © {{ new Date().getFullYear() }} Plume &amp; Pixel — Mentions légales.
                    </p>
                </footer>
            </section>
        </div>
    </main>
</template>
