// 案件页面内容的切换
const state = {
  currentViewName: "show-exist-case-view", //"new-case-view", //"case-detail-view", //"show-exist-case-view",
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
