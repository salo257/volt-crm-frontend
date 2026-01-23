import { defineStore } from 'pinia';

export const useUIStore = defineStore('ui', {
  state: () => ({
    isSidebarCollapsed: localStorage.getItem('sidebarCollapsed') === 'true',
  }),
  actions: {
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
      localStorage.setItem('sidebarCollapsed', this.isSidebarCollapsed);
    },
  },
});
