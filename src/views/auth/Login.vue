<template>
  <div class="auth-container">
    <Toast />

    <div class="auth-card">
      <div class="auth-header">
        <img :src="logo" alt="Logo" class="auth-logo" />
        <h2>Connexion</h2>
        <p class="auth-subtitle">Accédez à votre compte</p>
      </div>

      <form @submit.prevent="login" class="auth-form">
        <div class="input-group">
          <label>Email</label>
          <input
            v-model="email"
            type="email"
            class="form-input"
            :class="{ 'is-invalid': errors.email }"
            :disabled="isLoading"
            required
          />
          <span class="error-text" v-if="errors.email">{{ errors.email }}</span>
        </div>

        <div class="input-group">
          <label>Mot de passe</label>
          <input
            v-model="password"
            type="password"
            class="form-input"
            :class="{ 'is-invalid': errors.password }"
            :disabled="isLoading"
            required
          />
          <span class="error-text" v-if="errors.password">{{
            errors.password
          }}</span>
        </div>

        <button type="submit" class="submit-btn" :disabled="isLoading">
          <span v-if="!isLoading">Se connecter</span>
          <div v-else class="loading-spinner"></div>
        </button>

        <p class="auth-links">
          Pas encore de compte?
          <router-link to="/register">S'inscrire</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useToastCustom } from "../../utils/toast-custom";
import { useAuthStore } from "../../stores/auth";
import logo from "../../assets/img/logo.jpg";

const authStore = useAuthStore();
const toast = useToastCustom();

const email = ref("");
const password = ref("");
const isLoading = ref(false);
const errors = ref({});

async function login() {
  if (isLoading.value) return;

  errors.value = {};
  isLoading.value = true;

  try {
    await authStore.login(email.value, password.value);
    toast.success("Connexion réussie!");
  } catch (error) {
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors;
    } else {
      errors.value.email = "Email ou mot de passe incorrect";
      toast.error("Email ou mot de passe incorrect");
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
  max-width: 450px;
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

.form-input:disabled {
  background-color: var(--light-gray);
  cursor: not-allowed;
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
}
</style>
