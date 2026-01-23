<template>
  <div class="volt-content-page">
    <!-- <engin-header/> -->
    <PageHeader
      title="Factures"
      subtitle="Gérez vos facturations, suivis de paiements et historiques."
      add-label="Nouvelle Facture"
      v-if="auth.hasAnyRole(['admin', 'finance'])"
      @add="addInvoice"
    />
    <div v-else class="page-header-simple mb-4">
      <h1 class="page-title text-navy">Factures</h1>
    </div>

    <GlobalModal
      :title="
        isView
          ? 'Détails de la Facture'
          : isEdit
          ? 'Modifier une facture'
          : 'Ajouter une facture'
      "
      :modelValue="isVisible"
      @confirm="confirm"
      @close="isVisible = false"
      :confirmText="isView ? null : isEdit ? 'Modifier' : 'Ajouter'"
    >
      <div v-if="isView" class="invoice-details">
        <div class="row g-3">
          <div class="col-6">
            <label class="small text-muted mb-1">Numéro</label>
            <p class="fw-bold">{{ form.invoice_number }}</p>
          </div>
          <div class="col-6">
            <label class="small text-muted mb-1">Réf Client</label>
            <p class="fw-bold">
              {{ form.client?.first_name }} {{ form.client?.last_name }}
            </p>
          </div>
          <div class="col-12">
            <label class="small text-muted mb-1">Description</label>
            <p>{{ form.description }}</p>
          </div>
          <div class="col-6">
            <label class="small text-muted mb-1">Montant</label>
            <p class="fw-bold text-primary">{{ form.total_amount }} BIF</p>
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
            <label class="small text-muted mb-1">Émise le</label>
            <p>{{ form.issued_date }}</p>
          </div>
          <div class="col-6">
            <label class="small text-muted mb-1">Échéance</label>
            <p>{{ form.due_date }}</p>
          </div>
        </div>
      </div>
      <div v-else>
        <!-- Client select: bind client_id directly and use optionValue="id" -->
        <div class="mb-4">
          <label>Client</label>
          <Select
            v-model="form.client_id"
            :options="clientsToDisplay"
            filter
            optionLabel="name"
            optionValue="id"
            placeholder="Sélectionnez un client"
            class="w-full"
          />
          <div v-if="errors.client_id" class="text-danger small">
            {{ errors.client_id }}
          </div>
        </div>

        <div class="mb-4">
          <label for="invoice_number">Numéro</label>
          <input
            v-model="form.invoice_number"
            type="text"
            placeholder="Numéro de la facture"
            class="form-control"
            :class="{ 'is-invalid': errors.invoice_number }"
            required
          />
          <div v-if="errors.invoice_number" class="text-danger">
            {{ errors.invoice_number }}
          </div>
        </div>

        <div class="mb-4">
          <label for="description">Description</label>
          <textarea
            v-model="form.description"
            placeholder="Description de la facture"
            class="form-control"
            :class="{ 'is-invalid': errors.description }"
            required
          ></textarea>
        </div>

        <div class="row">
          <div class="col-md-6 mb-4">
            <label for="status">Statut</label>
            <select v-model="form.status" class="form-select">
              <option value="draft">draft</option>
              <option value="paid">paid</option>
              <option value="cancelled">cancelled</option>
            </select>
          </div>
          <div class="col-md-6 mb-4">
            <label for="total_amount">Montant</label>
            <input
              v-model="form.total_amount"
              type="number"
              step="0.01"
              class="form-control"
            />
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 mb-4">
            <label for="issued_date">Date d'émission</label>
            <input
              v-model="form.issued_date"
              type="date"
              class="form-control"
            />
          </div>
          <div class="col-md-6 mb-4">
            <label for="due_date">Date d'échéance</label>
            <input v-model="form.due_date" type="date" class="form-control" />
          </div>
        </div>
      </div>
    </GlobalModal>

    <advanced-table
      :data="invoices"
      :columns="columns"
      :loading="loading"
      @page-change="handlePageChange"
      @search="handleSearch"
      @sort="handleSort"
      @per-page-change="handlePerPageChange"
      @edit="editInvoice"
      @delete="deleteInvoice"
      @show="viewInvoice"
      @export="handleExport"
    />
  </div>
