<template>
  <div class="volt-content-page">
    <PageHeader
      title="Administration"
      subtitle="Gérez les utilisateurs, rôles et accès au système."
      add-label="Nouvel Utilisateur"
      @add="addUser"
    />

    <div class="row g-4 mb-5">
      <div class="col-md-6">
        <div class="volt-stat-card">
          <div class="stat-icon-box navy">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-info">
            <h6 class="stat-label">Utilisateurs actifs</h6>
            <p class="stat-value">{{ activeUsersCount }}</p>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="volt-stat-card">
          <div class="stat-icon-box yellow">
            <i class="fas fa-key"></i>
          </div>
          <div class="stat-info">
            <h6 class="stat-label">Sessions ouvertes</h6>
            <p class="stat-value">{{ activeSessions }}</p>
          </div>
        </div>
      </div>
    </div>
    <GlobalModal
      :modelValue="isVisible"
      @confirm="confirm"
      @close="isVisible = false"
      :confirmText="isView ? null : isEdit ? 'Modifier' : 'Ajouter'"
      :title="
        isView
          ? 'Détails de l\'utilisateur'
          : isEdit
          ? 'Modifier un utilisateur'
          : 'Ajouter un utilisateur'
      "
    >
      <div v-if="isView" class="user-details">
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
            <p class="fw-bold">{{ form.telephone }}</p>
          </div>
          <div class="col-6">
            <label class="small text-muted mb-1">Rôle</label>
            <p class="fw-bold">
              <span class="badge bg-primary">{{ form.role }}</span>
            </p>
          </div>
          <div class="col-12">
            <label class="small text-muted mb-1">Adresse</label>
            <p class="fw-bold">{{ form.address }}</p>
          </div>
        </div>
      </div>
      <div v-else>
        <div class="mb-4">
          <label for="name">Nom</label>
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
          <label for="name">Prénom</label>
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
          <label for="Email">Email</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="email"
            class="form-control"
            :class="{ 'is-invalid': errors.email }"
            required
          />
          <div v-if="errors.email" class="text-danger">
            {{ errors.email }}
          </div>
        </div>

        <div class="mb-4">
          <label for="Email">Téléphone</label>
          <input
            v-model="form.telephone"
            type="tel"
            placeholder="Téléphone"
            class="form-control"
            :class="{ 'is-invalid': errors.telephone }"
            required
          />
          <div v-if="errors.telephone" class="text-danger">
            {{ errors.telephone }}
          </div>
        </div>

        <div class="mb-4">
          <label for="Email">Adresse</label>
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

        <div class="mb-4" v-if="!isEdit">
          <label for="Password">Mot de passe</label>
          <input
            v-model="form.password"
            type="password"
            placeholder="Mot de passe"
            class="form-control"
            :class="{ 'is-invalid': errors.password }"
            required
          />
          <div v-if="errors.password" class="text-danger">
            {{ errors.password }}
          </div>
        </div>

        <div class="mb-4" v-if="!isEdit">
          <label for="Password">Confirmer le Mot de passe</label>
          <input
            v-model="form.password_confirmation"
            type="password"
            placeholder="Mot de passe"
            class="form-control"
            :class="{ 'is-invalid': errors.password_confirmation }"
            required
          />
          <div v-if="errors.password_confirmation" class="text-danger">
            {{ errors.password_confirmation }}
          </div>
        </div>

        <div class="mb-4">
          <label for="role">Role</label>
          <select v-model="form.role" name="Role" id="role" class="form-select">
            <option value="admin">admin</option>
            <option value="humanResources">humanResources</option>
            <option value="support">support</option>
            <option value="marketing">marketing</option>
          </select>
        </div>
      </div>
    </GlobalModal>

    <advanced-table
      :data="users"
      :columns="columns"
      :loading="loading"
      @page-change="handlePageChange"
      @search="handleSearch"
      @sort="handleSort"
      @per-page-change="handlePerPageChange"
      @edit="editUser"
      @delete="deleteUser"
      @show="viewUser"
      @export="handleExport"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useStore } from "vuex";
import api from "../../../services/api";
import useToastCustom from "../../../utils/toast-custom";
import AdvancedTable from "../../../components/advancedTable/AdvancedTable.vue";
import GlobalModal from "../../../components/advancedTable/GlobalModal.vue";
import PageHeader from "@/components/common/PageHeader.vue";
import { useToast } from "primevue/usetoast";
import { useRouter } from "vue-router";

const store = useStore();
const router = useRouter();

const toast = useToastCustom();

const form = ref({});

