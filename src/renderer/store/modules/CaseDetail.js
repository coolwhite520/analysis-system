const state = {
  st_location: {
    province: {
      id: 110000,
      name: "",
    },
  },
};

const mutations = {};

const actions = {
  someAsyncTask({ commit }) {
    // do something async
    //commit('INCREMENT_MAIN_COUNTER')
  },
};

export default {
  state,
  mutations,
  actions,
  namespaced: true,
};
