import cases from "../../db/Cases";
const state = {
  existCaseList: [],
  inputValue: "",
};

const mutations = {
  GET_EXIST_CASE_LIST(state, case_lsit) {
    state.existCaseList = case_lsit;
  },
  ADD_CASE_TO_LIST(state, newCase) {
    state.existCaseList.push(newCase);
  },

  SET_INPUT_VALUE(state, newValue) {
    state.inputValue = newValue;
  },
};

const getters = {
  existCasesFilter: (state) => {
    return state.existCaseList.filter((item) => {
      return item.ajmc.includes(state.inputValue) > 0;
    });
  },
};

const actions = {
  async getExistCaseAsync({ commit }) {
    let case_list = await cases.QueryExistCases();
    commit("GET_EXIST_CASE_LIST", case_list);
  },
};

export default {
  getters,
  state,
  mutations,
  actions,
  namespaced: true,
};
