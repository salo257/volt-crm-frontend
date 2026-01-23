<template>
  <div class="volt-content-page">
    <PageHeader
      title="Clients"
      subtitle="Gérez votre base de données clients et leurs informations."
      add-label="Nouveau Client"
      v-if="auth.hasAnyRole('admin')"
      @add="addClient"
    />
    <div v-else class="page-header-simple mb-4">
      <h1 class="page-title">Clients</h1>
    </div>
    <GlobalModal
      :modelValue="isVisible"
      @confirm="confirm"
      @close="isVisible = false"
      :confirmText="isView ? null : isEdit ? 'Modifier' : 'Ajouter'"
      :title="
        isView
          ? 'Détails du Client'
          : isEdit
          ? 'Modifier le Client'
          : 'Ajouter un Nouveau Client'
      "
    >
      <div v-if="isView" class="client-details">
        <div class="row g-3">
          <div class="col-6">
            <label class="small text-muted mb-1">Nom</label>
            <p class="fw-bold">{{ form.first_name }}</p>
          </div>
          <div class="col-6">
            <label class="small text-muted mb-1">Prénom</label>
            <p class="fw-bold">{{ form.last_name }}</p>
          </div>
          <div class="col-12">
            <label class="small text-muted mb-1">Email</label>
            <p class="fw-bold">{{ form.email }}</p>
          </div>
          <div class="col-6">
            <label class="small text-muted mb-1">Téléphone</label>
            <p class="fw-bold">{{ form.phone }}</p>
          </div>
          <div class="col-6">
            <label class="small text-muted mb-1">NIF</label>
            <p class="fw-bold">{{ form.nif }}</p>
          </div>
          <div class="col-12">
            <label class="small text-muted mb-1">Adresse</label>
            <p class="fw-bold">{{ form.address }}</p>
          </div>
          <div class="col-6">
            <label class="small text-muted mb-1">Type</label>
            <p class="fw-bold">
              <span class="badge bg-info">{{ form.type }}</span>
            </p>
          </div>
          <div class="col-6">
            <label class="small text-muted mb-1">Société</label>
            <p class="fw-bold">{{ form.company || "N/A" }}</p>
          </div>
        </div>
      </div>
      <div v-else>
        <div class="mb-4">
          <label for="first_name">Nom</label>
          <input
            v-model="form.first_name"
            type="text"
            placeholder="Nom"
            class="form-control"
            :class="{ 'is-invalid': errors.first_name }"
            required
          />
          <div v-if="errors.first_name" class="text-danger">
            {{ errors.first_name }}
          </div>
        </div>
        <div class="mb-4">
          <label for="last_name">Prenom</label>
          <input
            v-model="form.last_name"
            type="text"
            placeholder="Prénom"
            class="form-control"
            :class="{ 'is-invalid': errors.last_name }"
            required
          />
          <div v-if="errors.last_name" class="text-danger">
            {{ errors.last_name }}
          </div>
        </div>
        <div class="mb-4">
          <label for="email">Email</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="Email"
            class="form-control"
            :class="{ 'is-invalid': errors.email }"
            required
          />
          <div v-if="errors.email" class="text-danger">{{ errors.email }}</div>
        </div>
        <div class="mb-4">
          <label for="phone">Téléphone</label>
          <input
            v-model="form.phone"
            type="text"
            placeholder="Téléphone"
            class="form-control"
            :class="{ 'is-invalid': errors.phone }"
            required
          />
          <div v-if="errors.phone" class="text-danger">{{ errors.phone }}</div>
        </div>
        <div class="mb-4">
          <label for="nif">NIF</label>
          <input
            v-model="form.nif"
            type="text"
            placeholder="NIF"
            class="form-control"
            :class="{ 'is-invalid': errors.nif }"
            required
          />
          <div v-if="errors.nif" class="text-danger">{{ errors.nif }}</div>
        </div>
        <div class="mb-4">
          <label for="address">Adresse</label>
          <input
            v-model="form.address"
            type="text"
            placeholder="Adresse"
            class="form-control"
            :class="{ 'is-invalid': errors.address }"
            required
          />
          <div v-if="errors.address" class="text-danger">
            {{ errors.address }}
          </div>
        </div>
        <div class="mb-4">
          <label for="company">Société</label>
          <input
            v-model="form.company"
            type="text"
            placeholder="Société"
            class="form-control"
            :class="{ 'is-invalid': errors.company }"
            required
          />
        </div>
        <div class="mb-4">
          <label for="type">Type</label>
          <select
            v-model="form.type"
            class="form-control"
            :class="{ 'is-invalid': errors.type }"
            required
          >
            <option value="" disabled>Sélectionnez le type</option>
            <option value="Personne Physique">Personne Physique</option>
            <option value="Personne Morale">Personne Morale</option>
          </select>
          <div v-if="errors.type" class="text-danger">{{ errors.type }}</div>
        </div>
      </div>
    </GlobalModal>
    <Toast />

    <advanced-table
      :data="clients"
      :columns="columns"
      :loading="loading"
      @edit="editClient"
      @delete="deleteClient"
      @show="viewClient"
      @search="handleSearch"
      @sort="handleSort"
      @page-change="handlePageChange"
      @per-page-change="handlePerPageChange"
      :showFilters="false"
      @export="handleExport"
    />
  </div>
