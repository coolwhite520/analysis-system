// app 主页面的切换
const state = {
  currentViewName: "main-page", //"new-case-view", //"case-detail-view", //"show-exist-case-view",
};

const mutations = {
  SET_VIEW_NAME(state, newViewName) {
    state.currentViewName = newViewName;
  },
};

const actions = {};

export default {
  state,
  mutations,
  actions,
  namespaced: true,
};
