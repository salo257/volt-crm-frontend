<template>
  <div class="volt-content-page">
    <!-- <engin-header/> -->
    <PageHeader
      title="Assistances"
      subtitle="Suivez les tickets de support et l'assistance technique clients."
      add-label="Nouveau Ticket"
      v-if="auth.hasAnyRole('admin')"
      @add="addAssistance"
    />
    <div v-else class="page-header-simple mb-4">
      <h1 class="page-title text-navy">Assistances</h1>
    </div>

    <GlobalModal
      :title="
        isView
          ? 'Détails du Ticket'
          : isEdit
          ? 'Modifier une assistance'
          : 'Ajouter une assistance'
      "
      :modelValue="isVisible"
      @confirm="confirm"
      @close="isVisible = false"
      :confirmText="isView ? null : isEdit ? 'Modifier' : 'Ajouter'"
    >
      <div v-if="isView" class="ticket-details">
        <div class="row g-3">
          <div class="col-8">
            <label class="small text-muted mb-1">Sujet</label>
            <p class="fw-bold">{{ form.subject }}</p>
          </div>
          <div class="col-4">
            <label class="small text-muted mb-1">Statut</label>
            <p class="fw-bold">
              <span :class="getStatusClass(form.status)">{{
                form.status
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
            <label class="small text-muted mb-1">Assigné à</label>
            <p class="fw-bold">
              {{ form.assigned_to_user?.first_name }}
              {{ form.assigned_to_user?.last_name }}
            </p>
          </div>
          <div class="col-12">
            <label class="small text-muted mb-1">Description</label>
            <p class="bg-light p-3 rounded">{{ form.description }}</p>
          </div>
        </div>
      </div>
      <div v-else>
        <!-- Client select: bind client_id directly and use optionValue="id" -->
        <div class="mb-4">
          <label for="assigned_to">Clients</label>
          <Select
            v-model="form.client_id"
            :options="clientsToDisplay"
            filter
            optionLabel="name"
            optionValue="id"
            placeholder="Choisir un client"
            class="d-flex items-center w-full md:w-56 mb-3"
          />
        </div>

        <div class="mb-4">
          <label for="assigned_to">Assigné à</label>
          <Select
            v-model="form.assigned_to"
            :options="usersSupportToDisplay"
            filter
            optionLabel="name"
            optionValue="id"
            placeholder="Choisir un agent de support"
            class="d-flex items-center w-full md:w-56 mb-3"
          />
        </div>

        <div class="mb-4">
          <label for="subject">Sujet</label>
          <input
            v-model="form.subject"
            type="text"
            placeholder="Sujet du ticket"
            class="form-control"
            :class="{ 'is-invalid': errors.subject }"
            required
          />
          <div v-if="errors.subject" class="text-danger">
            {{ errors.subject }}
          </div>
        </div>
        <div class="mb-4">
          <label for="description">Description</label>
          <textarea
            v-model="form.description"
            placeholder="Description du problème"
            class="form-control"
            :class="{ 'is-invalid': errors.description }"
          ></textarea>

          <div v-if="errors.description" class="text-danger">
            {{ errors.description }}
          </div>
        </div>

        <div class="mb-4">
          <label for="status">Statut</label>
          <select
            v-model="form.status"
            name="Status"
            id="status"
            class="form-select"
          >
            <option value="open">Ouvert</option>
            <option value="in_progress">En cours</option>
            <option value="closed">Fermé</option>
          </select>
        </div>
      </div>
    </GlobalModal>

    <advanced-table
      :data="assistances"
      :columns="columns"
      :loading="loading"
      @page-change="handlePageChange"
      @search="handleSearch"
      @sort="handleSort"
      @per-page-change="handlePerPageChange"
      @edit="editAssistance"
      @delete="deleteAssistance"
      @show="viewAssistance"
    />
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
import useAuthStore from "@/stores/auth";

const auth = useAuthStore();

const store = useStore();
const isVisible = ref(false);
const isEdit = ref(false);
const isView = ref(false);
const loading = ref(false);
const errors = ref({});
const toast = useToastCustom();

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
  assigned_to: "",
  subject: "",
  description: "",
  status: "open",
});

const form = ref(defaultForm());

const getData = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams(currentFilters.value).toString();
    const response = await api.get(`/support-tickets?${params}`);
    store.state.data.assistances = response.data || { data: [] };
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
    const response = await api.get("/user-support");
    const payload = response?.data?.data ?? response?.data ?? [];
    store.state.data.usersSupport = Array.isArray(payload) ? payload : [];
  } catch (error) {
    console.error(error);
  }
};

const addAssistance = () => {
  form.value = defaultForm();
  isEdit.value = false;
  isView.value = false;
  isVisible.value = true;
};

const editAssistance = (item) => {
  form.value = {
    ...item,
    client_id: item.client_id ?? item.client?.id ?? null,
    assigned_to: item.assigned_to ?? item.assigned_to_user?.id ?? null,
  };
  isEdit.value = true;
  isView.value = false;
  isVisible.value = true;
};

const viewAssistance = (item) => {
  form.value = { ...item };
  isEdit.value = false;
  isView.value = true;
  isVisible.value = true;
};

const deleteAssistance = async (item) => {
  if (!confirm("Voulez-vous supprimer ce ticket ?")) return;
  try {
    await api.delete(`/support-tickets/${item.id}`);
    toast.success("Ticket supprimé");
    getData();
  } catch (error) {
    toast.error("Erreur suppression");
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

const getStatusClass = (status) => {
  switch (status) {
    case "open":
      return "badge bg-primary";
    case "in_progress":
      return "badge bg-warning";
    case "closed":
      return "badge bg-success";
    default:
      return "badge bg-secondary";
  }
};

const confirm = async () => {
  if (isView.value) {
    isVisible.value = false;
    return;
  }

  errors.value = {};
  if (!form.value.subject) errors.value.subject = "Sujet requis";
  if (!form.value.client_id) errors.value.client_id = "Client requis";

  if (Object.keys(errors.value).length) return;

  try {
    const payload = { ...form.value };

    if (isEdit.value) {
      await api.put(`/support-tickets/${form.value.id}`, payload);
      toast.success("Ticket mis à jour");
    } else {
      await api.post("/support-tickets", payload);
      toast.success("Ticket créé");
    }
    isVisible.value = false;
    getData();
  } catch (error) {
    toast.error("Erreur enregistrement");
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
  { key: "subject", label: "Sujet" },
  { key: "description", label: "Description", format: "long" },
  { key: "assigned_to_user.first_name", label: "Agent" },
  { key: "status", label: "Statut" },
  { key: "created_at", label: "Créé le", format: "date" },
];

const assistances = computed(() => store.state.data.assistances || []);
const clients = computed(() => store.state.data.clients || []);
const usersSupport = computed(() => store.state.data.usersSupport || []);

const clientsToDisplay = computed(() => {
  return clients.value.map((client) => ({
    id: client.id,
    name:
      `${(client?.first_name || "").trim()} ${(
        client?.last_name || ""
      ).trim()}`.trim() ||
      client.email ||
      `#${client.id}`,
  }));
});

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

<style scoped></style>
