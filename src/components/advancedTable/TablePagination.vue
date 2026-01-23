<template>
  <nav aria-label="Table pagination">
    <div class="row align-items-center">
      <div class="col-md-6">
        <small class="text-muted">
          Affichage de {{ pagination.from }} à {{ pagination.to }} sur
          {{ pagination.total }} éléments
        </small>
      </div>
      <div class="col-md-6">
        <ul class="pagination pagination-sm justify-content-end mb-0">
          <li
            class="page-item"
            :class="{ disabled: pagination.current_page === 1 }"
          >
            <button
              class="page-link"
              @click="changePage(pagination.current_page - 1)"
              :disabled="pagination.current_page === 1"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
          </li>

          <li
            v-for="page in visiblePages"
            :key="page"
            class="page-item"
            :class="{ active: page === pagination.current_page }"
          >
            <button class="page-link" @click="changePage(page)">
              {{ page }}
            </button>
          </li>

          <li
            class="page-item"
            :class="{
              disabled: pagination.current_page === pagination.last_page,
            }"
          >
            <button
              class="page-link"
              @click="changePage(pagination.current_page + 1)"
              :disabled="pagination.current_page === pagination.last_page"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  pagination: {
    type: Object,
    required: true,
  },
  maxVisiblePages: {
    type: Number,
    default: 5,
  },
});

const emit = defineEmits(["page-change"]);

const visiblePages = computed(() => {
  const pages = [];
  const half = Math.floor(props.maxVisiblePages / 2);

  let start = Math.max(1, props.pagination.current_page - half);
  let end = Math.min(
    props.pagination.last_page,
    start + props.maxVisiblePages - 1
  );

  if (end - start + 1 < props.maxVisiblePages) {
    start = Math.max(1, end - props.maxVisiblePages + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

const changePage = (page) => {
  if (
    page >= 1 &&
    page <= props.pagination.last_page &&
    page !== props.pagination.current_page
  ) {
    emit("page-change", page);
  }
};
</script>
