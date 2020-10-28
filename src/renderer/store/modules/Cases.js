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
  DELETE_CASE_BYID(state, ajid) {
    for (let index = 0; index < state.existCaseList.length; index++) {
      let item = state.existCaseList[index];
      if (item.ajid === ajid) {
        state.existCaseList.splice(index, 1);
        break;
      }
    }
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
  async deleteAllCase({ commit }) {
    let case_list = await cases.QueryExistCases();
    // case_list = [{ ajid: 1 }, { ajid: 2 }, { ajid: 3 }];
    for (let item of case_list) {
      await cases.DropCaseByID(item.ajid);
      commit("DELETE_CASE_BYID", item.ajid);
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
