// 数据采集相关
import { ipcRenderer } from "electron";
import dataImport from "../../db/DataImport";
import Vue from "vue";
const state = {
  buttonGroupList: require("../../json/buttonGroup.json"),
  exampleDataList: [], //实例数组
};
const mutations = {
  RESET_DATA_LIST(state) {
    state.exampleDataList = [];
  },
  // 添加数据到整体数组中
  ADD_CSV_DATA_TO_LIST(state, data) {
    state.exampleDataList.push(data);
  },
  // 清空数据数组
  CLEAR_CSV_DATA_LIST(state) {
    state.exampleDataList.splice(0);
  },
  // 删除某条数据
  DELETE_DATA_LIST_BY_INDEX(state, index) {
    state.exampleDataList.splice(index, 1);
  },
  DELETE_DATA_LIST_BY_ID(state, id) {
    let index = 0;
    for (let item of state.exampleDataList) {
      if (id === item.id) {
        state.exampleDataList.splice(index, 1);
        break;
      }
      index++;
    }
  },

  SET_INOUT_FLAG_BY_ID(state, { id, inFlag, outFlag }) {
    for (let index = 0; index < state.exampleDataList.length; index++) {
      if (id === state.exampleDataList[index].id) {
        console.log(inFlag, outFlag)
        Vue.set(state.exampleDataList[index], "inFlag", inFlag);
        Vue.set(state.exampleDataList[index], "outFlag", outFlag);
        break;
      }
    }
  },
  SET_IMPORT_DATA_PROCESS(state, { id, progress }) {
    let item = state.exampleDataList.find((c) => c.id === id);
    Vue.set(item, "progress", progress);
  },
  // 根据传递的索引修改最佳匹配的模版
  MODIFY_CSV_BESTMATCHTEMPLATE_DATA(state, { index, matchedMbdm }) {
    state.exampleDataList[index].matchedMbdm = matchedMbdm;
    let obj = state.exampleDataList[index].matchedMbdmList.find(
      (item) => item.mbdm === matchedMbdm
    );
    if (obj) {
      Vue.set(state.exampleDataList[index], "mbmc", obj.mbmc);
    }
  },
  // 通过传递索引、对应的template对应的列名、日志list重新修改匹配的列名称
  MODIFY_CSV_TEMPLATETOFIELDNAMES_DATA(
    state,
    { index, dbColsName, logMatchList, recordMatched }
  ) {
    state.exampleDataList[index].templateToFieldObjList = dbColsName;
    if (recordMatched.success) {
      let index = 0;
      state.exampleDataList[index].inFlag = recordMatched.inFlag;
      state.exampleDataList[index].outFlag = recordMatched.outFlag;
      for (let item of state.exampleDataList[index].dataList) {
        item.matchedFieldName = recordMatched.rows[index];
        index++;
      }
    } else {
      for (let item of state.exampleDataList[index].dataList) {
        let { fileColName } = item;
        let bestArray = state.exampleDataList[
          index
        ].templateToFieldObjList.filter((ele) => {
          return ele.fieldcname === fileColName;
        });
        item.matchedFieldName =
          bestArray.length > 0 ? bestArray[0].fieldename : "";
        // 如果没有直接匹配上，那么和log表再次进行匹配。
        if (item.matchedFieldName === "") {
          bestArray = logMatchList.filter((ele) => {
            return ele.columnname === fileColName;
          });
          if (bestArray.length > 0) {
            bestArray = dbColsName.filter((ele) => {
              return ele.fieldcname === bestArray[0].fieldname;
            });
            item.matchedFieldName =
              bestArray.length > 0 ? bestArray[0].fieldename : "";
          } else {
            item.matchedFieldName = "";
          }
        }
      }
    }

    // 查找相同的列,标示出来
    let resultSameArr = [];
    for (let item of state.exampleDataList[index].dataList) {
      for (let item2 of state.exampleDataList[index].dataList) {
        if (
          item !== item2 &&
          item.matchedFieldName === item2.matchedFieldName &&
          item.matchedFieldName !== "" &&
          item2.matchedFieldName !== ""
        ) {
          resultSameArr.push(item);
          resultSameArr.push(item2);
        }
      }
    }
    for (let item of state.exampleDataList[index].dataList) {
      item.sameMatchedRow = false;
    }
    for (let item of resultSameArr) {
      item.sameMatchedRow = true;
    }
  },
  // 根据传递的参数修改匹配的列名称
  MODIFY_CSV_MATCHEDFIELD_NAME_DATA(
    state,
    { index, matchedFieldName, currentRow }
  ) {
    let currentItemRow = currentRow.dataList[index];
    currentItemRow.matchedFieldName = matchedFieldName;

    let resultSameArr = [];
    for (let item of currentRow.dataList) {
      for (let item2 of currentRow.dataList) {
        if (
          item !== item2 &&
          item.matchedFieldName === item2.matchedFieldName &&
          item.matchedFieldName !== "" &&
          item2.matchedFieldName !== ""
        ) {
          resultSameArr.push(item);
          resultSameArr.push(item2);
        }
      }
    }
    for (let item of currentRow.dataList) {
      item.sameMatchedRow = false;
    }
    for (let item of resultSameArr) {
      item.sameMatchedRow = true;
    }
  },
  // 设置某条数据是否可以修改数据类型
  MODIFY_DATATYPE_ENABLEMODIFY(state, { enableModify, row }) {
    row.enableModify = enableModify;
  },

  // 修改数据类型显示的名称
  MODIFY_DATA_TYPENAME(state, { value, rowIndex }) {
    state.exampleDataList[rowIndex].mc = value;
  },
  // 修改匹配的模版列表
  MODIFY_MATCHTEMPLATE(state, { index, matchedMbdmList }) {
    state.exampleDataList[index].matchedMbdmList = matchedMbdmList;
  },

  // 设置导入的实例数组
  RET_SET_EXAMPLEDATALIST(state, list) {
    state.exampleDataList = list;
  },

  SET_TABLENAME_AND_INSERTFIELDS_AND_SJLYID(
    state,
    { id, tableName, needInsertFields, sjlyid }
  ) {
    for (let item of state.exampleDataList) {
      if (item.id === id) {
        Vue.set(item, "tableName", tableName);
        Vue.set(item, "needInsertFields", needInsertFields);
        Vue.set(item, "sjlyid", sjlyid);
        break;
      }
    }
  },

  // 设置每个页面的总条数
  SET_ROWSUM(state, { id, rowSum }) {
    for (let item of state.exampleDataList) {
      if (item.id === id) {
        Vue.set(item, "rowSum", rowSum);
        break;
      }
    }
  },

  MODIFY_SHOW_DATA_LIMIT_EX(state, { id, errorFields }) {
    for (let item of state.exampleDataList) {
      if (item.id === id) {
        Vue.set(item, "errorFields", errorFields);
        Vue.set(item, "isChecked", true);
        break;
      }
    }
  },
};

