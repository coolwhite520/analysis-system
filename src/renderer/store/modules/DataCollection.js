// 数据采集相关

import { ipcRenderer } from "electron";
const state = {
  buttonGroupList: [
    {
      id: 1,
      pdm: "1020",
      mc: "银行数据",
      icon: "&#xe618;",
    },
    {
      id: 2,
      pdm: "1110",
      mc: "反洗钱数据",
      icon: "&#xe613;",
    },
    {
      id: 3,
      pdm: "1090",
      mc: "第三方数据",
      icon: "&#xe70f;",
    },
    {
      id: 4,
      pdm: "1030",
      mc: "税务数据",
      icon: "&#xe65f;",
    },
    {
      id: 5,
      pdm: "1040",
      mc: "话单数据",
      icon: "&#xe608;",
    },
    {
      id: 6,
      pdm: "1060",
      mc: "社交通讯数据",
      icon: "&#xe61e;",
    },
    {
      id: 7,
      pdm: "1080",
      mc: "物流数据",
      icon: "&#xe615;",
    },
    {
      id: 8,
      pdm: "1070",
      mc: "JASS数据",
      icon: "&#xe602;",
    },
  ],
  csvList: [],
};
const mutations = {
  SET_CSV_LIST(state, csvList) {
    state.csvList = csvList;
  },
};

const actions = {
  async readCsvFile({ commit }, filePathName) {
    ipcRenderer.on("read-csv-file-over", (event, data) => {
      console.log({ data });
      commit("SET_CSV_LIST", data);
    });
    // 密集cpu操作需要通过ipc通信了
    ipcRenderer.send("read-csv-file", filePathName);
  },
};

export default {
  state,
  mutations,
  actions,
  namespaced: true,
};
