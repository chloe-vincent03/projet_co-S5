<template>
  <div class="">
    <div class="">
      <h1 class="">Mon Profil</h1>

      <div v-if="user">
        <p><strong>Nom d'utilisateur :</strong> {{ user.username }}</p>
        <p><strong>Email :</strong> {{ user.email }}</p>
        <p><strong>Bio :</strong> {{ user.bio}}</p>
        <p v-if="user.is_admin === 1" class="">
          Admin ✔️
        </p>
      </div>

      <button
        @click="logout"
        class=""
      >
        Se déconnecter
      </button>

      <button
        @click="deleteAcc"
        class=""
      >
        Supprimer mon compte 
      </button>
      <button @click="goToSettings" class="">
  ⚙️ Paramètres
</button>


      <p v-if="message" class="">
        {{ message }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from "../stores/user";
import { useRouter } from "vue-router";
import { ref, computed } from "vue";

const store = useUserStore();
const router = useRouter();

const message = ref("");

// user réactif basé sur le store
const user = computed(() => store.user);

async function logout() {
  await store.logout();
  router.push("/login");
}

async function deleteAcc() {
  const ok = confirm(
    "Voulez-vous vraiment supprimer votre compte ? Cette action est irréversible."
  );
  if (!ok) return;

  const res = await store.deleteAccount();

  if (res.success) {
    router.push("/register");
  } else {
    message.value = res.message || "Erreur lors de la suppression.";
  }
}
function goToSettings() {
  router.push("/profil/settings");
}

</script>