const getters = {};

const actions = {
  async changeMatchList({ commit, state }, { index, matchedMbdm }) {
    commit("MODIFY_CSV_BESTMATCHTEMPLATE_DATA", { index, matchedMbdm });
    let dbColsName = await dataImport.QueryColsNameByMbdm(matchedMbdm);
    dbColsName.unshift({
      fieldcname: "",
      fieldename: "",
    });

    let fileAllCols = state.exampleDataList[index].fileAllCols;
    let recordMatched = await dataImport.QueryMatchedRecordByFileAllCols(
      matchedMbdm,
      fileAllCols
    );
    // 查询log表获取数据
    let logMatchList = await dataImport.QueryInfoFromLogMatchByMbdm(
      matchedMbdm
    );
    commit("MODIFY_CSV_TEMPLATETOFIELDNAMES_DATA", {
      index,
      dbColsName,
      logMatchList,
      recordMatched,
    });
  },
  async modifyDataType({ commit, state }, { value, rowIndex }) {
    commit("MODIFY_DATA_TYPENAME", { value, rowIndex });
    let matchedMbdmList = await dataImport.QueryMatchTableListByPdm(value);
    commit("MODIFY_MATCHTEMPLATE", { index: rowIndex, matchedMbdmList });
    let matchedMbdm = await dataImport.QueryBestMatchMbdm(
      value,
      state.exampleDataList[rowIndex].fileAllCols
    );
    commit("MODIFY_CSV_BESTMATCHTEMPLATE_DATA", {
      index: rowIndex,
      matchedMbdm,
    });
    let dbColsName = await dataImport.QueryColsNameByMbdm(matchedMbdm);
    // 查询log表获取数据
    let logMatchList = await dataImport.QueryInfoFromLogMatchByMbdm(
      matchedMbdm
    );
    commit("MODIFY_CSV_TEMPLATETOFIELDNAMES_DATA", {
      index: rowIndex,
      dbColsName,
      logMatchList,
    });
  },

  async QueryErrorData(
    { commit },
    {
      id, // 表示exampleList中的每个子项
      ajid,
      tableName,
      matchedFields,
      index,
      limit,
      filterList,
      headers,
    }
  ) {
    let result = await dataImport.queryDataFromTable(
      ajid,
      tableName,
      matchedFields,
      index,
      limit,
      filterList,
      headers
    );
    if (result.success) {
      commit("MODIFY_SHOW_DATA_LIMIT_EX", {
        id,
        errorFields: result.errorFields,
      });
    }
  },
};

export default {
  state,
  getters,
  mutations,
  actions,
  namespaced: true,
};
