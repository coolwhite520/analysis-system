import models from "../../db/Models";
const state = {
  existModelsDetailList: [],
};

const mutations = {
  SET_EXISTMODELSDETAILLIST(state, existModelsDetailList) {
    state.existModelsDetailList = existModelsDetailList;
  },
};

const getters = {
  renderModelsTreeList: (state) => {
    let newTreeList = [];
    let parentList = state.existModelsDetailList.filter((item) => {
      return item.parentid_200 === -1;
    });
    console.log(parentList);
    for (let father of parentList) {
      let childrenList = state.existModelsDetailList.filter((item) => {
        return item.parentid_200 === father.mid;
      });
      father.childrenList = childrenList;
      newTreeList.push(father);
    }
    return newTreeList;
  },
};

const actions = {
  async getExistModelsList({ commit }, tid) {
    commit("SET_EXISTMODELSDETAILLIST", []);
    let mids = await models.QueryModelmidsByTid(tid);
    if (mids.length > 0) {
      let modelsDetailList = await models.QueryModelListByMids(mids);
      commit("SET_EXISTMODELSDETAILLIST", modelsDetailList);
      console.log(modelsDetailList);
    }
  },
};

export default {
  getters,
  state,
  mutations,
  actions,
  namespaced: true,
};
