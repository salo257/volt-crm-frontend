<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="logo-container">
        <div class="logo-box">
          <span class="logo-v">V</span>
        </div>
        <div class="logo-text-group" v-if="!ui.isSidebarCollapsed">
          <span class="logo-main text-white">VOLT</span>
          <span class="logo-sub">BEST SOLUTIONS</span>
        </div>
      </div>
      <button class="toggle-btn" @click="ui.toggleSidebar">
        <i
          :class="
            ui.isSidebarCollapsed
              ? 'fas fa-chevron-right'
              : 'fas fa-chevron-left'
          "
        ></i>
      </button>
    </div>

    <nav class="sidebar-nav">
      <ul class="nav-list">
        <li v-for="link in visibleLinks" :key="link.to" class="nav-item">
          <router-link
            :to="link.to"
            class="nav-link"
            :class="{ active: route.path === link.to }"
            :title="ui.isSidebarCollapsed ? link.text : ''"
          >
            <div class="icon-wrapper">
              <i :class="link.icon"></i>
            </div>
            <span class="link-text" v-if="!ui.isSidebarCollapsed">{{
              link.text
            }}</span>
            <div v-if="route.path === link.to" class="active-indicator"></div>
          </router-link>
        </li>
      </ul>
    </nav>

    <!-- <div class="sidebar-footer" v-if="!ui.isSidebarCollapsed">
      <div class="user-info">
        <div class="avatar">{{ auth.user?.name?.charAt(0) || "U" }}</div>
        <div class="details">
          <p class="name">{{ auth.user?.name || "Utilisateur" }}</p>
          <p class="role">{{ auth.user?.role || "Admin" }}</p>
        </div>
      </div>
    </div>-->
  </aside>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useUIStore } from "@/stores/ui";

const route = useRoute();
const auth = useAuthStore();
const ui = useUIStore();

const sidebarLinks = [
  {
    to: "/dashboard",
    icon: "fas fa-th-large",
    text: "Tableau de Bord",
    roles: ["admin", "support", "marketing", "finance"],
  },
  {
    to: "/clients",
    icon: "fas fa-user-friends",
    text: "Clients",
    roles: ["admin", "support", "marketing", "finance"],
  },
  {
    to: "/factures",
    icon: "fas fa-file-invoice-dollar",
    text: "Factures",
    roles: ["admin", "finance"],
  },
  {
    to: "/assistances",
    icon: "fas fa-headset",
    text: "Assistances",
    roles: ["admin", "support", "finance"],
  },
  {
    to: "/marketing",
    icon: "fas fa-bullhorn",
    text: "Marketing",
    roles: ["admin", "marketing"],
  },
  {
    to: "/communication",
    icon: "fas fa-envelope-open-text",
    text: "Communication",
    roles: ["admin", "support"],
  },
  {
    to: "/administration",
    icon: "fas fa-cog",
    text: "Administration",
    roles: ["admin"],
  },
];

const visibleLinks = computed(() =>
  sidebarLinks.filter((l) => {
    if (!l.roles || !l.roles.length) return true;
    return auth.hasAnyRole ? auth.hasAnyRole(l.roles) : true;
  })
);
</script>

<style scoped>
.sidebar-header {
  padding: 24px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80px;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-box {
  width: 32px;
  height: 32px;
  border: 2px solid var(--secondary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.logo-v {
  color: var(--secondary-color);
  font-weight: 900;
  font-size: 1.2rem;
}

.logo-text-group {
  display: flex;
  flex-direction: column;
  line-height: 1;
}

.logo-main {
  font-weight: 800;
  font-size: 1.1rem;
  letter-spacing: 1px;
}

.logo-sub {
  font-size: 0.5rem;
  color: var(--secondary-color);
  font-weight: 600;
  white-space: nowrap;
}

.toggle-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 5px;
  transition: color 0.2s;
}

.toggle-btn:hover {
  color: #fff;
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin: 4px 12px;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  border-radius: 12px;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.nav-link.active {
  background: var(--secondary-color);
  color: var(--primary-color);
  font-weight: 700;
}

.icon-wrapper {
  width: 24px;
  display: flex;
  justify-content: center;
  font-size: 1.1rem;
  margin-right: 16px;
}

.sidebar.collapsed .icon-wrapper {
  margin-right: 0;
}

.link-text {
  white-space: nowrap;
  font-size: 0.95rem;
}

.active-indicator {
  display: none; /* Removed in favor of full background active state */
}

.sidebar-footer {
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 38px;
  height: 38px;
  background: var(--secondary-color);
  color: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.details .name {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0;
}

.details .role {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

/* Scrollbar Style */
.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}
.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}
.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
</style>
