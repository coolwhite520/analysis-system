// 主分析页面的页面切换
const state = {
  currentViewName: "", //"new-case-view", //"case-detail-view", //"show-exist-case-view",
  showRightSliderView: false,
};

const mutations = {
  SET_VIEW_NAME(state, newViewName) {
    state.currentViewName = newViewName;
  },
  SET_SHOWRIGHTSLIDERVIEW(state, showRightSliderView) {
    state.showRightSliderView = showRightSliderView;
  },
};

const actions = {};

export default {
  state,
  mutations,
  actions,
  namespaced: true,
};
