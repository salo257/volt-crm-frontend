<template>
  <!-- <engin-header/> -->
  <div class="d-flex justify-content-between align-items-center my-3 py-0 px-1">
    <h4 class="my-0">Listes de communications</h4>
    <button
      class="btn btn-primary"
      style="background-color: #0c5594; border-color: #0c5594"
      @click="addInvoice"
    >
      <i class="fa fa-plus"></i> Ajouter une assistance
    </button>
  </div>

  <GlobalModal
    :title="isEdit ? 'Modifier une assistance' : 'Ajouter une assistance'"
    :modelValue="isVisible"
    @confirm="confirm"
    @close="openModal"
    :confirmText="isEdit ? 'Modifier une assistance' : 'Ajouter une assistance'"
  >
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
      <label for="subject">subject</label>
      <input
        v-model="form.subject"
        type="text"
        placeholder="subject"
        class="form-control"
        :class="{ 'is-invalid': errors.subject }"
        required
      />
      <div v-if="errors.subject" class="text-danger">{{ errors.subject }}</div>
    </div>
    <div class="mb-4">
      <label for="description">description</label>
      <textarea
        v-model="form.description"
        placeholder="description"
        class="form-control"
        :class="{ 'is-invalid': errors.description }"
      ></textarea>

      <div v-if="errors.description" class="text-danger">
        {{ errors.description }}
      </div>
    </div>

    <div class="mb-4">
      <label for="status">Status</label>
      <select
        v-model="form.status"
        name="Status"
        id="status"
        class="form-select"
      >
        <option key="open">open</option>
        <option key="in_progress">in_progress</option>
        <option key="closed">closed</option>
      </select>
    </div>
  </GlobalModal>

  <advanced-table
    :data="communications"
    :columns="columns"
    @page-change="changePage"
    @edit="editInvoice"
    @delete="deleteInvoice"
  />
</template>

<script setup>
import { onMounted, computed, ref } from "vue";
import api from "../../../services/api";
import { useStore } from "vuex";
import AdvancedTable from "../../../components/advancedTable/AdvancedTable.vue";
import GlobalModal from "../../../components/advancedTable/GlobalModal.vue";
import { useToast } from "primevue";

const store = useStore();
const isVisible = ref(false);
const isEdit = ref(false);
const errors = ref({});
const toast = useToast();

const defaultForm = () => ({
  id: "",
  client_id: "",
  user_id: "",
  statut: "",
  notes: "",
  date_communication: "",
  due_date: "",
});

const form = ref(defaultForm());

const addInvoice = () => {
  defaultForm();
  isEdit.value = false;
  openModal();
};

const editInvoice = (item) => {
  // map API shape into form
  form.value.id = item.id;
  form.value.client_id = item.client_id ?? item.client?.id ?? null;
  form.value.user_id = item.user_id ?? item.user?.id ?? null;
  form.value.subject = item.subject ?? "";
  form.value.statut = item.statut ?? "draft";
  form.value.notes = item.notes ?? "draft";
  form.value.date_communication = item.date_communication
    ? item.date_communication.slice(0, 10)
    : "";
  isEdit.value = true;
  openModal();
};

const deleteInvoice = async (item) => {
  try {
    await api.delete(`/Communications/${item.id}`);
    ShowSuccessToast("Facture supprimée");
    await getData();
  } catch (error) {
    console.error(error);
    showErrorToast("Impossible de supprimer la facture");
  }
};

const validateForm = () => {
  errors.value = {};
  if (!form.value.client_id)
    errors.value.client_id = "Le client est obligatoire";
  if (!form.value.invoice_number)
    errors.value.invoice_number = "Le numéro est obligatoire";
  if (!form.value.description)
    errors.value.description = "La description est obligatoire";
  if (!form.value.status)
    errors.value.status = "Veuillez selectionner le status";
  // add other validations if needed
  return Object.keys(errors.value).length === 0;
};

onMounted(() => {
  getData();
  getClients();

  getSupport();
});

const columns = [
  { key: "id", label: "ID" },
  { key: "client.first_name", label: "Nom du Client" },
  { key: "user.first_name", label: "Nom de l'Utilisateur" },
  { key: "statut", label: "Statut" },
  { key: "notes", label: "Notes" },
  { key: "date", label: "Date de communication", format: "date" },
  { key: "due_date", label: "Date d'échéance", format: "date" },
  { key: "created_at", label: "Créé le", format: "date" },
];

const confirm = async () => {
  // Simple validation
  // console.log("before");
  // if (!validateForm()) return;
  // console.log("before");

  try {
    const payload = {
      client_id: form.value.client_id,
      user_id: form.value.user_id,
      subject: form.value.subject,
      statut: form.value.statut,
      type: form.value.type,
      notes: form.value.notes,
      date_communication: form.value.date_communication || null,
    };

    if (isEdit.value && form.value.id) {
      await api.put(`/communications/${form.value.id}`, payload);
      toast.add({
        severity: "success",
        summary: "Modifié",
        detail: "Facture mise à jour",
        life: 3000,
      });
    } else {
      await api.post("/communications", payload);
      toast.add({
        severity: "success",
        summary: "Ajouté",
        detail: "Facture créée",
        life: 3000,
      });
    }

    defaultForm();
    isVisible.value = false;
    await getData();
  } catch (error) {
    console.error(error);
    toast.add({
      severity: "error",
      summary: "Erreur",
      detail: "Impossible d'enregistrer la facture",
      life: 4000,
    });
  }
};

function changePage(page) {
  getData(page);
}

const openModal = () => {
  isVisible.value = !isVisible.value;
};

const getData = async (page = 1) => {
  try {
    const response = await api.get("/communications?page=" + page);
    store.state.data.communications = response.data;
  } catch (error) {
    console.error(error);
  }
};

const communications = computed(() => store.state.data.communications || []);

const getClients = async () => {
  try {
    const response = await api.get("/clients");

    // normalize response to an array regardless of API shape
    // common shapes: axios -> response.data (array or { data: [...] })
    const payload =
      (response && response.data && response.data.data) ??
      (response && response.data) ??
      response ??
      [];

    const clientsArray = Array.isArray(payload) ? payload : [];

    store.state.data.clients = clientsArray;
  } catch (error) {
    console.error(error);
    store.state.data.clients = []; // ensure it's always an array on error
  }
};

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
    // don't invent code/id transformations here
  }));
});

const getSupport = async () => {
  try {
    const response = await api.get("/user-support");

    // normalize response to an array regardless of API shape
    // common shapes: axios -> response.data (array or { data: [...] })
    const payload =
      (response && response.data && response.data.data) ??
      (response && response.data) ??
      response ??
      [];

    const SupportArray = Array.isArray(payload) ? payload : [];

    store.state.data.usersSupport = SupportArray;
  } catch (error) {
    console.error(error);
    store.state.data.usersSupport = []; // ensure it's always an array on error
  }
};

const usersSupport = computed(() => store.state.data.usersSupport || []);

const usersSupportToDisplay = computed(() => {
  const list = usersSupport.value;
  if (!Array.isArray(list)) return [];

  return list.map((usersSupport) => ({
    id: usersSupport.id,
    name:
      `${(usersSupport.first_name || "").trim()} ${(
        usersSupport.last_name || ""
      ).trim()}`.trim() ||
      usersSupport.email ||
      `#${usersSupport.id}`,
  }));
});
</script>

<style scoped></style>
