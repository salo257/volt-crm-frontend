<template>
  <div class="dashboard-container">
    <header class="dashboard-header mb-4">
      <div class="header-left">
        <h1>Tableau de bord</h1>
        <p class="text-muted">
          Bienvenue, voici un aperçu de votre activité aujourd'hui.
        </p>
      </div>
      <!-- <div class="header-right">
        <button class="btn btn-primary shadow-sm" @click="getData">
          <i class="fas fa-sync-alt me-2"></i> Actualiser
        </button>
      </div> -->
    </header>

    <!-- Stats Grid -->
    <div class="stats-grid mb-5">
      <div v-for="(stat, key) in dashboard.stats" :key="key" class="stat-card">
        <div class="stat-icon" :class="key">
          <i :class="stat.icon"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">{{ stat.title }}</span>
          <div class="stat-row">
            <h2 class="stat-value">
              <template v-if="key === 'revenue'">{{
                formatMoney(stat.total)
              }}</template>
              <template v-else-if="key === 'clients'">{{
                stat.total
              }}</template>
              <template v-else-if="key === 'tickets'">{{
                stat.total
              }}</template>
              <template v-else>{{ stat.active }}</template>
            </h2>
            <div
              v-if="stat.growth !== undefined"
              class="growth-tag"
              :class="stat.growth >= 0 ? 'positive' : 'negative'"
            >
              <i
                :class="
                  stat.growth >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'
                "
              ></i>
              {{ Math.abs(stat.growth) }}%
            </div>
          </div>
          <p class="stat-subtext text-muted" v-if="key === 'tickets'">
            {{ stat.open }} ouverts · {{ stat.resolved }} résolus
          </p>
          <p class="stat-subtext text-muted" v-else-if="key === 'campaigns'">
            {{ stat.active }} actives sur {{ stat.total }}
          </p>
          <p class="stat-subtext text-muted" v-else-if="key === 'clients'">
            {{ stat.new_this_month }} nouveaux ce mois
          </p>
          <p class="stat-subtext text-muted" v-else-if="key === 'revenue'">
            {{ formatMoney(stat.this_month) }} ce mois
          </p>
        </div>
      </div>
    </div>

    <div class="content-grid">
      <!-- Recent Activity -->
      <div class="card activity-card">
        <div
          class="card-header d-flex justify-content-between align-items-center"
        >
          <h5 class="mb-0">Activités Récentes</h5>
          <router-link to="/logs" class="btn-link">Voir tout</router-link>
        </div>
        <div class="activity-list p-3">
          <div
            v-for="(activity, index) in dashboard.recentActivities"
            :key="index"
            class="activity-item"
          >
            <div class="activity-icon-sm" :class="activity.type">
              <i class="fas" :class="activity.icon"></i>
            </div>
            <div class="activity-details">
              <h6 class="mb-0">{{ activity.title }}</h6>
              <p class="mb-0 text-muted small">{{ activity.description }}</p>
              <span class="activity-time text-muted small">{{
                formatDateSimple(activity.time)
              }}</span>
            </div>
          </div>
          <div
            v-if="!dashboard.recentActivities?.length"
            class="text-center py-4 text-muted"
          >
            Aucune activité pour le moment.
          </div>
        </div>
      </div>

      <!-- Top Clients -->
      <div class="card top-clients-card">
        <div class="card-header">
          <h5 class="mb-0">Meilleurs Clients</h5>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Total Dépensé</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="client in dashboard.topClients"
                  :key="client.client_id"
                >
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="client-avatar me-2">
                        {{
                          client.client?.first_name
                            ? client.client.first_name[0]
                            : "C"
                        }}
                      </div>
                      <div>
                        <div class="fw-bold">
                          {{ client.client?.first_name }}
                          {{ client.client?.last_name }}
                        </div>
                        <div class="text-muted small">
                          {{ client.client?.email }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{{ formatMoney(client.total_spent) }}</td>
                  <td><span class="badge bg-light text-primary">VIP</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Campaigns Summary -->
      <div class="card campaigns-card">
        <div class="card-header">
          <h5 class="mb-0">Campagnes en Cours</h5>
        </div>
        <div class="card-body">
          <div
            v-for="campaign in dashboard.campaignDetails"
            :key="campaign.id"
            class="campaign-summary-item mb-3"
          >
            <div class="d-flex justify-content-between mb-1">
              <span class="fw-medium">{{ campaign.name }}</span>
              <span class="text-primary small">{{
                campaign.type || "Emailing"
              }}</span>
            </div>
            <div class="progress" style="height: 6px">
              <div
                class="progress-bar bg-primary"
                :style="{ width: '65%' }"
              ></div>
            </div>
            <div class="d-flex justify-content-between mt-1 small text-muted">
              <span>Status: {{ campaign.status }}</span>
              <span
                >Fin:
                {{ new Date(campaign.end_date).toLocaleDateString() }}</span
              >
            </div>
          </div>
          <div
            v-if="!dashboard.campaignDetails?.length"
            class="text-center py-4 text-muted"
          >
            Aucune campagne active.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from "vue";
import api from "../../services/api";
import { useStore } from "vuex";

const store = useStore();

onMounted(() => {
  getData();
});

const getData = async () => {
  try {
    const response = await api.get("/dashboard");
    store.state.data.dashboard = response?.data ?? {};
  } catch (error) {
    console.error("Erreur lors de la récupération des données :", error);
    store.state.data.dashboard = {};
  }
};

const dashboard = computed(() => store.state.data.dashboard ?? {});

const formatMoney = (amount) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "Fbu",
  }).format(Number(amount) || 0);
};

const formatDateSimple = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>

<style scoped>
.dashboard-container {
  padding: 2rem;
  background-color: #f4f7fb;
  min-height: 100vh;
}

.dashboard-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.25rem;
}

/* Stats Cards */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  background: #fff;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.stat-icon.clients {
  background: rgba(0, 27, 51, 0.1);
  color: var(--primary-color);
}
.stat-icon.revenue {
  background: rgba(254, 202, 106, 0.2);
  color: #d97706;
}
.stat-icon.tickets {
  background: rgba(0, 27, 51, 0.05);
  color: var(--primary-color);
}
.stat-icon.campaigns {
  background: #001b33;
  color: var(--secondary-color);
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
  margin-bottom: 0.25rem;
  display: block;
}

.stat-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.growth-tag {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.growth-tag.positive {
  background: #dcfce7;
  color: #15803d;
}
.growth-tag.negative {
  background: #fee2e2;
  color: #b91c1c;
}

.stat-subtext {
  font-size: 0.8rem;
  margin: 0;
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: auto auto;
  gap: 1.5rem;
}

.activity-card {
  grid-row: span 2;
}

.card {
  border: none;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.card-header {
  background: #fff;
  border-bottom: 1px solid #f1f5f9;
  padding: 1.25rem 1.5rem;
}

.activity-item {
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #f8fafc;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon-sm {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.activity-icon-sm.client {
  background: #e0f2fe;
  color: #0284c7;
}
.activity-icon-sm.invoice {
  background: #ecfdf5;
  color: #059669;
}

.activity-details h6 {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
}

.activity-time {
  font-size: 0.75rem;
  color: #94a3b8;
}

.client-avatar {
  width: 32px;
  height: 32px;
  background: var(--primary-color);
  border-radius: 50%;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
}

.btn-link {
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 600;
  color: #448aff;
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
  .activity-card {
    grid-row: auto;
  }
}
</style>
