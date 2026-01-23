import { createApp, h } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import store from './store'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import PrimeVue from 'primevue/config';
import Toast from 'primevue/toast';
import Select from 'primevue/select';
import MultiSelect from 'primevue/multiselect';
import ToastService from 'primevue/toastservice';
import Lara from '@primeuix/themes/lara';
import Aura from '@primeuix/themes/aura'; 

// vSelect.props.components.default = () => ({
//     Deselect: {
//       render: () => h('span', '❌'),
//     },
//     OpenIndicator: {
//       render: () => h('span', '🔽'),
//     },
// });
  
createApp(App)
    .use(store)
    .use(router)
    .use(createPinia())
    .use(PrimeVue, {
        theme: {
        preset: Lara,
        options: {
            darkModeSelector: '.dark-mode',
        }
    }
    })
    .use(ToastService)
    .component('Toast', Toast)
    // .component('v-select', vSelect)
    .component('Select', Select)
    .component('MultiSelect', MultiSelect)
    .mount('#app')