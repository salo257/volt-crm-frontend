<template>
  <div class="dropdown">
    <button
      class="btn btn-secondary btn-sm dropdown-toggle"
      type="button"
      data-bs-toggle="dropdown"
      aria-expanded="false"
    >
      <i class="fas fa-filter"></i>
      Filtrer
      <span v-if="activeFilterCount > 0" class="badge bg-primary ms-1">
        {{ activeFilterCount }}
      </span>
    </button>
    <div class="dropdown-menu dropdown-menu-end p-3" style="min-width: 300px">
      <div class="mb-2 d-flex justify-content-between align-items-center">
        <h6 class="mb-0">Filtrer:</h6>
        <button
          v-if="activeFilterCount > 0"
          class="btn btn-link btn-sm p-0"
          @click="clearAll"
        >
          Réinitialiser
        </button>
      </div>

      <div v-for="column in columns" :key="column.key" class="mb-3">
        <label class="form-label small">{{ column.label }}</label>
        <input
          v-model="localFilters[column.key]"
          type="text"
          class="form-control"
          :placeholder="`Filtrer par ${column.label.toLowerCase()}...`"
          @input="handleFilterChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  columns: {
    type: Array,
    default: () => [],
  },
  filters: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["filter-change", "clear-filters"]);

const localFilters = ref({ ...props.filters });

const activeFilterCount = computed(() => {
  return Object.values(localFilters.value).filter(
    (value) => value && value !== ""
  ).length;
});

const handleFilterChange = () => {
  emit("filter-change", { ...localFilters.value });
};

const clearAll = () => {
  localFilters.value = {};
  emit("clear-filters");
};

watch(
  () => props.filters,
  (newFilters) => {
    localFilters.value = { ...newFilters };
  },
  { deep: true }
);
</script>
