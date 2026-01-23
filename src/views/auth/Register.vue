<template>
  <div class="auth-container">
    <Toast />

    <div class="auth-card">
      <div class="auth-header">
        <img :src="logo" alt="Logo" class="auth-logo" />
        <h2>Créer un compte</h2>
        <p class="auth-subtitle">Rejoignez notre plateforme</p>
      </div>

      <form @submit.prevent="register" class="auth-form">
        <div class="form-row">
          <div class="input-group">
            <label>Prénom</label>
            <input
              v-model="form.firstName"
              type="text"
              class="form-input"
              :class="{ 'is-invalid': errors.firstName }"
              required
            />
            <span class="error-text" v-if="errors.firstName">{{
              errors.firstName
            }}</span>
          </div>

          <div class="input-group">
            <label>Nom</label>
            <input
              v-model="form.lastName"
              type="text"
              class="form-input"
              :class="{ 'is-invalid': errors.lastName }"
              required
            />
            <span class="error-text" v-if="errors.lastName">{{
              errors.lastName
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
            required
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

        <div class="input-group">
          <label>Mot de passe</label>
          <input
            v-model="form.password"
            type="password"
            class="form-input"
            :class="{ 'is-invalid': errors.password }"
            required
          />
          <span class="error-text" v-if="errors.password">{{
            errors.password
          }}</span>
        </div>

        <div class="input-group">
          <label>Confirmer le mot de passe</label>
          <input
            v-model="form.password_confirmation"
            type="password"
            class="form-input"
            :class="{ 'is-invalid': errors.password_confirmation }"
            required
          />
          <span class="error-text" v-if="errors.password_confirmation">
            {{ errors.password_confirmation }}
          </span>
        </div>

        <button type="submit" class="submit-btn" :disabled="isLoading">
          <span v-if="!isLoading">S'inscrire</span>
          <div v-else class="loading-spinner"></div>
        </button>

        <p class="auth-links">
          Déjà inscrit? <router-link to="/login">Se connecter</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import { useToastCustom } from "../../utils/toast-custom";
import logo from "../../assets/img/logo.jpg";

const router = useRouter();
const authStore = useAuthStore();
const toast = useToastCustom();

const isLoading = ref(false);
const errors = ref({});

const form = ref({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  password_confirmation: "",
});

async function register() {
  if (isLoading.value) return;

  errors.value = {};
  isLoading.value = true;

  try {
    if (form.value.password !== form.value.password_confirmation) {
      errors.value.password_confirmation =
        "Les mots de passe ne correspondent pas";
      return;
    }

    const success = await authStore.register(form.value);

    if (success) {
      toast.success("Inscription réussie! Bienvenue!");
      router.push("/dashboard");
    } else {
      toast.error("Erreur lors de l'inscription");
    }
  } catch (error) {
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors;
    } else {
      toast.error("Une erreur est survenue");
    }
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: var(--light-gray);
}

.auth-card {
  width: 100%;
  max-width: 600px;
  background: var(--white);
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  padding: 2.5rem;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-logo {
  width: 80px;
  margin-bottom: 1.5rem;
}

.auth-header h2 {
  color: var(--primary-color);
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
}

.auth-subtitle {
  color: var(--text-light);
  font-size: 0.95rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.input-group {
  margin-bottom: 1.25rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-dark);
  font-size: 0.9rem;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
  background: var(--white);
}

.form-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(2, 26, 46, 0.1);
}

.form-input.is-invalid {
  border-color: var(--danger-color);
}

.error-text {
  color: var(--danger-color);
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.submit-btn {
  width: 100%;
  padding: 0.875rem;
  background: var(--primary-color);
  color: var(--white);
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 1rem;
}

.submit-btn:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--white);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto;
}

.auth-links {
  text-align: center;
  margin-top: 1.5rem;
  color: var(--text-light);
  font-size: 0.9rem;
}

.auth-links a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}

.auth-links a:hover {
  text-decoration: underline;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .auth-card {
    padding: 2rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
