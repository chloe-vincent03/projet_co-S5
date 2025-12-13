<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MyButton from "@/components/MyButton.vue";

const route = useRoute();
const router = useRouter();

const title = ref('');
const description = ref('');
const content = ref('');
const tags = ref('');
const type = ref('');
const url = ref(''); // Juste pour l'affichage, pas modifiable pour l'instant
const isPublic = ref(true);
const allowCollaboration = ref(true);

const isLoading = ref(true);

const selectedFile = ref(null);

function handleFileUpload(event) {
  selectedFile.value = event.target.files[0];
}

onMounted(async () => {
  try {
    const res = await fetch(`http://localhost:3000/api/media/${route.params.id}`, {
        credentials: 'include'
    });
    if (!res.ok) throw new Error("Erreur chargement");
    const data = await res.json();

    title.value = data.title;
    description.value = data.description || '';
    content.value = data.content || '';
    tags.value = data.tags ? data.tags.join(', ') : '';
    type.value = data.type;
    url.value = data.url;
    isPublic.value = data.is_public === 1;
    allowCollaboration.value = data.allow_collaboration === 1;

  } catch (err) {
    console.error(err);
    alert("Impossible de charger les données");
    router.push('/');
  } finally {
    isLoading.value = false;
  }
});

const isSubmitting = ref(false);

async function submit() {
  if (isSubmitting.value) return;
  isSubmitting.value = true;

  const formData = new FormData();
  formData.append('title', title.value);
  formData.append('description', description.value);
  formData.append('content', content.value);
  formData.append('tags', tags.value);
  // On renvoie le type et l'url existants pour cas où pas de modif fichier,
  // mais le backend gère aussi la priorité au fichier uploadé.
  formData.append('type', type.value);
  formData.append('url', url.value);

  if (selectedFile.value) {
    formData.append('file', selectedFile.value);
  }

  formData.append('is_public', isPublic.value ? 1 : 0);
  formData.append('allow_collaboration', allowCollaboration.value ? 1 : 0);

  try {
    const res = await fetch(`http://localhost:3000/api/media/${route.params.id}`, {
      method: 'PUT',
      // Pas de Content-Type json, FormData gère le boundary
      credentials: 'include',
      body: formData
    });

    if (res.ok) {
        // alert("Modifications enregistrées !"); // On enlève l'alert pour fluidifier
        router.push(`/oeuvre/${route.params.id}`);
    } else {
        const err = await res.json();
        alert("Erreur : " + (err.error || "Erreur inconnue"));
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
  <div class="px-12 lg:px-32 py-6">
    <MyButton
      :to="`/oeuvre/${route.params.id}`"
      icon="voir"
      size="small"
      font="inter"
      variant="default"
      class="mb-6"
      :style="{ backgroundColor: 'var(--color-blue-plumepixel)' }"
    >
      Annuler
    </MyButton>

    <h1 class="text-2xl font-['PlumePixel'] mb-6">Modifier l'œuvre</h1>

    <div v-if="isLoading">Chargement...</div>

    <form v-else @submit.prevent="submit" class="flex flex-col gap-4 max-w-xl">
        
        <div>
            <label class="block font-bold mb-1">Titre</label>
            <input v-model="title" class="border p-2 w-full rounded" required>
        </div>

        <div>
            <label class="block font-bold mb-1">Description</label>
            <textarea v-model="description" class="border p-2 w-full rounded h-32"></textarea>
        </div>

        <!-- Média actuel -->
        <div class="mb-4 p-4 border rounded bg-gray-50">
            <p class="font-bold mb-2">Média actuel :</p>
            <div v-if="type === 'image'" class="w-32 h-32 overflow-hidden mb-2">
                <img :src="url" class="object-cover w-full h-full">
            </div>
            <p class="text-xs text-gray-500 break-all">{{ url }}</p>
            
            <label class="block font-bold mt-4 mb-1">Remplacer le fichier (optionnel) :</label>
            <input type="file" @change="handleFileUpload" class="block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
            "/>
        </div>

        <div v-if="type === 'text'">
            <label class="block font-bold mb-1">Contenu (Texte)</label>
            <textarea v-model="content" class="border p-2 w-full rounded h-64"></textarea>
        </div>

        <div>
             <label class="block font-bold mb-1">Tags (séparés par virgules)</label>
             <input v-model="tags" class="border p-2 w-full rounded">
         </div>

         <!-- Privacy Toggles -->
         <div class="border-t pt-6 mt-6">
           <h3 class="font-bold text-gray-800 mb-4">Confidentialité</h3>
           
           <!-- Toggle Public -->
           <div class="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
             <div class="flex-1">
               <label class="font-medium text-gray-700">{{ isPublic ? 'Public' : 'Privé' }}</label>
               <p class="text-sm text-gray-500 mt-1">
                 {{ isPublic 
                    ? "Tout le monde peut voir cette œuvre" 
                    : "Vous seul pouvez voir cette œuvre" 
                 }}
               </p>
             </div>
             <label class="relative inline-flex items-center cursor-pointer">
               <input type="checkbox" v-model="isPublic" class="sr-only peer">
               <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
             </label>
           </div>

           <!-- Toggle Collaboration (visible seulement si Public) -->
           <div v-if="isPublic" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
             <div class="flex-1">
               <label class="font-medium text-gray-700">Collaboration Activée</label>
               <p class="text-sm text-gray-500 mt-1">
                 Les utilisateurs pourront contribuer à votre œuvre
               </p>
             </div>
             <label class="relative inline-flex items-center cursor-pointer">
               <input type="checkbox" v-model="allowCollaboration" class="sr-only peer">
               <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
             </label>
           </div>
         </div>

         <MyButton 
            type="submit" 
            size="large" 
            variant="default" 
            :disabled="isSubmitting"
            :style="{ backgroundColor: 'var(--color-blue-plumepixel)' }"
        >
            <span v-if="isSubmitting" class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2 inline-block"></span>
            <span v-if="isSubmitting">Enregistrement...</span>
            <span v-else>Enregistrer les modifications</span>
        </MyButton>

    </form>
  </div>
</template>