const columns = [
  { key: "id", label: "ID" },
  { key: "first_name", label: "Nom" },
  { key: "last_name", label: "Prénom" },
  { key: "email", label: "Email" },
  { key: "telephone", label: "Téléphone" },
  { key: "telephone", label: "Téléphone" },
  { key: "address", label: "Adresse" },
  { key: "role", label: "Role" },
];

const users = computed(
  () =>
    store?.state?.data?.users ?? {
      data: [],
      current_page: 1,
      last_page: 1,
      per_page: 10,
      total: 0,
    }
);

// normalize admin and guard access to nested/value fields
const admin = computed(() => store?.state?.data?.admin ?? {});

const activeUsersCount = computed(() => {
  const a = admin.value;
  if (!a) return null;
  if (typeof a.activeUsers === "number") return a.activeUsers;
  if (a.activeUsers && typeof a.activeUsers.value === "number")
    return a.activeUsers.value;
  if (a.activeUsers?.data && typeof a.activeUsers.data === "number")
    return a.activeUsers.data;
  return null;
});

const activeSessions = computed(() => {
  const a = admin.value;
  if (!a) return null;
  if (typeof a.activeSessions === "number") return a.activeSessions;
  if (a.activeSessions && typeof a.activeSessions.value === "number")
    return a.activeSessions.value;
  if (a.activeSessions?.data && typeof a.activeSessions.data === "number")
    return a.activeSessions.data;
  return null;
});

const loading = ref(false);
const isVisible = ref(false);
const isEdit = ref(false);
const isView = ref(false);
const errors = ref({});

const currentFilters = ref({
  page: 1,
  search: "",
  sort_field: "id",
  sort_order: "desc",
  per_page: 10,
});

const getData = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams(currentFilters.value).toString();
    const usersRes = await api.get(`/users?${params}`);
    store.state.data.users = usersRes?.data ?? { data: [] };

    const adminRes = await api.get("/admin");
    store.state.data.admin = adminRes?.data ?? {};
  } catch (error) {
    console.error("Error fetching data:", error);
    toast.error("Erreur lors de la récupération des données");
  } finally {
    loading.value = false;
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
  // Construct URL based on api configuration
  const baseUrl = api.defaults.baseURL || "http://localhost:8000/api";
  const url = `${baseUrl}/users?${params.toString()}`;
  window.open(url, "_blank");
};

const addUser = () => {
  isEdit.value = false;
  isView.value = false;
  form.value = {
    first_name: "",
    last_name: "",
    email: "",
    telephone: "",
    address: "",
    role: "support",
    password: "",
    password_confirmation: "",
  };
  isVisible.value = true;
};

const editUser = (user) => {
  isEdit.value = true;
  isView.value = false;
  form.value = { ...user };
  isVisible.value = true;
};

const viewUser = (user) => {
  isEdit.value = false;
  isView.value = true;
  form.value = { ...user };
  isVisible.value = true;
};

const deleteUser = async (user) => {
  try {
    await api.delete(`/users/${user.id}`);
    toast.success("Utilisateur supprimé avec succès");
    getData();
  } catch (error) {
    toast.error("Erreur lors de la suppression");
  }
};

const confirm = async () => {
  if (isView.value) {
    isVisible.value = false;
    return;
  }

  errors.value = {};
  if (!form.value.first_name)
    errors.value.first_name = "Le prénom est obligatoire";
  if (!form.value.last_name) errors.value.last_name = "Le nom est obligatoire";
  if (!form.value.email) errors.value.email = "L'email est obligatoire";
  if (!form.value.role) errors.value.role = "Le rôle est obligatoire";

  if (Object.keys(errors.value).length) return;

  try {
    if (isEdit.value) {
      await api.put("/users/" + form.value.id, form.value);
      toast.success("Utilisateur mis à jour avec succès");
    } else {
      await api.post("/register", form.value);
      toast.success("Utilisateur ajouté avec succès");
    }

    getData();
    isVisible.value = false;
  } catch (error) {
    console.error("Error submitting form:", error);
    toast.error("Erreur lors de l'enregistrement");
  }
};

onMounted(() => {
  getData();
});
</script>

<style scoped>
.volt-stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  transition: transform 0.2s;
}

.volt-stat-card:hover {
  transform: translateY(-3px);
}

.stat-icon-box {
  width: 54px;
  height: 54px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-icon-box.navy {
  background: rgba(0, 27, 51, 0.1);
  color: var(--primary-color);
}

.stat-icon-box.yellow {
  background: rgba(254, 202, 106, 0.2);
  color: #d97706;
}

.stat-label {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
}
</style>
