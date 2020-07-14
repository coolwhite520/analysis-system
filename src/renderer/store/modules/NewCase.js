import cases from "../../db/Cases";
import location from "../../db/Location";
const state = {
  ajbh: "000000", // 暂时没有用到，可以考虑使用
  ajmc: "",
  city_list: [],
  town_list: [],
  createState: "failed",
};
const mutations = {
  SET_AJBH(state, ajbh) {
    state.ajbh = ajbh;
  },
  SET_CITY_LIST(state, city_list) {
    state.city_list = city_list;
  },

  SET_TOWN_LIST(state, town_list) {
    state.town_list = town_list;
  },

  SET_CREATE_STATE(state, createState) {
    state.createState = createState;
  },
};

const actions = {
  async makeNewAjbh({ commit }) {
    let maxId = await cases.QueryCaseMaxCount();
    commit("SET_AJBH", String(maxId + 1).padStart(6, "0"));
  },

  async getCitylist({ commit }, provinceID) {
    let cityList = await location.QueryCityByProvinceID(provinceID);
    commit("SET_CITY_LIST", cityList);
  },

  async getTownlist({ commit }, cityID) {
    let townList = await location.QueryTownByCityID(cityID);
    commit("SET_TOWN_LIST", townList);
  },

  async createNewCase({ commit }, caseObj) {
    const {
      ajbh,
      ajmc,
      ajlb,
      ajlbmc,
      zcjddm,
      zcjdmc,
      cjsj,
      jjsj,
      xgsj,
      asjfsddxzqhdm,
      asjfsddxzqmc,
      jyaq,
      zhaq,
      cjr,
      sfsc,
      sfbdwkj,
      sjlx,
    } = caseObj;

    let res = await cases.CreateNewCase(
      ajbh,
      ajmc,
      ajlb,
      ajlbmc,
      zcjddm,
      zcjdmc,
      cjsj,
      jjsj,
      xgsj,
      asjfsddxzqhdm,
      asjfsddxzqmc,
      jyaq,
      zhaq,
      cjr,
      sfsc,
      sfbdwkj,
      sjlx
    );
    if (res) commit("SET_CREATE_STATE", "success");
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
