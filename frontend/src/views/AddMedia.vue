<script setup>
import MyButton from '@/components/MyButton.vue';
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

// Form Data
const title = ref('');
const description = ref('');
const type = ref('image');
const content = ref('');
const tags = ref('');
const selectedFile = ref(null);
const filePreview = ref(null);
const fileInput = ref(null); // Ref for the hidden file input

// Specific for logic
const parentTitle = ref('');

// Privacy settings
const isPublic = ref(true);
const allowCollaboration = ref(true);

// State
const isSubmitting = ref(false);

const isCollaborating = computed(() => !!route.query.parent_id);

function handlePublicChange() {
  if (!isPublic.value) {
    allowCollaboration.value = false;
  }
}

// Watchers for type changes to clear file if needed or adjust logic
watch(type, (newType) => {
    // Reset preview if switching types incompatible? 
    // For now we keep it simple.
});

onMounted(async () => {
    // Si on répond à une œuvre, on récupère son titre pour l'affichage
    if (route.query.parent_id) {
        try {
            const res = await fetch(`http://localhost:3000/api/media/${route.query.parent_id}`);
            if (res.ok) {
                const data = await res.json();
                parentTitle.value = data.title;
            }
        } catch (e) {
            console.error("Erreur récup parent", e);
        }
    }

    // Force privé si le compte l'est
    if (userStore.user?.is_private) {
        isPublic.value = false;
        allowCollaboration.value = false;
    }
});

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  selectedFile.value = file;
  
  // Create preview
  if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
          filePreview.value = { type: 'image', src: e.target.result };
      };
      reader.readAsDataURL(file);
  } else if (file.type.startsWith('video/')) {
    filePreview.value = { type: 'video', name: file.name };
  } else if (file.type.startsWith('audio/')) {
    filePreview.value = { type: 'audio', name: file.name };
  } else {
    filePreview.value = { type: 'file', name: file.name };
  }
}

function triggerFileInput() {
    fileInput.value.click();
}

