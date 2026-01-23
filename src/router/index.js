import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Import your components
import Login from '../views/auth/Login.vue'
import PageNotFound from '../views/errors/PageNotFound.vue'
import Dashboard from '../views/pages/Dashboard.vue'
import UsersPage from '../views/pages/users/UsersPage.vue';
import ClientsPage from '../views/pages/Clients/ClientsPage.vue'
import InvoicesPage from '@/views/pages/invoices/InvoicesPage.vue'
import AssistancesPage from '@/views/pages/assistances/AssistancesPage.vue'
import AssistanceAssignment from '@/views/pages/assistances/AssistanceAssignment.vue'
import MarketingPage from '@/views/pages/marketing/MarketingPage.vue'
import CommunicationPage from '@/views/pages/Communication/CommunicationPage.vue'
import Register from '@/views/auth/Register.vue'
import Profile from '@/views/auth/Profile.vue'

// Auth guard
const requireAuth = (to, from, next) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  if (!isAuthenticated) {
    next('/login');
  } else {
    next();
  }
};

const routes = [
  // Public routes
  
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { guest: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guest: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true , 
      roles: ['admin', 'support', 'marketing', 'finance']
     }
  },

  
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/clients',
    name: 'Client',
    component: ClientsPage,
    meta: { requiresAuth: true,      roles: ['admin', 'support', 'marketing', 'finance']
 }
  },
  {
    path: '/factures',
    name: 'Facture',
    component: InvoicesPage,
    meta: { requiresAuth: true,      roles: ['admin', 'support', 'marketing', 'finance']
 }
  },
  {
    path: '/marketing',
    name: 'Marketing',
    component: MarketingPage,
    meta: { requiresAuth: true,      
    roles: ['admin', 'support', 'marketing', 'finance']
 }
  },
  {
    path: '/assistances',
    name: 'Assistances',
    component: AssistancesPage,
    meta: { requiresAuth: true,
      roles: ['admin', 'support', 'marketing', 'finance']

     }
  },
  {
    path: '/assistances/assign',
    name: 'AssistanceAssignment',
    component: AssistanceAssignment,
    meta: { 
      requiresAuth: true,
      roles: ['admin'],
      title: 'Assignation des Assistances'
    }
  },
   {
    path: '/communication',
    name: 'Communication',
    component: CommunicationPage,
    meta: { requiresAuth: true,
            roles: ['support']

    }
  },
  {
    path: '/administration',
    name: 'Administration',
    component: UsersPage,
   // meta: { requiresAuth: true }
  },
  // 404 route
  {
    path: '/:pathMatch(.*)*',
    name: 'PageNotFound',
    component: PageNotFound,
    meta: { title: 'Page non trouvée' }
  },
 
 
  // 404 - Keep this as last route
  {
    path: '/:pathMatch(.*)*',
    name: 'PageNotFound',
    component: PageNotFound,
    meta: { title: 'Page non trouvée' }
  },

]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Always scroll to top when navigating to a new route
    return { top: 0, behavior: 'smooth' }
  }
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Set page title
  document.title = to.meta.title ? `${to.meta.title} | VOLT_CRM` : 'VOLT_CRM'
  
  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      authStore.setReturnUrl(to.fullPath)
      return next({ name: 'Login' })
    }
    
    return next()
  }
  
  // Redirect to dashboard if user is already authenticated and trying to access guest pages
  if (to.meta.guest && authStore.isAuthenticated) {
    return next({ name: 'dashboard' })
  }

  // if route declares required roles, check them
  if (to.meta?.roles && Array.isArray(to.meta.roles) && to.meta.roles.length) {
    if (!auth.hasAnyRole(to.meta.roles)) {
      // optionally redirect to not-authorized page or show message
      return next({ path: '/not-authorized' });
    }
  }
  
  next()
})

export default router;
