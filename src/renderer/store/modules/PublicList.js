// 初始化就需要执行的公共函数
import cases from "../../db/Cases";
import location from "../../db/Location";
const state = {
  ajlb_list: [],
  zcjdmc_list: [],
  province_list: [],
};
const mutations = {
  SET_AJLB_LIST(state, ajlb_list) {
    state.ajlb_list = ajlb_list;
  },

  SET_ZCJDMC_LIST(state, zcjdmc_list) {
    state.zcjdmc_list = zcjdmc_list;
  },

  SET_PROVINCE_LIST(state, province_list) {
    state.province_list = province_list;
  },
};

const actions = {
  async getAJLBList({ commit }) {
    let ajlb_list = await cases.QueryCaseCategory();
    commit("SET_AJLB_LIST", ajlb_list);
  },

  async getZCJDMClist({ commit }) {
    let zcjdmc_list = await cases.QueryCaseState();
    commit("SET_ZCJDMC_LIST", zcjdmc_list);
  },

  async getProvincelist({ commit }) {
    let provinceList = await location.QueryProvince();
    commit("SET_PROVINCE_LIST", provinceList);
  },
};

const getters = {
  ajlbListWrapper: function(state) {
    let results_list = [];
    let root_list = state.ajlb_list.filter((item) => {
      return item.parent_id === 0;
    });
    let leaf_list = state.ajlb_list.filter((item) => {
      return item.leaf_flag === 0;
    });
    for (let root of root_list) {
      let option = {
        value: root.chargeid,
        label: root.chargename,
        children: [],
      };
      let bfind = false;
      for (let leaf of leaf_list) {
        if (leaf.parent_id === root.chargeid) {
          option.children.push({
            value: leaf.chargeid,
            label: leaf.chargename,
          });
          bfind = true;
        }
      }
      if (!bfind) {
        option.children = null;
      }
      results_list.push(option);
    }
    return results_list;
  },
};

export default {
  getters,
  state,
  mutations,
  actions,
  namespaced: true,
};
