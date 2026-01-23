import axios from 'axios';
import store from '../store'; // importer le store directement
import useAuthStore from '../stores/auth';

const url = import.meta.env.VITE_APP_LOCAL
  ? import.meta.env.VITE_API_BASE_URL_LOCAL
  : import.meta.env.VITE_API_BASE_URL;

// Créer une instance axios
const apiClient = axios.create({
  baseURL: url,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: false,
  timeout: 10000,
});


// Intercepteur de requête
apiClient.interceptors.request.use(
  (config) => {
    store.commit('SET_LOADING', true); // ✅ mutation
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    store.commit('SET_LOADING', false); // même en cas d’erreur
    return Promise.reject(error);
  }
);

// Intercepteur de réponse
apiClient.interceptors.response.use(
  (response) => {
    store.commit('SET_LOADING', false); // ✅
    console.log('Response:', response.status, response.config.url);
    return response.data;
  },
  (error) => {
    store.commit('SET_LOADING', false); // ✅
    if (error.response) {
      console.error('Response error:', error.response.data);
    } else if (error.request) {
      console.error('Request error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    if(error.status === 401){
      console.log(error);
      localStorage.removeItem('auth_token');
      useAuthStore().logout();
      window.location.href = '/login';
    }
   
    return Promise.reject(error);
  }
);

export default {
  get(resource, params = {}) {
    return apiClient.get(resource, { params });
  },

  post(resource, data, config = {}) {
    return apiClient.post(resource, data, config);
  },

  put(resource, data) {
    return apiClient.put(resource, data);
  },

  patch(resource, data) {
    return apiClient.patch(resource, data);
  },

  delete(resource) {
    return apiClient.delete(resource);
  },

  setAuthToken(token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  clearAuthToken() {
    delete apiClient.defaults.headers.common['Authorization'];
  },

  async downloadPDF(resource, filename = 'file.pdf') {
    try {
      const response = await apiClient.get(resource, {
        responseType: 'arraybuffer', // important for PDF download
      });

      console.log('Response:', response);

       const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'clients-list.pdf';
    link.click();

    // cleanup
    window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF download error:', error);
    }
  },
};
