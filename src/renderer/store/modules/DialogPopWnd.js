// 控制那些对话框的弹出与否
const state = {
  standardViewSwitch: "begin-import", // 标准采集的页面切换state
  standardDataVisible: false, // 标准采集
  autoDataVisible: false, //智能采集
};

const mutations = {
  SET_STANDARDVIEW(state, newViewName) {
    state.standardViewSwitch = newViewName;
  },
  SET_STANDARDDATAVISIBLE(state, standardDataVisible) {
    state.standardDataVisible = standardDataVisible;
  },

  SET_AUTODATAVISIBAL(state, autoDataVisible) {
    state.autoDataVisible = autoDataVisible;
  },
};

const actions = {};

export default {
  state,
  mutations,
  actions,
  namespaced: true,
};
