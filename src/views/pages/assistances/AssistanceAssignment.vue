<template>
  <div class="volt-content-page">
    <PageHeader
      title="Assignation des Tickets"
      subtitle="Attribuez les tickets de support non assignés aux agents disponibles."
    />

    <div class="row mb-4">
      <div class="col-md-4">
        <div
          class="stats-card p-3 bg-white rounded shadow-sm border-start border-primary border-4"
        >
          <h6 class="text-muted mb-1">Tickets non assignés</h6>
          <h3 class="mb-0 text-primary">{{ unassignedTickets.length }}</h3>
        </div>
      </div>
    </div>

    <GlobalModal
      title="Assigner le ticket"
      :modelValue="isVisible"
      @confirm="confirmAssignment"
      @close="isVisible = false"
      confirmText="Assigner"
    >
      <div v-if="selectedTicket">
        <div class="mb-4">
          <label class="small text-muted mb-1">Ticket</label>
          <p class="fw-bold">{{ selectedTicket.subject }}</p>
        </div>
        <div class="mb-4">
          <label for="assigned_to">Choisir un agent de support</label>
          <select
            v-model="assignmentForm.assigned_to"
            id="assigned_to"
            class="form-select"
          >
            <option :value="null" disabled>Sélectionner un agent</option>
            <option
              v-for="option in usersSupportToDisplay"
              :key="option.id"
              :value="option.id"
            >
              {{ option.name }}
            </option>
          </select>
        </div>
      </div>
    </GlobalModal>

    <div class="card shadow-sm border-0">
      <div class="card-body p-0">
        <advanced-table
          :data="assistances"
          :columns="columns"
          :loading="loading"
          @page-change="handlePageChange"
          @search="handleSearch"
          @sort="handleSort"
          @per-page-change="handlePerPageChange"
        >
          <template #cell(actions)="{ item }">
            <button
              class="btn btn-sm btn-outline-primary"
              @click="openAssignModal(item)"
            >
              <i class="fas fa-user-plus me-1"></i>
              {{ item.assigned_to ? "Réassigner" : "Assigner" }}
            </button>
          </template>
        </advanced-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed, ref } from "vue";
import useToastCustom from "../../../utils/toast-custom";
import api from "../../../services/api";
import { useStore } from "vuex";
import AdvancedTable from "../../../components/advancedTable/AdvancedTable.vue";
import GlobalModal from "../../../components/advancedTable/GlobalModal.vue";
import PageHeader from "@/components/common/PageHeader.vue";

const store = useStore();
const toast = useToastCustom();
const loading = ref(false);
const isVisible = ref(false);
const selectedTicket = ref(null);

const currentFilters = ref({
  page: 1,
  per_page: 10,
  search: "",
  sort_field: "id",
  sort_order: "desc",
});

const assignmentForm = ref({
  assigned_to: null,
});

const getData = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams(currentFilters.value).toString();
    const response = await api.get(`/support-tickets?${params}`);
    store.state.data.assistances = response.data || { data: [] };
  } catch (error) {
    console.error(error);
    toast.error("Erreur lors du chargement des tickets");
  } finally {
    loading.value = false;
  }
};

const getSupport = async () => {
  try {
    const response = await api.get("/user-support");
    const payload = response?.data?.data ?? response?.data ?? [];
    store.state.data.usersSupport = Array.isArray(payload) ? payload : [];
  } catch (error) {
    console.error(error);
  }
};

const unassignedTickets = computed(() => {
  const data = store.state.data.assistances?.data || [];
  return data.filter((t) => !t.assigned_to);
});

const openAssignModal = (ticket) => {
  selectedTicket.value = ticket;
  assignmentForm.value.assigned_to = ticket.assigned_to || null;
  isVisible.value = true;
};

const confirmAssignment = async () => {
  if (!assignmentForm.value.assigned_to) {
    toast.warning("Veuillez sélectionner un agent");
    return;
  }

  try {
    await api.put(`/support-tickets/${selectedTicket.value.id}`, {
      assigned_to: assignmentForm.value.assigned_to.id,
      // Keep other original fields if necessary, depends on SupportTicketUpdateRequest
      subject: selectedTicket.value.subject,
      description: selectedTicket.value.description,
      status: selectedTicket.value.status,
      client_id: selectedTicket.value.client_id,
    });
    toast.success("Agent assigné avec succès");
    isVisible.value = false;
    getData();
  } catch (error) {
    toast.error("Erreur lors de l'assignation");
  }
};

const handlePageChange = (page) => {
  currentFilters.value.page = page;
  getData();
};

const handleSearch = (query) => {
  currentFilters.value.search = query;
  currentFilters.value.page = 1;
  getData();
};

const handleSort = ({ field, order }) => {
  currentFilters.value.sort_field = field;
  currentFilters.value.sort_order = order;
  getData();
};

const handlePerPageChange = (perPage) => {
  currentFilters.value.per_page = perPage;
  currentFilters.value.page = 1;
  getData();
};

onMounted(() => {
  getData();
  getSupport();
});

const columns = [
  { key: "id", label: "ID" },
  { key: "client.first_name", label: "Client" },
  { key: "subject", label: "Sujet" },
  { key: "status", label: "Statut" },
  { key: "assigned_to_user.first_name", label: "Assigné à" },
  { key: "actions", label: "Actions" },
];

const assistances = computed(() => store.state.data.assistances || []);
const usersSupport = computed(() => store.state.data.usersSupport || []);

const usersSupportToDisplay = computed(() => {
  return usersSupport.value.map((u) => ({
    id: u.id,
    name:
      `${(u?.first_name || "").trim()} ${(u?.last_name || "").trim()}`.trim() ||
      u.email ||
      `#${u.id}`,
  }));
});
</script>

<style scoped>
.stats-card {
  transition: transform 0.2s;
}
.stats-card:hover {
  transform: translateY(-2px);
}
</style>
