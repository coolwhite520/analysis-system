import showTable from "../../db/DataShowTable";
import models from "../../db/Models";
import Vue from "vue";
import aes from "@/utils/aes";
import linkSqlFormat from "@/utils/sql/LinkSqlFormat.js";
import modelSqlFormat from "@/utils/sql/ModelSqlFormat.js";
import convertSql from "@/utils/sql/DataFiltrator.js";
import { link } from "fs";

const state = {
  activeIndex: "", // 当前active的tab索引
  tableDataList: [], // 存放每个表的数据结构 { title: "标准采集" name: tid, componentName: "no-data-view", data: data}
  loadingShowData: false,
  currentTableData: null,
  pageIndex: "0", //为每个进来的table分配一个id，作为tab的标记
};

const mutations = {
  // 向数组添加新的表数据
  ADD_TABLE_DATA_TO_LIST(state, tableData) {
    let newId = parseInt(state.pageIndex);
    newId++;
    // 分配页面索引
    Vue.set(tableData, "pageIndex", String(newId));
    state.tableDataList.push(tableData);
    state.pageIndex = String(newId);
    state.activeIndex = state.pageIndex;
    state.currentTableData = tableData;
  },
  // focus某个table
  SET_ACTIVEINDEX(state, activeIndex) {
    state.activeIndex = activeIndex;
    for (let index = 0; index < state.tableDataList.length; index++) {
      let tableData = state.tableDataList[index];
      if (tableData.pageIndex === state.activeIndex) {
        state.currentTableData = tableData;
        for (let tab of state.currentTableData.rightTabs) {
          tab.visible = true;
        }
      }
    }
  },
  // 都是针对的当前的操作窗口
  ADD_TABVIEW_TO_RIGHT_TABS(state, newTab) {
    let nextTabIndex = 0;
    for (let tab of state.currentTableData.rightTabs) {
      let valueIndex = parseInt(tab.tabIndex);
      if (valueIndex >= nextTabIndex) {
        nextTabIndex = valueIndex;
      }
    }
    nextTabIndex++;
    tab.tabIndex = String(nextTabIndex);
    state.currentTableData.rightTabs.push(newTab);
  },
  // 隐藏右侧的模型界面
  HIDE_CURRENT_TABLE_RIGHT_VIEW(state) {
    Vue.set(state.currentTableData, "showRightView", false);
  },
  // 设置隐藏列或者显示隐藏列
  SET_HIDEEMPTYFIELD(state, { hideEmptyField }) {
    Vue.set(state.currentTableData, "hideEmptyField", hideEmptyField);
    if (state.currentTableData.hideEmptyField) {
      let newShowHeaders = [];
      for (let header of state.currentTableData.headers) {
        let bFindNotNull = false;
        for (let row of state.currentTableData.rows) {
          if (row[header.fieldename].value) {
            bFindNotNull = true;
            break;
          }
        }
        if (bFindNotNull) {
          newShowHeaders.push(header);
        }
      }
      Vue.set(state.currentTableData, "showHeaders", newShowHeaders);
    } else {
      Vue.set(
        state.currentTableData,
        "showHeaders",
        state.currentTableData.headers
      );
    }
  },
  // 清空所有的表数据
  CLEAR_TABLE_LIST(state) {
    state.activeIndex = "";
    state.tableDataList = [];
    state.currentTableData = null;
    state.pageIndex = "0";
    state.loadingShowData = false;
  },

  // 修改loading的状态
  SET_LOADINGSHOWDATA_STATE(state, isLoading) {
    state.loadingShowData = isLoading;
  },

  // 跟新table的数据
  UPDATE_TABLE_DATA(state, { pageIndex, rows, headers, sum }) {
    for (let index = 0; index < state.tableDataList.length; index++) {
      let tableData = state.tableDataList[index];
      if (tableData.pageIndex === pageIndex) {
        if (typeof rows !== "undefined")
          Vue.set(state.tableDataList[index], "rows", rows);
        if (typeof sum !== "undefined")
          Vue.set(state.tableDataList[index], "sum", sum);
        if (typeof headers !== "undefined")
          Vue.set(state.tableDataList[index], "headers", headers);
        // 判断显示、隐藏状态进行显示
        if (state.currentTableData.hideEmptyField) {
          let newShowHeaders = [];
          for (let header of state.currentTableData.headers) {
            let bFindNotNull = false;
            for (let row of state.currentTableData.rows) {
              if (row[header.fieldename].value) {
                bFindNotNull = true;
                break;
              }
            }
            if (bFindNotNull) {
              newShowHeaders.push(header);
            }
          }
          Vue.set(state.currentTableData, "showHeaders", newShowHeaders);
        } else {
          Vue.set(
            state.currentTableData,
            "showHeaders",
            state.currentTableData.headers
          );
        }
        return;
      }
    }
  },
  // 更新模型用户选择参数
  UPDATE_MODEL_SELECTION(state, { pageIndex, selectCondition }) {
    for (let index = 0; index < state.tableDataList.length; index++) {
      let tableData = state.tableDataList[index];
      if (tableData.pageIndex === pageIndex) {
        Vue.set(
          state.tableDataList[index],
          "selectCondition",
          JSON.parse(JSON.stringify(selectCondition))
        );
        return;
      }
    }
  },
  // 更新筛选条件
  UPDATE_TABLE_FILTER(state, { pageIndex, modelFilterChildList }) {
    for (let index = 0; index < state.tableDataList.length; index++) {
      let tableData = state.tableDataList[index];
      if (tableData.pageIndex === pageIndex) {
        Vue.set(
          state.tableDataList[index],
          "modelFilterChildList",
          JSON.parse(JSON.stringify(modelFilterChildList))
        );
        return;
      }
    }
  },
  // 移除单个tableData
  REMOVE_TABLE_DATA_FROM_LIST(state, { pageIndex }) {
    let rightIndex = "";
    let leftIndex = "";
    for (let index = 0; index < state.tableDataList.length; index++) {
      leftIndex = state.tableDataList[index - 1]
        ? state.tableDataList[index - 1].pageIndex
        : "";
      rightIndex = state.tableDataList[index + 1]
        ? state.tableDataList[index + 1].pageIndex
        : "";

      let tableData = state.tableDataList[index];
      if (tableData.pageIndex === pageIndex) {
        state.tableDataList.splice(index, 1);
        break;
      }
    }
    if (state.activeIndex === pageIndex) {
      // 判断是否有右边的表格
      if (rightIndex !== "") state.activeIndex = rightIndex;
      else if (leftIndex !== "") state.activeIndex = leftIndex;
    }
    if (state.tableDataList.length === 0) {
      state.currentTableData = null;
    }
  },
  // 移除pageIndexList对应的table
  REMOVE_TABLE_DATAS_FROM_LIST(state, { pageIndexList }) {
    for (let index = state.tableDataList.length - 1; index >= 0; index--) {
      let tableData = state.tableDataList[index];
      let pageIndex = tableData.pageIndex;
      if (pageIndexList.includes(pageIndex)) {
        state.tableDataList.splice(index, 1);
      }
    }
    if (state.tableDataList.length === 0) {
      state.currentTableData = null;
    }
  },
  SET_RIGHT_TAB_VISIBLE(state, { pageIndex, tabIndex, visible }) {
    for (let index = 0; index < state.tableDataList.length; index++) {
      let tableData = state.tableDataList[index];
      if (tableData.pageIndex === pageIndex) {
        for (let tab of tableData.rightTabs) {
          if (tab.tabIndex === tabIndex) {
            tab.visible = visible;
          }
        }
      }
    }
  },
};

