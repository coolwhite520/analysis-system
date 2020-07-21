// 控制那些对话框的弹出与否
const state = {
  standardDataVisible: false, // 标准采集
  autoDataVisible: false, //智能采集
};

const mutations = {
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
