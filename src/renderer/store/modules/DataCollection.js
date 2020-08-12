// 数据采集相关
import { ipcRenderer } from "electron";
import dataImport from "../../db/DataImport";
import Vue from "vue";
const state = {
  buttonGroupList: require("../../json/buttonGroup.json"),
  exampleDataList: [], //实例数组
};
const mutations = {
  // 添加数据到整体数组中
  ADD_CSV_DATA_TO_LIST(state, data) {
    console.log("push:", data);
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
  // 根据传递的索引修改最佳匹配的模版
  MODIFY_CSV_BESTMATCHTEMPLATE_DATA(state, { index, bestMatchTemplate }) {
    state.exampleDataList[index].bestMatchTemplate = bestMatchTemplate;
  },
  // 通过传递索引、对应的template对应的列名、日志list重新修改匹配的列名称
  MODIFY_CSV_TEMPLATETOFIELDNAMES_DATA(
    state,
    { index, dbColsName, logMatchList }
  ) {
    state.exampleDataList[index].templateToFieldNames = dbColsName;
    for (let item of state.exampleDataList[index].dataList) {
      let { fileColName } = item;

      let bestArray = state.exampleDataList[index].templateToFieldNames.filter(
        (ele) => {
          return ele.fieldcname === fileColName;
        }
      );
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
  MODIFY_MATCHTEMPLATE(state, { index, matchTemplates }) {
    state.exampleDataList[index].matchTemplates = matchTemplates;
  },

  // 设置导入的实例数组
  RET_SET_EXAMPLEDATALIST(state, list) {
    state.exampleDataList = list;
  },

  SET_TABLENAME(state, { sheetIndex, tableName }) {
    state.exampleDataList[sheetIndex].tableName = tableName;
  },

  // 设置每个页面的总条数
  SET_ROWSUM(state, { sheetIndex, rowSum }) {
    Vue.set(state.exampleDataList[sheetIndex], "rowSum", rowSum);
  },
  // 修改展示的数据
  MODIFY_SHOW_DATA_LIMIT(state, { sheetIndex, rows, errorFields }) {
    Vue.set(state.exampleDataList[sheetIndex], "showRows", rows);
    Vue.set(state.exampleDataList[sheetIndex], "errorFields", errorFields);
  },
};

const getters = {};

const actions = {
  async changeMatchList({ commit }, { index, bestMatchTemplate }) {
    commit("MODIFY_CSV_BESTMATCHTEMPLATE_DATA", { index, bestMatchTemplate });
    let dbColsName = await dataImport.QueryColsNameByMbdm(bestMatchTemplate);
    // 查询log表获取数据
    let logMatchList = await dataImport.QueryInfoFromLogMatchByMbdm(
      bestMatchTemplate
    );

    commit("MODIFY_CSV_TEMPLATETOFIELDNAMES_DATA", {
      index,
      dbColsName,
      logMatchList,
    });
  },
  async modifyDataType({ commit, state }, { value, rowIndex }) {
    commit("MODIFY_DATA_TYPENAME", { value, rowIndex });
    let matchTemplates = await dataImport.QueryMatchTableListByPdm(value);
    commit("MODIFY_MATCHTEMPLATE", { index: rowIndex, matchTemplates });
    let bestMatchTemplate = await dataImport.QueryBestMatchMbdm(
      value,
      state.exampleDataList[rowIndex].fileColsName
    );
    commit("MODIFY_CSV_BESTMATCHTEMPLATE_DATA", {
      index: rowIndex,
      bestMatchTemplate,
    });
    let dbColsName = await dataImport.QueryColsNameByMbdm(bestMatchTemplate);
    // 查询log表获取数据
    let logMatchList = await dataImport.QueryInfoFromLogMatchByMbdm(
      bestMatchTemplate
    );
    commit("MODIFY_CSV_TEMPLATETOFIELDNAMES_DATA", {
      index: rowIndex,
      dbColsName,
      logMatchList,
    });
  },
  // sheetIndex（数据list对应的索引） ajid tableName， matchedFields，index（查询的索引） ， limit（查询的数量）
  async QueryTableData(
    { commit, state },
    {
      sheetIndex,
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
      let rowSum = await dataImport.queryRowsum(ajid, tableName);
      commit("SET_ROWSUM", {
        sheetIndex,
        rowSum: filterList.length > 0 ? result.rows.length : rowSum,
      });
      commit("MODIFY_SHOW_DATA_LIMIT", {
        sheetIndex,
        rows: result.rows,
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