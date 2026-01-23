import { createStore } from 'vuex'

// Create a new store instance.
const vuexStore = createStore({
  state () {
    return {
      data: {
        clients : [],
        invoices : [],
        assistances : [],
        marketing : [],
        communications : [],
        dashboard : [],
        admin : [],
        Utilisateurs:{},
        usersSupport:[],
        
      },
      isLoading: false,
      error: null,

    }
  },
  mutations: {
    SET_LOADING(state, value) {
      state.isLoading = value;
    },

  },
  actions: {
    setLoading({ commit }, value) {
      commit('SET_LOADING', value);
    }
  }
 
})

export default vuexStore
