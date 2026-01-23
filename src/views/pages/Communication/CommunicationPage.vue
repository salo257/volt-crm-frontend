<template>
  <div class="volt-content-page">
    <!-- <engin-header/> -->
    <PageHeader
      title="Communications"
      subtitle="Historique et planification de vos échanges avec les clients."
      add-label="Nouvelle Communication"
      @add="addCommunication"
    />

    <GlobalModal
      :title="
        isView
          ? 'Détails de la communication'
          : isEdit
          ? 'Modifier une communication'
          : 'Ajouter une communication'
      "
      :modelValue="isVisible"
      @confirm="confirm"
      @close="isVisible = false"
      :confirmText="isView ? null : isEdit ? 'Modifier' : 'Ajouter'"
    >
      <div v-if="isView" class="communication-details">
        <div class="row g-3">
          <div class="col-6">
            <label class="small text-muted mb-1">Type</label>
            <p class="fw-bold">
              <span class="badge bg-info">{{ form.type }}</span>
            </p>
          </div>
          <div class="col-6">
            <label class="small text-muted mb-1">Statut</label>
            <p class="fw-bold">
              <span :class="getStatusClass(form.statut)">{{
                form.statut
              }}</span>
            </p>
          </div>
          <div class="col-6">
            <label class="small text-muted mb-1">Client</label>
            <p class="fw-bold">
              {{ form.client?.first_name }} {{ form.client?.last_name }}
            </p>
          </div>
          <div class="col-6">
            <label class="small text-muted mb-1">Agent</label>
            <p class="fw-bold">
              {{ form.user?.first_name }} {{ form.user?.last_name }}
            </p>
          </div>
          <div class="col-12">
            <label class="small text-muted mb-1">Notes</label>
            <p>{{ form.notes }}</p>
          </div>
          <div class="col-6">
            <label class="small text-muted mb-1">Date Communication</label>
            <p>{{ new Date(form.date_communication).toLocaleDateString() }}</p>
          </div>
          <div class="col-6">
            <label class="small text-muted mb-1">Échéance</label>
            <p>{{ new Date(form.due_date).toLocaleDateString() }}</p>
          </div>
        </div>
      </div>
      <div v-else>
        <!-- Client select: bind client_id directly and use optionValue="id" -->
        <div class="mb-4">
          <label for="client_id">Client</label>
          <select
            v-model="form.client_id"
            id="client_id"
            class="form-select"
            required
          >
            <option value="" disabled>Choisir un client</option>
            <option
              v-for="option in clientsToDisplay"
              :key="option.id"
              :value="option.id"
            >
              {{ option.name }}
            </option>
          </select>
        </div>
        <div class="mb-4">
          <label for="user_id">Fait par</label>
          <select v-model="form.user_id" id="user_id" class="form-select">
            <option value="" disabled>Choisir un agent</option>
            <option
              v-for="option in usersSupportToDisplay"
              :key="option.id"
              :value="option.id"
            >
              {{ option.name }}
            </option>
          </select>
        </div>

        <div class="mb-4">
          <label for="notes">Notes</label>
          <textarea
            v-model="form.notes"
            type="textarea"
            placeholder="Notes de la communication"
            class="form-control"
            :class="{ 'is-invalid': errors.notes }"
            required
          ></textarea>
          <div v-if="errors.notes" class="text-danger">
            {{ errors.notes }}
          </div>
        </div>

        <div class="mb-4">
          <label for="Canal">Canal</label>
          <select
            v-model="form.type"
            name="Canal"
            id="canal"
            class="form-select"
          >
            <option value="email">email</option>
            <option value="phone">phone</option>
            <option value="in_person">in_person</option>
          </select>
        </div>

        <div class="mb-4">
          <label for="statut">statut</label>
          <select
            v-model="form.statut"
            name="statut"
            id="statut"
            class="form-select"
          >
            <option value="planned">planned</option>
            <option value="completed">completed</option>
            <option value="cancelled">cancelled</option>
          </select>
        </div>

        <div class="mb-4">
          <label for="date_communication">Date de communication</label>
          <input
            v-model="form.date_communication"
            type="date"
            class="form-control"
          />
        </div>
      </div>
    </GlobalModal>

    <advanced-table
      :data="communications"
      :columns="columns"
      :loading="loading"
      @page-change="handlePageChange"
      @search="handleSearch"
      @sort="handleSort"
      @per-page-change="handlePerPageChange"
      @edit="editCommunication"
      @delete="deleteCommunication"
      @show="viewCommunication"
      @export="handleExport"
    />
  </div>
</template>

<script setup>
import { onMounted, computed, ref } from "vue";
import api from "../../../services/api";
import { useStore } from "vuex";
import AdvancedTable from "../../../components/advancedTable/AdvancedTable.vue";
import GlobalModal from "../../../components/advancedTable/GlobalModal.vue";
import PageHeader from "@/components/common/PageHeader.vue";
import { useToast } from "primevue";

