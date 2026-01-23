<template>
  <div class="profile-container">
    <Toast />

    <div class="profile-card">
      <div class="profile-header">
        <div class="profile-avatar">
          <img :src="userAvatar" :alt="user?.name || 'Profile'" />
          <label class="avatar-upload">
            <input type="file" @change="handleAvatarChange" accept="image/*" />
            <i class="fas fa-camera"></i>
          </label>
        </div>
        <h2 class="profile-name">
          {{ user?.first_name }} {{ user?.last_name }}
        </h2>
        <p class="profile-role">{{ user?.role || "Utilisateur" }}</p>
      </div>

      <form @submit.prevent="updateProfile" class="profile-form">
        <div class="form-row">
          <div class="input-group">
            <label>Prénom</label>
            <input
              v-model="form.first_name"
              type="text"
              class="form-input"
              :class="{ 'is-invalid': errors.first_name }"
            />
            <span class="error-text" v-if="errors.first_name">{{
              errors.first_name
            }}</span>
          </div>

          <div class="input-group">
            <label>Nom</label>
            <input
              v-model="form.last_name"
              type="text"
              class="form-input"
              :class="{ 'is-invalid': errors.last_name }"
            />
            <span class="error-text" v-if="errors.last_name">{{
              errors.last_name
            }}</span>
          </div>
        </div>

        <div class="input-group">
          <label>Email</label>
          <input
            v-model="form.email"
            type="email"
            class="form-input"
            :class="{ 'is-invalid': errors.email }"
          />
          <span class="error-text" v-if="errors.email">{{ errors.email }}</span>
        </div>

        <div class="input-group">
          <label>Téléphone</label>
          <input
            v-model="form.phone"
            type="tel"
            class="form-input"
            :class="{ 'is-invalid': errors.phone }"
          />
          <span class="error-text" v-if="errors.phone">{{ errors.phone }}</span>
        </div>

        <div class="password-section">
          <h3>Changer le mot de passe</h3>
          <div class="input-group">
            <label>Mot de passe actuel</label>
            <input
              v-model="form.current_password"
              type="password"
              class="form-input"
              :class="{ 'is-invalid': errors.current_password }"
            />
            <span class="error-text" v-if="errors.current_password">{{
              errors.current_password
            }}</span>
          </div>

          <div class="input-group">
            <label>Nouveau mot de passe</label>
            <input
              v-model="form.new_password"
              type="password"
              class="form-input"
              :class="{ 'is-invalid': errors.new_password }"
            />
            <span class="error-text" v-if="errors.new_password">{{
              errors.new_password
            }}</span>
          </div>

          <div class="input-group">
            <label>Confirmer le nouveau mot de passe</label>
            <input
              v-model="form.new_password_confirmation"
              type="password"
              class="form-input"
              :class="{ 'is-invalid': errors.new_password_confirmation }"
            />
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="submit-btn" :disabled="isLoading">
            <span v-if="!isLoading">Enregistrer les modifications</span>
            <div v-else class="loading-spinner"></div>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useAuthStore } from "../../stores/auth";
import { useToastCustom } from "../../utils/toast-custom";
import defaultAvatar from "../../assets/img/default-avatar.png";

const authStore = useAuthStore();
const toast = useToastCustom();

const isLoading = ref(false);
const errors = ref({});
const user = computed(() => authStore.user);

const form = ref({
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  current_password: "",
  new_password: "",
  new_password_confirmation: "",
});

const userAvatar = computed(() => {
  return user.value?.avatar || defaultAvatar;
});

onMounted(() => {
  // Pre-fill form with user data
  if (user.value) {
    form.value = {
      first_name: user.value.first_name || "",
      last_name: user.value.last_name || "",
      email: user.value.email || "",
      phone: user.value.phone || "",
      current_password: "",
      new_password: "",
      new_password_confirmation: "",
    };
  }
});

async function handleAvatarChange(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    isLoading.value = true;
    await authStore.updateAvatar(file);
    toast.success("Photo de profil mise à jour");
  } catch (error) {
    toast.error("Erreur lors de la mise à jour de la photo");
  } finally {
    isLoading.value = false;
  }
}

async function updateProfile() {
  if (isLoading.value) return;

  errors.value = {};
  isLoading.value = true;

  try {
    // Validate password confirmation if new password is provided
    if (
      form.value.new_password &&
      form.value.new_password !== form.value.new_password_confirmation
    ) {
      errors.value.new_password_confirmation =
        "Les mots de passe ne correspondent pas";
      return;
    }

    await authStore.updateProfile(form.value);
    toast.success("Profil mis à jour avec succès");
  } catch (error) {
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors;
    } else {
      toast.error("Erreur lors de la mise à jour du profil");
    }
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  padding: 2rem;
  background: var(--light-gray);
}

.profile-card {
  max-width: 800px;
  margin: 0 auto;
  background: var(--white);
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  padding: 2.5rem;
}

.profile-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.profile-avatar {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 1.5rem;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid var(--primary-color);
}

.avatar-upload {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 36px;
  height: 36px;
  background: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.avatar-upload:hover {
  transform: scale(1.1);
}

.avatar-upload input {
  display: none;
}

.avatar-upload i {
  color: var(--white);
  font-size: 16px;
}

.profile-name {
  font-size: 1.75rem;
  color: var(--text-dark);
  margin-bottom: 0.5rem;
}

.profile-role {
  color: var(--text-light);
  font-size: 1rem;
}

.password-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

.password-section h3 {
  color: var(--text-dark);
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
}

/* Reuse existing form styles from your Login component */
.form-row,
.input-group,
.form-input,
.submit-btn,
.error-text {
  /* ...existing styles... */
}

@media (max-width: 640px) {
  .profile-card {
    padding: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .profile-avatar {
    width: 100px;
    height: 100px;
  }
}
</style>
