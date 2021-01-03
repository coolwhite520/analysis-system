import cases from "../../db/Cases";
import location from "../../db/Location";
const state = {
  ajbh: "000000", // 暂时没有用到，可以考虑使用
  ajmc: "",
  city_list: [],
  town_list: [],
  saveState: "",
  parent_ajid: 0,
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

  SET_PARENT_AJID(state, parent_ajid) {
    state.parent_ajid = parent_ajid;
  },
  SET_SAVE_STATE(state, saveState) {
    state.saveState = saveState;
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

  async getParentAjidByAjid({ commit }, ajid) {
    let parent_id = await cases.QueryParentAjidByChildID(ajid);
    commit("SET_PARENT_AJID", parent_id);
  },

  async saveCase({ commit }, caseObj) {
    const {
      ajid,
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

    let res = await cases.updateCaseBase(
      ajid,
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
    if (res) {
      commit("SET_SAVE_STATE", "success");
    } else commit("SET_SAVE_STATE", "failed");
  },
};

export default {
  state,
  mutations,
  actions,
  namespaced: true,
};
