const state = {
  currentViewName: "show-exist-case-view", //"case-detail-view", //"show-exist-case-view",
};

const mutations = {
  SET_VIEW_NAME(state, newViewName) {
    state.currentViewName = newViewName;
  },
};

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