const getters = {};

const actions = {
  // 没有数据的时候显示数据采集页面
  async showNoDataPage({ commit }, { tablecname }) {
    commit("SET_LOADINGSHOWDATA_STATE", true);

    commit("ADD_TABLE_DATA_TO_LIST", {
      title: tablecname,
      componentName: "no-data-view",
      data: [],
      dispatchName: "ShowTable/showNoDataPage",
      showType: 1,
      rightTabs: [],
    });

    commit("SET_LOADINGSHOWDATA_STATE", false);
  },
  // 展示基础页面（数据中心的基本表格）
  async showBaseTable(
    { commit, rootState },
    {
      pageIndex, // 根据这个参数判定是否是新加入还是点击了下一页
      tid, // 表的id
      count, // 查询数量
      offset, // 查询的偏移
      modelFilterChildList, // 数据筛选
    }
  ) {
    commit("SET_LOADINGSHOWDATA_STATE", true);
    let ajid = rootState.CaseDetail.caseBase.ajid;
    let modelTreeList = [];
    let title = "";
    let tableename = "";
    for (let item of rootState.CaseDetail.dataCenterList) {
      for (let childItem of item.childrenArr) {
        if (String(childItem.tid) === String(tid)) {
          modelTreeList = childItem.modelTreeList;
          title = childItem.title; // 表的名称显示在tab标签上面
          tableename = childItem.tableename; // 表格的英文名称
          break;
        }
      }
    }
    let filterStr = convertSql.convertDataFilterToSqlStr(
      parseInt(tid),
      modelFilterChildList
    );
    let data = await showTable.QueryBaseTableData(
      ajid,
      tid,
      tableename,
      filterStr,
      offset,
      count
    );
    console.log(data);
    if (data.success) {
      let { headers, rows, sum } = data;
      if (pageIndex) {
        // 更新数据
        commit("UPDATE_TABLE_DATA", { pageIndex, rows, sum, headers });
      } else {
        let selectCondition = JSON.parse(
          JSON.stringify(global.defaultSelection)
        );
        let obj = {
          ajid,
          title,
          tid,
          headers,
          showHeaders: headers,
          sum,
          rows,
          selectCondition,
          componentName: "table-data-view",
          dispatchName: "ShowTable/showBaseTable",
          tableType: "base",
          hideEmptyField: false,
          modelFilterChildList,
          rightTabs: [],
          showType: 1,
        };
        if (modelTreeList && modelTreeList.length > 0) {
          obj.rightTabs.push({
            tabIndex: "0",
            title: "&#xe60f;&nbsp;&nbsp;&nbsp;模型库",
            modelTreeList,
            componentName: "model-list-view",
            visible: true,
          });
        }
        commit("ADD_TABLE_DATA_TO_LIST", obj);
      }
      commit("SET_LOADINGSHOWDATA_STATE", false);
    } else {
      console.log("errr........");
    }
  },

  // 执行模型列表中的模型
  async showModelTable(
    { commit, state, rootState },
    { pageIndex, tid, pgsqlTemplateDecode, count, offset }
  ) {
    commit("SET_LOADINGSHOWDATA_STATE", true);
    let ajid = rootState.CaseDetail.caseBase.ajid;
    // 所有的模型都是基于当前的表格进行的操作
    let {
      selectCondition,
      modelFilterStr,
      modelFilterChildList,
    } = state.currentTableData;

    // 第一次add重新赋值给modelfilter
    if (!pageIndex) {
      modelFilterChildList = null;
    }

    let {
      title,
      pgsqltemplate,
      orderby,
      mpids,
      showType,
      describe,
    } = await models.QueryModelSqlTemplateByMid(tid);

    if (typeof pgsqlTemplateDecode === "undefined") {
      pgsqlTemplateDecode = aes.decrypt(pgsqltemplate);
      // 过滤结构体转sql字符串
    }
    let filterChildStr = convertSql.convertDataFilterToSqlStr(
      parseInt(tid),
      modelFilterChildList
    );
    console.log({ modelFilterChildList, filterStr, filterChildStr });
    let sql = modelSqlFormat.format(
      pgsqlTemplateDecode,
      orderby,
      selectCondition,
      ajid,
      modelFilterStr,
      filterChildStr
    );
    let data = await showTable.QueryDataTableBySql(
      ajid,
      tid,
      sql,
      offset,
      count
    );
    if (data.success) {
      let { headers, rows, sum } = data;
      // 判断是否add，还是update
      if (pageIndex) {
        // 需要同时更新headers 和 showHeaders ,因为有的模型会修改展示的列名称
        commit("UPDATE_TABLE_DATA", { pageIndex, headers, rows, sum });
      } else {
        let obj = {
          tid,
          title,
          headers,
          showHeaders: headers,
          hideEmptyField: false,
          sum,
          rows,
          componentName: "table-data-view",
          dispatchName: "ShowTable/showModelTable",
          tableType: "model",
          selectCondition,
          describe,
          pgsqlTemplateDecode,
          modelFilterList,
          modelFilterChildList,
          showType,
          rightTabs: [],
          orderby,
        };
        if (mpids && mpids.length > 0) {
          obj.rightTabs.push({
            tabIndex: "0",
            title: "&#xe61c;&nbsp;&nbsp;&nbsp;模型参数",
            mpids,
            componentName: "model-view",
            visible: true,
          });
        }
        commit("ADD_TABLE_DATA_TO_LIST", obj);
      }
      commit("SET_LOADINGSHOWDATA_STATE", false);
    } else {
      console.log("errr...........");
    }
  },
  // 点击表格中的link跳转的页面查询
  async showLinkTable(
    { commit, rootState, state, dispatch },
    { tid, row, linkMid, fieldename }
  ) {
    commit("SET_LOADINGSHOWDATA_STATE", true);
    let selectCondition = state.currentTableData.selectCondition;
    if (linkMid === 4 || linkMid === 18) {
      // 相当于在基本表的sql基础添加了过滤条件
      let res = linkSqlFormat.format(
        { M_TYPE: parseInt(tid), Sql_Detail: "" },
        row,
        selectCondition,
        fieldename.toUpperCase()
      );
      // 执行基本表的查询并add到list中（不传递pageIndex即可）
      await dispatch("showBaseTable", {
        tid: String(linkMid),
        count: 30,
        offset: 0,
        modelFilterChildList: res.msg.obj,
      });
    } else {
      //相当于执行模型
      //1.先根据linkmid 获取模版
      let { pgsqltemplate } = await models.QueryModelSqlTemplateByMid(linkMid);
      let pgsqlTemplateDecode = aes.decrypt(pgsqltemplate);
      //2.格式化替换后生成link的模版
      let { msg, type } = linkSqlFormat.format(
        { M_TYPE: parseInt(tid), Sql_Detail: pgsqlTemplateDecode },
        row,
        selectCondition,
        fieldename.toUpperCase()
      );
      console.log({ msg, type });
      await dispatch("showModelTable", {
        tid: type,
        pgsqlTemplateDecode: msg.str,
        count: 30,
        offset: 0,
      });
    }

    commit("SET_LOADINGSHOWDATA_STATE", false);
  },
};
export default {
  state,
  mutations,
  actions,
  getters,
  namespaced: true,
};