</template>

<script setup>
import { onMounted, computed, ref } from "vue";
import api from "../../../services/api";
import useToastCustom from "../../../utils/toast-custom";
import { useStore } from "vuex";
import AdvancedTable from "../../../components/advancedTable/AdvancedTable.vue";
import GlobalModal from "../../../components/advancedTable/GlobalModal.vue";
import PageHeader from "@/components/common/PageHeader.vue";
import Select from "primevue/select";
import { useToast } from "primevue";
import useAuthStore from "@/stores/auth";

const auth = useAuthStore();

const store = useStore();
const loading = ref(false);
const isVisible = ref(false);
const isEdit = ref(false);
const isView = ref(false);
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
  client_id: null,
  invoice_number: "",
  status: "draft",
  description: "",
  total_amount: "",
  issued_date: "",
  due_date: "",
});

const form = ref(defaultForm());

const getData = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams(currentFilters.value).toString();
    const response = await api.get(`/invoices?${params}`);
    store.state.data.invoices = response.data || { data: [] };
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

const addInvoice = () => {
  form.value = defaultForm();
  isEdit.value = false;
  isView.value = false;
  isVisible.value = true;
};

const editInvoice = (item) => {
  isEdit.value = true;
  isView.value = false;
  form.value = {
    ...item,
    client_id: item.client_id ?? item.client?.id ?? null,
    issued_date: item.issued_date ? item.issued_date.slice(0, 10) : "",
    due_date: item.due_date ? item.due_date.slice(0, 10) : "",
  };
  isVisible.value = true;
};

const viewInvoice = (item) => {
  isEdit.value = false;
  isView.value = true;
  form.value = { ...item };
  isVisible.value = true;
};

const deleteInvoice = async (item) => {
  if (!confirm("Supprimer cette facture ?")) return;
  try {
    await api.delete(`/invoices/${item.id}`);
    toast.success("Facture supprimée");
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
  const url = `${baseUrl}/invoices?${params.toString()}`;
  window.open(url, "_blank");
};

const getStatusClass = (status) => {
  switch (status) {
    case "paid":
      return "badge bg-success";
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
  if (!form.value.client_id) errors.value.client_id = "Client requis";
  if (!form.value.invoice_number) errors.value.invoice_number = "Numéro requis";

  if (Object.keys(errors.value).length) return;

  try {
    if (isEdit.value) {
      await api.put(`/invoices/${form.value.id}`, form.value);
      toast.success("Facture mise à jour");
    } else {
      await api.post("/invoices", form.value);
      toast.success("Facture ajoutée");
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
});

const invoices = computed(() => store.state.data.invoices || []);

const columns = [
  { key: "id", label: "ID" },
  { key: "invoice_number", label: "Numéro" },
  { key: "client.first_name", label: "Client" },
  { key: "total_amount", label: "Montant", format: "currency" },
  { key: "status", label: "Statut" },
  { key: "issued_date", label: "Émise le", format: "date" },
  { key: "due_date", label: "Échéance", format: "date" },
  { key: "created_at", label: "Créé le", format: "date" },
];

const clients = computed(() => store.state.data.clients || []);

const clientsToDisplay = computed(() => {
  const list = clients.value;
  if (!Array.isArray(list)) return [];

  return list.map((client) => ({
    id: client.id, // keep as number
    name:
      `${(client.first_name || "").trim()} ${(
        client.last_name || ""
      ).trim()}`.trim() ||
      client.email ||
      `#${client.id}`,
  }));
});
</script>

<style scoped></style>
