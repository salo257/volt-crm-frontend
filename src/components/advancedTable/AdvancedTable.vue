<template>
  <div class="advanced-table-wrapper">
    <!-- Search and Controls Card -->
    <div class="controls-card mb-4" v-if="showSearch || showFilters">
      <div class="row align-items-center g-3">
        <div class="col-md-5" v-if="showSearch">
          <div class="search-input-group">
            <i class="fas fa-search search-icon"></i>
            <input
              v-model="searchQuery"
              type="text"
              class="form-control volt-input"
              :placeholder="searchPlaceholder"
              @input="handleSearch"
            />
          </div>
        </div>
        <div
          class="col-md-7 d-flex justify-content-end align-items-center gap-3"
        >
          <TableFilters
            v-if="showFilters"
            :columns="filterableColumns"
            :filters="activeFilters"
            @filter-change="handleFilterChange"
            @clear-filters="clearFilters"
          />
          <!-- Export Buttons -->
          <div class="export-buttons d-flex gap-2">
            <button
              class="btn btn-outline-danger btn-sm d-flex align-items-center gap-2"
              @click="$emit('export', { type: 'pdf' })"
              title="Exporter en PDF"
            >
              <i class="fas fa-file-pdf"></i>
              <span class="d-none d-lg-inline">PDF</span>
            </button>
            <button
              class="btn btn-outline-success btn-sm d-flex align-items-center gap-2"
              @click="$emit('export', { type: 'excel' })"
              title="Exporter en Excel"
            >
              <i class="fas fa-file-excel"></i>
              <span class="d-none d-lg-inline">Excel</span>
            </button>
          </div>
          <div class="per-page-select">
            <span class="text-muted small me-2">Afficher</span>
            <select
              v-model="itemsPerPage"
              class="form-select volt-select"
              @change="handlePerPageChange"
            >
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Data Table Card -->
    <div class="table-card">
      <div v-if="loading" class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th v-for="n in skeletonColumns" :key="n">
                <div class="skeleton-pulse header-pulse"></div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="n in skeletonRows" :key="n">
              <td v-for="m in skeletonColumns" :key="m">
                <div class="skeleton-pulse cell-pulse"></div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="table-responsive">
        <table class="table volt-table">
          <thead>
            <tr>
              <th
                v-for="column in columns || []"
                :key="column.key"
                scope="col"
                :class="{ sortable: column.sortable !== false }"
                @click="
                  column.sortable !== false ? handleSort(column.key) : null
                "
              >
                <div class="d-flex align-items-center gap-2">
                  <span>{{ column.label }}</span>
                  <div v-if="column.sortable !== false" class="sort-icons">
                    <i
                      class="fas fa-sort"
                      :class="{ active: sortField === column.key }"
                    ></i>
                  </div>
                </div>
              </th>
              <th v-if="hasActions" class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="tableData.length === 0">
              <td
                :colspan="(columns?.length || 0) + (hasActions ? 1 : 0)"
                class="text-center py-5"
              >
                <div class="empty-state">
                  <i class="fas fa-folder-open mb-3"></i>
                  <p>{{ noDataMessage }}</p>
                </div>
              </td>
            </tr>
            <tr
              v-else
              v-for="(item, index) in tableData"
              :key="getRowKey(item, index)"
            >
              <td
                v-for="column in columns || []"
                :key="column.key"
                :class="`col-${column.key}`"
              >
                <slot
                  :name="`column-${column.key}`"
                  :item="item"
                  :value="getNestedValue(item, column.key)"
                  :index="index"
                >
                  <template
                    v-if="
                      column.key === 'status' ||
                      column.key === 'statut' ||
                      column.key === 'situation'
                    "
                  >
                    <span
                      :class="getStatusClass(getNestedValue(item, column.key))"
                    >
                      {{ getNestedValue(item, column.key) }}
                    </span>
                  </template>
                  <template v-else>
                    {{ formatCellValue(item, column) }}
                  </template>
                </slot>
              </td>
              <td v-if="hasActions" class="text-end">
                <div class="action-buttons">
                  <button
                    v-if="hasShow"
                    class="btn-action view"
                    @click="$emit('show', item)"
                    title="Voir"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                  <button
                    v-if="hasEdit"
                    class="btn-action edit"
                    @click="$emit('edit', item)"
                    title="Modifier"
                  >
                    <i class="fas fa-pen"></i>
                  </button>
                  <button
                    v-if="hasClose && item.status !== 'closed'"
                    class="btn-action close-ticket"
                    @click="$emit('close-ticket', item)"
                    title="Terminer"
                  >
                    <i class="fas fa-check-circle"></i>
                  </button>
                  <button
                    v-if="hasDelete"
                    class="btn-action delete"
                    @click="deleteItem(item)"
                    title="Supprimer"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div class="pagination-footer mt-4">
      <TablePagination
        v-if="!loading && tableData.length > 0 && paginationData"
        :pagination="paginationData"
        @page-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import TableSearch from "./TableSearch.vue";
import TableFilters from "./TableFilters.vue";
import TablePagination from "./TablePagination.vue";
import {
  formatDate,
  formatEmail,
  formatWhatsApp,
  formatLong,
} from "../../utils/tableUtils";

