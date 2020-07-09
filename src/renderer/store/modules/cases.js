const state = {
  existCaseList: [
    {
      id: "1",
      name: "纵火",
      state: "new",
      dateTime: "2019023434",
    },
    {
      id: "2",
      name: "纵火",
      state: "new",
      dateTime: "2019023434",
    },
    {
      id: "3",
      name: "纵火",
      state: "over",
      dateTime: "2019023434",
    },
    {
      id: "4",
      name: "纵火",
      state: "over",
      dateTime: "2019023434",
    },
    {
      id: "15",
      name: "纵火",
      state: "over",
      dateTime: "2019023434",
    },
    {
      id: "16",
      name: "纵火",
      state: "over",
      dateTime: "2019023434",
    },
    {
      id: "17",
      name: "纵火",
      state: "over",
      dateTime: "2019023434",
    },
  ],
};

const mutations = {
  ADD_CASE_TO_LIST(state, newCase) {
    state.existCaseList.push(newCase);
  },
  DEL_CASE_FROM_LIST(state, delCase) {},
};

const actions = {
  someAsyncTask({ commit }) {
    // do something async
    //commit('INCREMENT_MAIN_COUNTER')
  },
};

export default {
  state,
  mutations,
  actions,
  namespaced: true,
};
