<template>
  <LoaderComponent v-if="isLoading" />
  <BaseLayout v-if="isLogin" />
  <Login v-else />
</template>

<script setup>
import BaseLayout from "./components/BaseLayout.vue";
import { computed } from "vue";
import { useAuthStore } from "./stores/auth";
import Login from "./views/auth/Login.vue";
import LoaderComponent from "./components/LoaderComponent.vue";
import { useStore } from "vuex";
const store = useStore();
const authStore = useAuthStore();

//test git
//test git
//test git

const isLogin = computed(() => {
  return authStore.isAuthenticated;
});

const isLoading = computed(() => {
  return store.state.isLoading;
});
</script>
