<template>
  <div class="page-header mb-4">
    <div class="header-content">
      <div class="header-left">
        <h1 class="page-title text-navy">{{ title }}</h1>
        <p v-if="subtitle" class="page-subtitle text-muted">{{ subtitle }}</p>
      </div>
      <div class="header-right d-flex gap-2">
        <slot name="actions">
          <button
            v-if="showAdd"
            class="btn btn-volt-primary shadow-sm"
            @click="$emit('add')"
          >
            <i class="fas fa-plus me-2"></i> {{ addLabel }}
          </button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  subtitle: String,
  showAdd: {
    type: Boolean,
    default: true,
  },
  addLabel: {
    type: String,
    default: "Ajouter",
  },
});

defineEmits(["add"]);
</script>

<style scoped>
.page-header {
  padding: 1rem 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: 0.9rem;
  margin: 0.25rem 0 0;
}

.btn-volt-primary {
  background-color: var(--primary-color);
  color: #fff;
  border-radius: 10px;
  padding: 0.6rem 1.25rem;
  font-weight: 600;
  border: none;
  transition: all 0.2s;
}

.btn-volt-primary:hover {
  background-color: var(--primary-dark);
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .header-right {
    width: 100%;
  }

  .header-right .btn {
    width: 100%;
  }
}
</style>
