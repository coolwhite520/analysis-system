// 数据采集相关

import { ipcRenderer } from "electron";
import { registerMap } from "echarts";
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
  exampleDataList: [], //实例数组
};
const mutations = {
  ADD_CSV_DATA_TO_LIST(state, data) {
    console.log("push:", data);
    state.exampleDataList.push(data);
  },
  CLEAR_CSV_DATA_LIST(state) {
    state.exampleDataList = [];
  },
};

const getters = {
  renderDataList: (state) => {
    let renderList = [];
    for (let fileData of state.exampleDataList) {
      let index = 0;
      let fileDataObj = {};
      let dataList = [];
      for (let colName of fileData.colsName) {
        let obj = {
          field_name: colName,
          ins1: fileData.ins1.length > 0 ? fileData.ins1[index] : "",
          ins2: fileData.ins2.length > 0 ? fileData.ins2[index] : "",
        };
        index++;

        dataList.push(obj);
      }
      fileDataObj.fileName = fileData.fileName;
      fileDataObj.sheetName = fileData.sheetName;
      fileDataObj.dataList = dataList;
      renderList.push(fileDataObj);
    }
    return renderList;
  },
};

const actions = {};

export default {
  state,
  getters,
  mutations,
  actions,
  namespaced: true,
};