async function submit() {
  if (isSubmitting.value) return; 
  isSubmitting.value = true;

  const formData = new FormData();
  formData.append('title', title.value);
  formData.append('description', description.value);
  formData.append('type', type.value);
  
  // If 'text' type, we send content
  if (type.value === 'text') {
      formData.append('content', content.value);
  }

  formData.append('tags', tags.value);
  
  // Gestion de la collaboration (parent_id)
  const parentId = route.query.parent_id;
  if (parentId) {
    formData.append('parent_id', parentId);
  }

  if (selectedFile.value) {
    formData.append('file', selectedFile.value);
  }

  // Privacy
  formData.append('is_public', isPublic.value);
  formData.append('allow_collaboration', allowCollaboration.value);

  try {
    const res = await fetch('http://localhost:3000/api/media', {
      method: 'POST',
      credentials: 'include',
      body: formData
    });

    if (res.ok) {
      const result = await res.json();
      console.log("Success:", result);
      router.push('/');
    } else {
      const err = await res.json();
      console.error("Erreur serveur:", err);
      alert("Erreur : " + (err.error || err.message || "Erreur inconnue"));
    }
  } catch (error) {
    console.error("Erreur réseau:", error);
    alert("Erreur de connexion au serveur");
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="px-8 lg:px-24 py-10 max-w-7xl mx-auto text-gray-900">
    
    <!-- HEADER -->
    <header class="mb-16">
        <h1 class="text-3xl md:text-5xl font-['PlumePixel'] mb-3">
            <span v-if="isCollaborating">Collaborer sur "<span class="text-blue-plumepixel">{{ parentTitle || '...' }}</span>"</span>
            <span v-else>Publier une oeuvre</span>
        </h1>
        <p class="text-sm text-gray-500">
            Toute oeuvre doit respecter les règles définies dans les <a href="#" class="text-blue-600 underline">Conditions générales d'utilisation</a>
        </p>
    </header>

    <form @submit.prevent="submit" class="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
        
        <!-- COLONNE GAUCHE -->
        <div class="space-y-10">
            
            <!-- SECTION INFORMATIONS -->
            <section class="space-y-6">
                <h2 class="text-2xl font-['PlumePixel'] mb-6">Informations générales</h2>

                <!-- Titre -->
                <div class="group">
                    <label class="block font-bold mb-2 text-sm uppercase tracking-wide text-blue-plumepixel">Titre</label>
                    <input 
                        v-model="title" 
                        required
                        class="w-full border-1 border-blue-plumepixel p-3 font-medium focus:outline-none focus:border-black transition-colors"
                        type="text"
                    >
                </div>

                <!-- Nature (Type) -->
                <div class="group">
                    <label class="block font-bold mb-2 text-sm uppercase tracking-wide text-blue-plumepixel">Nature</label>
                    <div class="relative">
                        <select 
                            v-model="type"
                            class="w-full border-1 border-blue-plumepixel p-3 appearance-none bg-white font-medium focus:outline-none focus:border-black transition-colors cursor-pointer"
                        >
                            <option value="image">Image</option>
                            <option value="text">Texte</option>
                            <option value="audio">Audio</option>
                            <option value="video">Vidéo</option>
                        </select>
                        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
                            <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>

                <!-- Description -->
                <div class="group">
                    <label class="block font-bold mb-2 text-sm uppercase tracking-wide text-blue-plumepixel">Description</label>
                    <textarea 
                        v-model="description" 
                        class="w-full border-1 border-blue-plumepixel p-3 h-32 font-medium focus:outline-none focus:border-black transition-colors resize-none"
                        placeholder="Parlez un peu de cette oeuvre ! Comment l'avez vous faite, pourquoi ? Quelque chose que votre audience pourrait vouloir savoir."
                    ></textarea>
                </div>

                <!-- Tags -->
                <div class="group">
                    <label class="block font-bold mb-2 text-sm uppercase tracking-wide text-blue-plumepixel">Tags</label>
                    <div class="text-xs text-gray-500 mb-2">Sans espaces, séparés par des virgules (lettres et chiffres seulement). Un bon tag est un mot qui décrit votre oeuvre ou une partie de celle-ci.</div>
                    <input 
                        v-model="tags" 
                        placeholder="paysage, portrait, personnage, naturel, urbain, abstrait..."
                        class="w-full border-1 border-blue-plumepixel p-3 font-medium focus:outline-none focus:border-black transition-colors"
                        type="text"
                    >
                </div>

                <!-- Contenu Textuel (Si Type = Texte) -->
                <div v-if="type === 'text'" class="group">
                    <label class="block font-bold mb-2 text-sm uppercase tracking-wide text-blue-plumepixel">Votre Texte</label>
                    <textarea 
                        v-model="content" 
                        required
                        class="w-full border-1 border-blue-plumepixel p-3 h-64 font-medium focus:outline-none focus:border-black transition-colors font-mono"
                        placeholder="Écrivez votre texte ici..."
                    ></textarea>
                </div>

            </section>

            <!-- SECTION CONFIDENTIALITÉ -->
            <section class="space-y-6 pt-6">
                <h2 class="text-2xl font-['PlumePixel'] mb-6">Confidentialité</h2>

                <!-- Public Toggle -->
                <div v-if="!userStore.user?.is_private" class="flex items-start justify-between group cursor-pointer" @click="isPublic = !isPublic; handlePublicChange()">
                    <div>
                        <div class="flex items-center gap-2 font-bold text-blue-plumepixel text-sm uppercase mb-1">
                            <span class="flex items-center gap-2">
                                <svg v-if="isPublic" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                  <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                                </svg>
                                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" />
                                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.742L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                </svg>
                                Public
                            </span>
                        </div>
                        <p class="text-xs text-gray-500 max-w-sm">Tout les utilisateurs peuvent consulter cette oeuvre.</p>
                    </div>
                    <!-- Custom Toggle UI -->
                     <div class="w-12 h-6 rounded-full p-1 duration-300 ease-in-out flex items-center" :class="isPublic ? 'bg-blue-600 justify-end' : 'bg-gray-300 justify-start'">
                        <div class="bg-white w-4 h-4 rounded-full shadow-md transform duration-300"></div>
                    </div>
                </div>

                <!-- Collaboration Toggle -->
                <div v-if="isPublic" class="flex items-start justify-between group cursor-pointer mt-4" @click="allowCollaboration = !allowCollaboration">
                     <div>
                        <div class="flex items-center gap-2 font-bold text-blue-plumepixel text-sm uppercase mb-1">
                            <span class="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" />
                                </svg>
                                Collaboration Activée
                            </span>
                        </div>
                        <p class="text-xs text-gray-500 max-w-sm">Les utilisateurs pourront contribuer a votre oeuvre.</p>
                    </div>
                    <div class="w-12 h-6 rounded-full p-1 duration-300 ease-in-out flex items-center" :class="allowCollaboration ? 'bg-blue-600 justify-end' : 'bg-gray-300 justify-start'">
                        <div class="bg-white w-4 h-4 rounded-full shadow-md transform duration-300"></div>
                    </div>
                </div>

                <!-- Legal Agreement Checkbox (Visible only if collaboration is ON) -->
                <div v-if="isPublic && allowCollaboration" class="mt-6 bg-blue-50 p-4 border border-blue-100 rounded-sm">
                    <label class="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" required class="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 rounded">
                        <span class="text-sm text-gray-700">
                            <strong>Conditions de co-propriété :</strong> Je comprends qu'en activant la collaboration, j'accepte que les contributions futures soient soumises au régime de co-propriété de la plateforme (voir CGU).
                        </span>
                    </label>
                </div>

            </section>

        </div>

        <!-- COLONNE DROITE -->
        <div class="space-y-10">
            
            <section class="space-y-6">
                 <h2 class="text-2xl font-['PlumePixel'] mb-6">Votre oeuvre</h2>

                 <!-- File Upload Box -->
                 <div v-if="type !== 'text'" class="group">
                    <label class="block font-bold mb-2 text-sm uppercase tracking-wide text-blue-plumepixel">Fichier</label>
                    <p class="text-xs text-gray-500 mb-2">Formats acceptés : jpg,</p>
                    
                    <div class="border-1 border-blue-plumepixel p-1 flex items-center gap-3">
                         
                         <!-- Hidden Input pour le fichier -->
                         <input type="file" ref="fileInput" @change="handleFileUpload" class="hidden">

                         <!-- MyButton pour déclencher l'input -->
                         <MyButton 
                            type="button"
                            @click="triggerFileInput" 
                            variant="default" 
                            size="medium"
                            icon="parcourir"
                            :style="{ backgroundColor: 'var(--color-blue-plumepixel)' }"
                         >
                            Parcourir
                         </MyButton>

                         <span class="text-sm text-gray-600 truncate flex-1 font-medium">
                             {{ selectedFile ? selectedFile.name : 'Aucun fichier sélectionné' }}
                         </span>
                    </div>
                 </div>

                 <!-- PREVIEW AREA -->
                 <div class="flex gap-4 h-64">
                     <!-- Preview Placeholder -->
                     <div class="flex-1 bg-blue-50 border-2 border-blue-200 flex items-center justify-center text-blue-300 relative overflow-hidden group">
                         
                         <div v-if="filePreview && filePreview.type === 'image'" class="absolute inset-0">
                             <img :src="filePreview.src" class="w-full h-full object-contain p-2" />
                         </div>
                         <div v-else-if="filePreview" class="text-center p-4">
                             <p class="font-bold text-blue-500">{{ filePreview.name }}</p>
                             <p class="text-sm">{{ filePreview.type }}</p>
                         </div>
                         <div v-else class="text-6xl opacity-50">
                             <!-- Icone Image Placeholder -->
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                             </svg>
                         </div>
                     </div>

                     <!-- Decorative Placeholder -->
                     <div class="w-1/3 bg-blue-50 border-2 border-blue-200 flex items-center justify-center text-blue-300 hidden md:flex">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                     </div>
                 </div>

            </section>

            <!-- ACTIONS -->
            <div class="flex flex-col gap-3">
                 <!-- Publish Button with MyButton -->
                 <MyButton 
                    type="submit" 
                    :disabled="isSubmitting"
                    variant="default"
                    size="large"
                    icon="publier"
                    class="w-full justify-center"
                    :style="{ backgroundColor: 'var(--color-blue-plumepixel)' }"
                 >
                    <span v-if="isSubmitting">Envoi en cours...</span>
                    <!-- Note: Le slot par défaut remplace tout l'intérieur, mais MyButton gère l'icone via prop. 
                         Si on met du contenu dans le slot, l'icone est affichée à côté grâce au code de MyButton. -->
                    <span v-else>Publier</span>
                 </MyButton>

                 <!-- Cancel Button with MyButton -->
                 <MyButton 
                    type="button" 
                    @click="router.back()"
                    variant="transparent"
                    size="large"
                    icon="annuler"
                    class="w-full justify-center border-2 border-blue-plumepixel text-blue-plumepixel hover:bg-blue-50"
                 >
                    Annuler
                 </MyButton>
            </div>

        </div>

    </form>
  </div>
</template>

<style scoped>
/* Custom Scrollbar for textareas if needed */
textarea::-webkit-scrollbar {
  width: 8px;
}
textarea::-webkit-scrollbar-track {
  background: #f1f1f1;
}
textarea::-webkit-scrollbar-thumb {
  background: #888;
}
textarea::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
