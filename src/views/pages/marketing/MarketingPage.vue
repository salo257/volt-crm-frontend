<template>
  <div class="volt-content-page">
    <!-- <engin-header/> -->
    <PageHeader
      title="Marketing"
      subtitle="Pilotez vos campagnes marketing et analysez leurs performances."
      add-label="Nouvelle Campagne"
      v-if="auth.hasAnyRole(['admin', 'marketing'])"
      @add="addMarketing"
    />
    <div v-else class="page-header-simple mb-4">
      <h1 class="page-title text-navy">Marketing</h1>
    </div>

    <GlobalModal
      :modelValue="isVisible"
      @confirm="confirm"
      @close="isVisible = false"
      :confirmText="isView ? null : isEdit ? 'Modifier' : 'Ajouter'"
      :title="
        isView
          ? 'Détails Campagne'
          : isEdit
          ? 'Modifier Campagne'
          : 'Ajouter Campagne'
      "
    >
      <div v-if="isView" class="marketing-details">
        <div class="row g-3">
          <div class="col-12">
            <label class="small text-muted mb-1">Nom</label>
            <p class="fw-bold">{{ form.name }}</p>
          </div>
          <div class="col-12">
            <label class="small text-muted mb-1">Description</label>
            <p>{{ form.description }}</p>
          </div>
          <div class="col-6">
            <label class="small text-muted mb-1">Statut</label>
            <p class="fw-bold">
              <span :class="getStatusClass(form.status)">{{
                form.status
              }}</span>
            </p>
          </div>
          <div class="col-6">
            <label class="small text-muted mb-1">Budget</label>
            <p class="fw-bold text-primary">{{ form.budget }}</p>
          </div>
          <div class="col-6">
            <label class="small text-muted mb-1">Début</label>
            <p>{{ new Date(form.start_date).toLocaleDateString() }}</p>
          </div>
          <div class="col-6">
            <label class="small text-muted mb-1">Fin</label>
            <p>{{ new Date(form.end_date).toLocaleDateString() }}</p>
          </div>
        </div>
      </div>
      <div v-else>
        <div class="mb-4">
          <label for="name">Nom</label>
          <input
            v-model="form.name"
            type="text"
            placeholder="Nom de la campagne"
            class="form-control"
            :class="{ 'is-invalid': errors.name }"
            required
          />
          <div v-if="errors.name" class="text-danger">{{ errors.name }}</div>
        </div>

        <div class="mb-4">
          <label for="description">Description</label>
          <textarea
            v-model="form.description"
            placeholder="Description détaillée"
            class="form-control"
            :class="{ 'is-invalid': errors.description }"
            required
          ></textarea>
          <div v-if="errors.description" class="text-danger">
            {{ errors.description }}
          </div>
        </div>

        <div class="mb-4">
          <label for="status">Statut</label>
          <select
            v-model="form.status"
            class="form-select"
            :class="{ 'is-invalid': errors.status }"
          >
            <option value="planned">Planifiée</option>
            <option value="active">Active</option>
            <option value="completed">Terminée</option>
            <option value="cancelled">Annulée</option>
          </select>
          <div v-if="errors.status" class="text-danger">
            {{ errors.status }}
          </div>
        </div>

        <div class="mb-4">
          <label for="budget">Budget</label>
          <input
            v-model="form.budget"
            type="number"
            step="0.01"
            placeholder="Budget"
            class="form-control"
          />
        </div>

        <div class="row">
          <div class="col-md-6 mb-4">
            <label for="start_date">Date de début</label>
            <input v-model="form.start_date" type="date" class="form-control" />
          </div>

          <div class="col-md-6 mb-4">
            <label for="end_date">Date de fin</label>
            <input v-model="form.end_date" type="date" class="form-control" />
          </div>
        </div>
      </div>
    </GlobalModal>

    <advanced-table
      :data="marketing"
      :columns="columns"
      :loading="loading"
      @page-change="handlePageChange"
      @search="handleSearch"
      @sort="handleSort"
      @per-page-change="handlePerPageChange"
      @edit="editMarketing"
      @delete="deleteMarketing"
      @show="viewMarketing"
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
import useToastCustom from "../../../utils/toast-custom";

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
  name: "",
  description: "",
  status: "planned",
  budget: "",
  start_date: "",
  end_date: "",
});

const form = ref(defaultForm());

const getData = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams(currentFilters.value).toString();
    const response = await api.get(`/marketing-campaigns?${params}`);
    store.state.data.marketing = response.data || { data: [] };
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const addMarketing = () => {
  form.value = defaultForm();
  isEdit.value = false;
  isView.value = false;
  isVisible.value = true;
};

const editMarketing = (item) => {
  form.value = {
    ...item,
    start_date: item.start_date ? item.start_date.slice(0, 10) : "",
    end_date: item.end_date ? item.end_date.slice(0, 10) : "",
  };
  isEdit.value = true;
  isView.value = false;
  isVisible.value = true;
};

const viewMarketing = (item) => {
  form.value = { ...item };
  isEdit.value = false;
  isView.value = true;
  isVisible.value = true;
};

const deleteMarketing = async (item) => {
  if (!confirm("Supprimer cette campagne ?")) return;
  try {
    await api.delete(`/marketing-campaigns/${item.id}`);
    toast.success("Campagne supprimée");
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

const handleExport = ({ type }) => {
  const params = new URLSearchParams(currentFilters.value);
  params.append("export", type);
  const baseUrl = api.defaults.baseURL || "http://localhost:8000/api";
  const url = `${baseUrl}/marketing-campaigns?${params.toString()}`;
  window.open(url, "_blank");
};

const getStatusClass = (status) => {
  switch (status) {
    case "active":
      return "badge bg-success";
    case "completed":
      return "badge bg-info";
    case "cancelled":
      return "badge bg-danger";
    default:
      return "badge bg-warning";
  }
};

const confirm = async () => {
  if (isView.value) {
    isVisible.value = false;
    return;
  }

  errors.value = {};
  if (!form.value.name) errors.value.name = "Le nom est obligatoire";
  if (!form.value.description)
    errors.value.description = "La description est obligatoire";

  if (Object.keys(errors.value).length) return;

  try {
    if (isEdit.value) {
      await api.put(`/marketing-campaigns/${form.value.id}`, form.value);
      toast.success("Campagne mise à jour");
    } else {
      await api.post("/marketing-campaigns", form.value);
      toast.success("Campagne ajoutée");
    }
    isVisible.value = false;
    getData();
  } catch (error) {
    toast.error("Erreur enregistrement");
  }
};

onMounted(() => {
  getData();
});

const columns = [
  { key: "id", label: "ID" },
  { key: "name", label: "Nom" },
  { key: "description", label: "Description", format: "long" },
  { key: "start_date", label: "Début", format: "date" },
  { key: "end_date", label: "Fin", format: "date" },
  // { key: "budget", label: "Budget", format: "currency" },
  { key: "status", label: "Statut" },
  { key: "created_at", label: "Créé le", format: "date" },
];

const marketing = computed(() => store.state.data.marketing || []);
</script>

<style scoped></style>
