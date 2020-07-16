// app 主页面的切换
const state = {
  currentViewName: "main-page", //"new-case-view", //"case-detail-view", //"show-exist-case-view",
  mainViewHeight: 0,
  contentViewHeight: 0,
  isCollapseLeftBar: false,
};

const mutations = {
  SET_VIEW_NAME(state, newViewName) {
    state.currentViewName = newViewName;
  },
  SET_MAIN_VIEW_HEIGHT(state, mainViewHeight) {
    state.mainViewHeight = mainViewHeight;
  },
  SET_CONTENT_VIEW_HEIGHT(state, contentViewHeight) {
    state.contentViewHeight = contentViewHeight;
  },
  SET_ISCOLLAPSELEFTBAR(state, isCollapseLeftBar) {
    state.isCollapseLeftBar = isCollapseLeftBar;
  },
};

const actions = {};

export default {
  state,
  mutations,
  actions,
  namespaced: true,
};
