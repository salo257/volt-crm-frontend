<template>
  <TopMenuNav />

  <div
    class="app-container"
    :class="{ 'sidebar-collapsed': ui.isSidebarCollapsed }"
  >
    <!-- Sidebar -->
    <SideBard />
    <!-- Main Content -->
    <main class="main-content">
      <Toast />

      <router-view />
    </main>
  </div>

  <!-- Modal d'exemple -->
  <div class="modal-overlay" id="modal">
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">Détails de la parcelle</h3>
        <button class="modal-close" onclick="closeModal()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <p>Contenu détaillé de la parcelle sélectionnée...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import TopMenuNav from "./TopMenuNav.vue";
import SideBard from "./SideBard.vue";
import Toast from "primevue/toast";
import { useUIStore } from "../stores/ui";

const ui = useUIStore();
</script>
