// app 主页面的切换
const state = {
  currentViewName: "main-page", //"new-case-view", //"case-detail-view", //"show-exist-case-view",
  mainViewHeight: 0,
};

const mutations = {
  SET_VIEW_NAME(state, newViewName) {
    state.currentViewName = newViewName;
  },
  SET_MAIN_VIEW_HEIGHT(state, mainViewHeight) {
    state.mainViewHeight = mainViewHeight;
  },
};

const actions = {};

export default {
  state,
  mutations,
  actions,
  namespaced: true,
};