const props = defineProps({
  data: {
    type: Object,
    default: () => ({
      data: [],
      current_page: 1,
      last_page: 1,
      per_page: 10,
      total: 0,
    }),
  },
  columns: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  searchPlaceholder: { type: String, default: "Rechercher..." },
  noDataMessage: { type: String, default: "Aucune donnée disponible" },
  showFilters: { type: Boolean, default: false },
  showSearch: { type: Boolean, default: true },
  hasActions: { type: Boolean, default: true },
  rowKey: { type: String, default: "id" },
  skeletonRows: { type: Number, default: 5 },
  skeletonColumns: { type: Number, default: 4 },
  hasDelete: { type: Boolean, default: true },
  hasShow: { type: Boolean, default: true },
  hasEdit: { type: Boolean, default: true },
  hasClose: { type: Boolean, default: false },
});

const emit = defineEmits([
  "edit",
  "delete",
  "show",
  "search",
  "sort",
  "filter",
  "page-change",
  "per-page-change",
  "close-ticket",
]);

const searchQuery = ref("");
const sortField = ref("");
const sortOrder = ref("asc");
const itemsPerPage = ref(props.data.per_page || 10);
const activeFilters = ref({});

const filterableColumns = computed(() =>
  props.columns.filter((col) => col.filterable !== false),
);
const tableData = computed(() => props.data.data || []);
const paginationData = computed(() => (props.data ? { ...props.data } : null));

const getNestedValue = (obj, path) =>
  path.split(".").reduce((o, p) => (o && o[p]) || "", obj);
const getRowKey = (item, index) => item[props.rowKey] || index;

const formatCellValue = (item, column) => {
  const value = getNestedValue(item, column.key);
  if (column.formatter) return column.formatter(value, item);
  if (column.format === "date") return formatDate(value);
  if (column.format === "long") return formatLong(value);
  if (column.format === "email") return formatEmail(value);
  if (column.format === "whatsapp") return formatWhatsApp(value);
  return value;
};

const getStatusClass = (status) => {
  const s = String(status || "").toLowerCase();
  if (
    [
      "active",
      "actif",
      "paid",
      "payée",
      "completed",
      "terminée",
      "open",
      "ouvert",
    ].includes(s)
  )
    return "badge-volt status-success";
  if (
    ["planned", "plannifiée", "in_progress", "en cours", "prospect"].includes(s)
  )
    return "badge-volt status-warning";
  if (
    [
      "cancelled",
      "annulée",
      "cancelled",
      "inactif",
      "closed",
      "fermé",
    ].includes(s)
  )
    return "badge-volt status-danger";
  return "badge-volt status-neutral";
};

const handleSearch = () => emit("search", searchQuery.value);
const handleSort = (field) => {
  sortOrder.value =
    sortField.value === field && sortOrder.value === "asc" ? "desc" : "asc";
  sortField.value = field;
  emit("sort", { field, order: sortOrder.value });
};
const handleFilterChange = (f) => {
  activeFilters.value = f;
  emit("filter", f);
};
const clearFilters = () => {
  activeFilters.value = {};
  emit("filter", {});
};
const handlePageChange = (p) => emit("page-change", p);
const handlePerPageChange = () => emit("per-page-change", itemsPerPage.value);
const deleteItem = (item) => {
  if (confirm("Êtes-vous sûr de vouloir supprimer cet élément ?"))
    emit("delete", item);
};

watch(
  () => props.data.per_page,
  (val) => {
    if (val) itemsPerPage.value = val;
  },
);
</script>

<style scoped>
.advanced-table-wrapper {
  width: 100%;
}

/* Controls Card */
.controls-card {
  background: white;
  padding: 1.25rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}

.search-input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: #94a3b8;
}

.volt-input {
  padding-left: 2.75rem;
  height: 45px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  transition: all 0.2s;
}

.volt-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px rgba(0, 27, 51, 0.05);
  background: white;
}

.volt-select {
  height: 40px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
}

/* Table Card */
.table-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

.volt-table {
  margin-bottom: 0;
  border-collapse: separate;
  border-spacing: 0;
}

.volt-table thead th {
  background: #f8fafc;
  padding: 1rem 1.5rem;
  font-weight: 700;
  color: #64748b;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #f1f5f9;
}

.volt-table tbody td {
  padding: 1.25rem 1.5rem;
  vertical-align: middle;
  border-bottom: 1px solid #f1f5f9;
  color: #1e293b;
  font-size: 0.95rem;
}

.volt-table tbody tr:last-child td {
  border-bottom: none;
}

.volt-table tbody tr {
  transition: background 0.2s;
}
.volt-table tbody tr:hover {
  background-color: #f8fafc;
}

/* Status Badges */
.badge-volt {
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.status-success {
  background: #dcfce7;
  color: #15803d;
}
.status-warning {
  background: #fef9c3;
  color: #a16207;
}
.status-danger {
  background: #fee2e2;
  color: #b91c1c;
}
.status-neutral {
  background: #f1f5f9;
  color: #475569;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.btn-action {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  background: #f1f5f9;
  color: #64748b;
}

.btn-action:hover {
  transform: translateY(-2px);
}
.btn-action.view:hover {
  background: #e0f2fe;
  color: #0284c7;
}
.btn-action.edit:hover {
  background: rgba(254, 202, 106, 0.2);
  color: #d97706;
}
.btn-action.delete:hover {
  background: #fee2e2;
  color: #ef4444;
}
.btn-action.close-ticket:hover {
  background: #dcfce7;
  color: #15803d;
}

/* Skeleton */
.skeleton-pulse {
  background: #f1f5f9;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.skeleton-pulse::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: translateX(-100%);
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.5),
    transparent
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

.header-pulse {
  height: 20px;
  width: 60%;
}
.cell-pulse {
  height: 16px;
  width: 80%;
}

.empty-state {
  padding: 3rem;
  color: #94a3b8;
}

.empty-state i {
  font-size: 3rem;
  opacity: 0.3;
}
</style>
