<script setup>
import MyButton from '@/components/MyButton.vue';
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const title = ref('');
const description = ref('');
const type = ref('image');
const url = ref('');
const content = ref('');
const tags = ref('');
const selectedFile = ref(null);
const parentTitle = ref('');

// Privacy settings
const isPublic = ref(true);
const allowCollaboration = ref(true);

function handlePublicChange() {
  if (!isPublic.value) {
    allowCollaboration.value = false;
  }
}

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
});

function handleFileUpload(event) {
  selectedFile.value = event.target.files[0];
}

  const isSubmitting = ref(false);

  async function submit() {
  if (isSubmitting.value) return; 
  isSubmitting.value = true;

  const formData = new FormData();
  formData.append('title', title.value);
  formData.append('description', description.value);
  formData.append('type', type.value);
  // Si l'utilisateur a rentré une URL manuelle, on l'envoie aussi
  formData.append('url', url.value);
  formData.append('content', content.value);
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
      credentials: 'include', // 🔥 Important pour envoyer le cookie de session
      // Ne PAS mettre 'Content-Type': 'application/json' avec FormData, 
      // le navigateur le gère tout seul (multipart/form-data)
      body: formData
    });

    if (res.ok) {
      const result = await res.json();
      console.log("Success:", result);
      // alert("Œuvre ajoutée !"); // On enlève l'alert pour fluidifier
      router.push('/');
    } else {
      const err = await res.json();
      console.error("Erreur serveur:", err);
      // Gère les différents formats d'erreur (error, message, ou success:false+message)
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
  <h1>Ajouter une œuvre</h1>
  <div v-if="$route.query.parent_id" class="bg-blue-100 text-blue-800 p-2 rounded mb-4">
    Collaborer sur "<strong>{{ parentTitle || ('#' + $route.query.parent_id) }}</strong>"
  </div>

  <form @submit.prevent="submit">

    <label>Titre :</label>
    <input v-model="title" required>

    <label>Description :</label>
    <textarea v-model="description"></textarea>

    <label>Type :</label>
    <select v-model="type">
      <option value="image">Image</option>
      <option value="audio">Audio</option>
      <option value="video">Vidéo</option>
      <option value="text">Texte</option>
    </select>

    <!-- Choix : soit une URL externe, soit un fichier -->
    <div style="margin: 10px 0; border: 1px solid #ccc; padding: 10px;">
        <p><strong>Image / Média :</strong></p>
        
        <label>Téléverser un fichier :</label>
        <input type="file" @change="handleFileUpload">
    </div>

    <label>Contenu textuel (optionnel) :</label>
    <textarea v-model="content"></textarea>

    <label>Tags (séparés par virgules) :</label>
    <input v-model="tags" placeholder="art, nature, projet...">

    <!-- SECTION CONFIDENTIALITÉ -->
    <div class="mt-8 mb-8 border-l-4 border-blue-plumepixel pl-4">
      <h2 class="text-xl font-['PlumePixel'] mb-4">Confidentialité</h2>
      
      <!-- Toggle Public -->
      <div class="flex items-center justify-between mb-4">
        <div>
          <div class="flex items-center gap-2 font-bold text-blue-plumepixel">
             <span v-if="isPublic">Public</span>
             <span v-else>Privé</span>
          </div>
          <p class="text-sm text-gray-500 max-w-sm">
            {{ isPublic 
               ? "Tout les utilisateurs peuvent consulter cette oeuvre." 
               : "Vous seul pourrez voir cette oeuvre sur votre profil." 
            }}
          </p>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" v-model="isPublic" @change="handlePublicChange" class="sr-only peer">
          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      <!-- Toggle Collaboration (visible seulement si Public) -->
      <div v-if="isPublic" class="flex items-center justify-between">
        <div>
          <div class="flex items-center gap-2 font-bold text-blue-plumepixel">
             <span>Collaboration Activée</span>
          </div>
          <p class="text-sm text-gray-500 max-w-sm">
            Les utilisateurs pourront contribuer a votre oeuvre.
          </p>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" v-model="allowCollaboration" class="sr-only peer">
          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
    </div>

    <MyButton type="submit" 
            :disabled="isSubmitting"
            :style="{ backgroundColor: 'var(--color-blue-plumepixel)' }"
            variant="default">
      <span v-if="isSubmitting" class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
      <span v-if="isSubmitting">Envoi en cours...</span>
      <span v-else>Ajouter</span>
    </MyButton>
  </form>
</template>
