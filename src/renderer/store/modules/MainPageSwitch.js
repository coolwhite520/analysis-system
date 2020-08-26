// 主分析页面的页面切换
const state = {
  currentViewName: "", //"new-case-view", //"case-detail-view", //"show-exist-case-view",
  showTabBarView: true,
  exportProcessVisible: false,
  tabBarActiveName: "first",
};

const mutations = {
  SET_VIEW_NAME(state, newViewName) {
    state.currentViewName = newViewName;
  },
  SET_SHOWTABBARVIEW(state, showTabBarView) {
    state.showTabBarView = showTabBarView;
  },
  SET_EXPORTPROCESSVISIBLE(state, exportProcessVisible) {
    state.exportProcessVisible = exportProcessVisible;
  },
  SET_TABBARACTIVENAME(state, tabBarActiveName) {
    state.tabBarActiveName = tabBarActiveName;
  },
};

const actions = {};

export default {
  state,
  mutations,
  actions,
  namespaced: true,
};