</template>

<script setup>
import { onMounted, computed, ref } from "vue";
import api from "../../../services/api";
import { useToastCustom } from "../../../utils/toast-custom";
import { useStore } from "vuex";
import AdvancedTable from "../../../components/advancedTable/AdvancedTable.vue";
import GlobalModal from "@/components/advancedTable/GlobalModal.vue";
import PageHeader from "@/components/common/PageHeader.vue";
// import {
//   GlobalModal,
//   GlobalModal as GlobalModalView,
//   GlobalModal as GlobalModalImport,
// } from "../../../components/advancedTable/GlobalModal.vue";
import { useToast } from "primevue/usetoast";
import useAuthStore from "@/stores/auth";

const auth = useAuthStore();
const store = useStore();
const loading = ref(false);
const isVisible = ref(false);
const isEdit = ref(false);
const isView = ref(false);
const errors = ref({});
const toast = useToastCustom();

const form = ref({
  id: "",
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  nif: "",
  address: "",
  company: "",
  type: "",
});

const queryParams = ref({
  page: 1,
  per_page: 10,
  search: "",
  sort_field: "id",
  sort_order: "desc",
});

const getData = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams(queryParams.value).toString();
    const response = await api.get(`/clients?${params}`);

    if (response.success) {
      store.state.data.clients = response.data || { data: [] };
    }
  } catch (error) {
    console.error("Error fetching clients:", error);
    toast.error("Erreur lors du chargement");
  } finally {
    loading.value = false;
  }
};

const addClient = () => {
  isEdit.value = false;
  isView.value = false;
  form.value = {
    id: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    nif: "",
    address: "",
    company: "",
    type: "",
  };
  isVisible.value = true;
};

const editClient = (item) => {
  isEdit.value = true;
  isView.value = false;
  form.value = { ...item };
  isVisible.value = true;
};

const viewClient = (item) => {
  isEdit.value = false;
  isView.value = true;
  form.value = { ...item };
  isVisible.value = true;
};

const deleteClient = async (item) => {
  if (!confirm("Voulez-vous vraiment supprimer ce client ?")) return;
  try {
    await api.delete(`/clients/${item.id}`);
    toast.success("Client supprimé");
    getData();
  } catch (error) {
    toast.error("Erreur lors de la suppression");
  }
};

const handleSearch = (searchTerm) => {
  queryParams.value.search = searchTerm;
  queryParams.value.page = 1;
  getData();
};

const handleSort = (sortData) => {
  queryParams.value.sort_field = sortData.field;
  queryParams.value.sort_order = sortData.order;
  getData();
};

const handlePageChange = (page) => {
  queryParams.value.page = page;
  getData();
};

const handlePerPageChange = (perPage) => {
  queryParams.value.per_page = perPage;
  queryParams.value.page = 1;
  getData();
};

const handleExport = ({ type }) => {
  const params = new URLSearchParams(queryParams.value);
  params.append("export", type);
  const baseUrl = api.defaults.baseURL || "http://localhost:8000/api";
  const url = `${baseUrl}/clients?${params.toString()}`;
  window.open(url, "_blank");
};

const columns = [
  { key: "id", label: "ID" },
  { key: "first_name", label: "Nom" },
  { key: "last_name", label: "Prénom" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Téléphone" },
  { key: "nif", label: "NIF" },
  { key: "address", label: "Adresse" },
  { key: "situation", label: "Statut" },
  { key: "attribut_personne", label: "Attribut Personne" },
  { key: "type", label: "Type" },
  { key: "created_at", label: "Créé le", format: "date" },
];

const confirm = async () => {
  if (isView.value) {
    isVisible.value = false;
    return;
  }

  errors.value = {};
  if (!form.value.first_name)
    errors.value.first_name = "Le nom est obligatoire";
  if (!form.value.last_name)
    errors.value.last_name = "Le prénom est obligatoire";
  if (!form.value.email) errors.value.email = "L'email est obligatoire";
  if (!form.value.phone) errors.value.phone = "Le téléphone est obligatoire";
  if (!form.value.type) errors.value.type = "Le type est obligatoire";

  if (Object.keys(errors.value).length) return;

  try {
    if (isEdit.value) {
      await api.put(`/clients/${form.value.id}`, form.value);
      toast.success("Client modifié");
    } else {
      await api.post("/clients", form.value);
      toast.success("Client ajouté");
    }
    isVisible.value = false;
    getData();
  } catch (error) {
    toast.error("Échec de l'enregistrement");
  }
};

onMounted(() => {
  getData();
});

const clients = computed(() => store.state.data.clients || { data: [] });
</script>

<style scoped></style>