const store = useStore();
const isVisible = ref(false);
const isEdit = ref(false);
const isView = ref(false);
const loading = ref(false);
const errors = ref({});
const toast = useToast();

const currentFilters = ref({
  page: 1,
  per_page: 10,
  search: "",
  sort_field: "id",
  sort_order: "desc",
});

const defaultForm = () => ({
  id: "",
  client_id: "",
  user_id: "",
  statut: "planned",
  type: "email",
  notes: "",
  date_communication: "",
  due_date: "",
});

const form = ref(defaultForm());

const getData = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams(currentFilters.value).toString();
    const response = await api.get(`/communications?${params}`);
    store.state.data.communications = response.data || { data: [] };
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const getClients = async () => {
  try {
    const response = await api.get("/clients?per_page=100");
    const payload = response?.data?.data ?? response?.data ?? [];
    store.state.data.clients = Array.isArray(payload) ? payload : [];
  } catch (error) {
    console.error(error);
  }
};

const getSupport = async () => {
  try {
    const response = await api.get("/user-support"); // Ensure this endpoint exists and returns users
    const payload = response?.data?.data ?? response?.data ?? [];
    store.state.data.usersSupport = Array.isArray(payload) ? payload : [];
  } catch (error) {
    console.error(error);
  }
};

const addCommunication = () => {
  form.value = defaultForm();
  isEdit.value = false;
  isView.value = false;
  isVisible.value = true;
};

const editCommunication = (item) => {
  form.value = {
    ...item,
    client_id: item.client_id ?? item.client?.id ?? null,
    user_id: item.user_id ?? item.user?.id ?? null,
    date_communication: item.date_communication
      ? item.date_communication.slice(0, 10)
      : "",
    due_date: item.due_date ? item.due_date.slice(0, 10) : "",
  };
  isEdit.value = true;
  isView.value = false;
  isVisible.value = true;
};

const viewCommunication = (item) => {
  form.value = { ...item };
  isEdit.value = false;
  isView.value = true;
  isVisible.value = true;
};

const deleteCommunication = async (item) => {
  if (!confirm("Voulez-vous supprimer cette communication ?")) return;
  try {
    await api.delete(`/communications/${item.id}`);
    toast.add({
      severity: "success",
      summary: "Succès",
      detail: "Communication supprimée",
      life: 3000,
    });
    getData();
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Erreur",
      detail: "Erreur suppression",
      life: 3000,
    });
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

const handleExport = ({ type }) => {
  const params = new URLSearchParams(currentFilters.value);
  params.append("export", type);
  const baseUrl = api.defaults.baseURL || "http://localhost:8000/api";
  const url = `${baseUrl}/communications?${params.toString()}`;
  window.open(url, "_blank");
};

const getStatusClass = (status) => {
  switch (status) {
    case "completed":
      return "badge bg-success";
    case "cancelled":
      return "badge bg-danger";
    default:
      return "badge bg-warning";
  }
};

const confirmAction = async () => {
  if (isView.value) {
    isVisible.value = false;
    return;
  }

  errors.value = {};
  if (!form.value.client_id) errors.value.client_id = "Client requis";
  // if (!form.value.user_id) errors.value.user_id = "Agent requis";

  if (Object.keys(errors.value).length) return;

  try {
    const payload = { ...form.value };

    if (isEdit.value) {
      await api.put(`/communications/${form.value.id}`, payload);
      toast.add({
        severity: "success",
        summary: "Succès",
        detail: "Communication mise à jour",
        life: 3000,
      });
    } else {
      await api.post("/communications", payload);
      toast.add({
        severity: "success",
        summary: "Succès",
        detail: "Communication créée",
        life: 3000,
      });
    }
    isVisible.value = false;
    getData();
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Erreur",
      detail: "Erreur enregistrement",
      life: 3000,
    });
  }
};

onMounted(() => {
  getData();
  getClients();
  getSupport();
});

const columns = [
  { key: "id", label: "ID" },
  { key: "client.first_name", label: "Client" },
  { key: "type", label: "Type" },
  { key: "statut", label: "Statut" },
  { key: "notes", label: "Notes", format: "long" },
  { key: "date_communication", label: "Date", format: "date" },
  { key: "created_at", label: "Créé le", format: "date" },
];

const communications = computed(() => store.state.data.communications || []);
const clients = computed(() => store.state.data.clients || []);
const usersSupport = computed(() => store.state.data.usersSupport || []);

// Mappers for Select components
const clientsToDisplay = computed(() => {
  return clients.value.map((c) => ({
    id: c.id,
    name: `${c.first_name || ""} ${c.last_name || ""}`.trim() || c.email,
  }));
});

const usersSupportToDisplay = computed(() => {
  return usersSupport.value.map((u) => ({
    id: u.id,
    name: `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.email,
  }));
});
</script>

<style scoped></style>
