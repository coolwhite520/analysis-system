const state = {
  province_list: [],
  city_list: [],
  town_list: [],
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
