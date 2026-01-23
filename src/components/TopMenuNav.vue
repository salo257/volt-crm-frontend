<template>
  <header class="header no-print">
    <div class="logo-section">
      <div class="logo-brand">
        <div class="v-box me-2">V</div>
        <span>VOLT</span>
      </div>
    </div>

    <div class="header-right">
      <!-- Search Bar -->
      <!-- <div class="search-bar d-none d-md-flex">
        <i class="fas fa-search"></i>
        <input type="text" placeholder="Rechercher..." />
      </div> -->

      <!-- User Profile -->
      <div class="user-profile-nav" @click="showUserMenu = !showUserMenu">
        <div class="avatar-sm">
          {{ user?.name?.charAt(0) || "U" }}
        </div>
        <div class="user-meta d-none d-sm-block">
          <span class="name">{{ user?.name }}</span>
          <span class="role">{{ user?.role }}</span>
        </div>
        <i class="fas fa-chevron-down ms-2 small"></i>

        <div class="user-dropdown-menu" v-if="showUserMenu">
          <div class="dropdown-item-custom" @click="goToProfile">
            <i class="fas fa-user-circle"></i>
            <span>Mon profil</span>
          </div>
          <hr />
          <div class="dropdown-item-custom logout" @click="logout">
            <i class="fas fa-sign-out-alt"></i>
            <span>Déconnexion</span>
          </div>
        </div>
      </div>

      <button class="mobile-toggle d-lg-none" @click="ui.toggleSidebar">
        <i class="fas fa-bars"></i>
      </button>
    </div>
  </header>
</template>

<script setup>
import { useAuthStore } from "../stores/auth";
import { useUIStore } from "../stores/ui";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const authStore = useAuthStore();
const ui = useUIStore();

const showUserMenu = ref(false);

const user = computed(() => authStore.user);

const goToProfile = () => {
  router.push({ name: "Profil" });
};

const logout = () => {
  authStore.logout();
};
</script>

<style scoped>
.header {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.8);
}

.logo-brand {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--primary-color);
  display: flex;
  align-items: center;
}

.v-box {
  width: 24px;
  height: 24px;
  border: 1.5px solid var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 0.9rem;
  border-radius: 4px;
}

.search-bar {
  background: #f1f5f9;
  padding: 8px 16px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-right: 20px;
}

.search-bar input {
  background: transparent;
  border: none;
  outline: none;
  font-size: 0.9rem;
  width: 200px;
}

.user-profile-nav {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 12px;
  transition: background 0.2s;
  position: relative;
}

.user-profile-nav:hover {
  background: #f8fafc;
}

.avatar-sm {
  width: 35px;
  height: 35px;
  background: var(--primary-color);
  color: #fff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  margin-right: 12px;
}

.user-meta {
  display: flex;
  flex-direction: column;
}

.user-meta .name {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: -4px;
}

.user-meta .role {
  font-size: 0.75rem;
  color: #64748b;
}

.user-dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: #fff;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  padding: 8px;
  width: 200px;
  margin-top: 10px;
  z-index: 2000;
}

.dropdown-item-custom {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 15px;
  border-radius: 8px;
  transition: background 0.2s;
  color: #1e293b;
}

.dropdown-item-custom:hover {
  background: #f1f5f9;
}

.dropdown-item-custom.logout {
  color: #ef4444;
}

.mobile-toggle {
  background: transparent;
  border: none;
  font-size: 1.25rem;
  color: #121858;
  padding: 10px;
}

hr {
  margin: 5px 0;
  border-color: #f1f5f9;
}
</style>
