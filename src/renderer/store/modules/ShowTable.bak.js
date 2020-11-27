import showTable from "../../db/DataShowTable";
import models from "../../db/Models";
import Vue from "vue";
import aes from "@/utils/aes";
import Default from "@/utils/sql/Default.js";
import linkSqlFormat from "@/utils/sql/LinkSqlFormat.js";
import modelSqlFormat from "@/utils/sql/ModelSqlFormat.js";
import convertSql from "@/utils/sql/DataFiltrator.js";

const uuid = require("uuid");
const log = require("@/utils/log");
// 关系图设置的金额区间

const state = {
  activeIndex: "", // 当前active的tab索引
  tableDataList: [], // 存放每个表的数据结构 { title: "标准采集" name: tid, componentName: "no-data-view", data: data}
  loadingShowData: false,
  currentTableData: null,
  pageIndex: "0", //为每个进来的table分配一个id，作为tab的标记
};

const mutations = {
  // 恢复默认金额颜色
  SET_NEW_MONEY_SPAN_COLOR(state, graphicMoneySectionList) {
    Vue.set(
      state.currentTableData,
      "graphicMoneySectionList",
      graphicMoneySectionList
    );
  },

  // 设置线宽
  SET_NEW_XIAN_KUAN(state, xianKuanSetting) {
    Vue.set(
      state.currentTableData,
      "xianKuanSetting",
      JSON.parse(JSON.stringify(xianKuanSetting))
    );
  },

  // 设置关系表中的实体list
  UPDATE_ENTITY_LIST(state, entityList) {
    Vue.set(
      state.currentTableData,
      "entityList",
      JSON.parse(JSON.stringify(entityList))
    );
    // Vue.set(state.currentTableData, "rightActiveName", "entity-list-view");
  },
  UPDATE_COMBO_ENTITY_LIST(
    state,
    { comboName, comboentityList, comboTableData }
  ) {
    Vue.set(
      state.currentTableData,
      "comboInfo",
      JSON.parse(JSON.stringify({ comboName, comboentityList, comboTableData }))
    );
    Vue.set(
      state.currentTableData,
      "rightActiveName",
      "combo-entity-list-view"
    );
  },
  // 设置关系表中当前显示的实体信息
  UPDATE_ENTITY(state, entity) {
    Vue.set(
      state.currentTableData,
      "entity",
      JSON.parse(JSON.stringify(entity))
    );
    Vue.set(state.currentTableData, "rightActiveName", "entity-view");
  },

  // 向数组添加新的表数据
  ADD_TABLE_DATA_TO_LIST(state, tableData) {
    const uuid = require("uuid");
    let newId = parseInt(state.pageIndex);
    newId++;
    // 分配页面索引
    Vue.set(tableData, "pageIndex", String(newId));
    Vue.set(tableData, "uuid", uuid.v1());
    if (tableData.showType === 3) {
      Vue.set(
        tableData,
        "graphicMoneySectionList",
        JSON.parse(JSON.stringify(Default.graphicMoneySectionList))
      );
      Vue.set(
        tableData,
        "xianKuanSetting",
        JSON.parse(JSON.stringify(Default.xianKuanSetting))
      );
      tableData.SpreadNodeSwitch = false;

      Vue.set(tableData, "graphid", uuid.v1());
      Vue.set(tableData, "graphType", "");
      Vue.set(tableData, "fullScrrenFlag", false);
    } else if (tableData.showType === 2) {
      Vue.set(
        tableData,
        "graphicMoneySectionList",
        JSON.parse(JSON.stringify(Default.graphicMoneySectionList))
      );
      Vue.set(
        tableData,
        "xianKuanSetting",
        JSON.parse(JSON.stringify(Default.xianKuanSetting))
      );
      tableData.SpreadNodeSwitch = false;

      Vue.set(tableData, "graphid", uuid.v1());
      Vue.set(tableData, "graphType", "");
      Vue.set(tableData, "fullScrrenFlag", false);
    }
    state.tableDataList.push(tableData);
    state.pageIndex = String(newId);
    state.activeIndex = state.pageIndex;
    state.currentTableData = tableData;
  },

  SWITCH_GRAPH_LAYOUT_TYPE(state, graphType) {
    Vue.set(state.currentTableData, "graphType", graphType);
  },
  // 放大到全屏 缩小
  UPDATE_FULLSCRRENFLAG(state) {
    let flag = state.currentTableData.fullScrrenFlag;
    Vue.set(state.currentTableData, "fullScrrenFlag", !flag);
  },
  // 修改金额区间的选定状态
  MODIFY_MONDY_SECTION_CHECKED(state, id) {
    for (
      let index = 0;
      index < state.currentTableData.graphicMoneySectionList.length;
      index++
    ) {
      if (state.currentTableData.graphicMoneySectionList[index].id === id) {
        state.currentTableData.graphicMoneySectionList[index].selected = !state
          .currentTableData.graphicMoneySectionList[index].selected;
        break;
      }
    }
  },
  MOIDFY_GRAPHICMONEYSECTIONLIST(state, graphicMoneySectionList) {
    Vue.set(
      state.currentTableData,
      "graphicMoneySectionList",
      graphicMoneySectionList
    );
  },
  // focus某个table
  SET_ACTIVEINDEX(state, activeIndex) {
    state.activeIndex = activeIndex;
    for (let tableData of state.tableDataList) {
      if (tableData.pageIndex === state.activeIndex) {
        state.currentTableData = tableData;
      }
    }
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
  UPDATE_TABLE_DATA(state, { pageIndex, rows, headers, sum, allrows }) {
    for (let index = 0; index < state.tableDataList.length; index++) {
      let tableData = state.tableDataList[index];
      if (tableData.pageIndex === pageIndex) {
        if (typeof rows !== "undefined")
          Vue.set(state.tableDataList[index], "rows", rows);
        if (typeof sum !== "undefined")
          Vue.set(state.tableDataList[index], "sum", sum);
        if (typeof headers !== "undefined")
          Vue.set(state.tableDataList[index], "headers", headers);
        if (typeof allrows !== "undefined")
          Vue.set(state.tableDataList[index], "allrows", allrows);
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
  SET_TABLE_ORDERBY(state, orderby) {
    Vue.set(state.currentTableData, "orderby", orderby);
  },
  SET_SPREADNODESWITCH(state, SpreadNodeSwitch) {
    state.currentTableData.SpreadNodeSwitch = SpreadNodeSwitch;
  },
  // 设置显示列
  SET_SHOWHAEDERS(state, newShowHeaders) {
    Vue.set(state.currentTableData, "showHeaders", newShowHeaders);
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
      state.currentTableData.rightTabs = [];
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
  // 设置active
  SET_RIGHT_TAB_ACTIVE(state, componentName) {
    // state.currentTableData.rightActiveName = componentName;
    Vue.set(state.currentTableData, "rightActiveName", componentName);
  },
  CLEAR_ALL_RIGHT_TABS(state) {
    state.currentTableData.rightTabs = [];
  },
  ADD_OR_REMOVE_RIGHT_TAB(state, { componentName, action }) {
    let tabs = state.currentTableData.rightTabs;
    if (action === "add") {
      for (let index = 0; index < tabs.length; index++) {
        let tab = tabs[index];
        if (componentName === tab.componentName) {
          Vue.set(state.currentTableData, "rightActiveName", componentName);

          return;
        }
      }
      switch (componentName) {
        case "model-list-view":
          state.currentTableData.rightTabs.push({
            title: "&#xe60f;&nbsp;&nbsp;&nbsp;模型库",
            componentName: "model-list-view",
          });
          break;
        case "model-view":
          state.currentTableData.rightTabs.push({
            title: "&#xe61c;&nbsp;&nbsp;&nbsp;模型参数",
            componentName: "model-view",
          });
          break;
        case "combo-entity-list-view":
          state.currentTableData.rightTabs.push({
            title: "&#xe61c;&nbsp;&nbsp;&nbsp;分组实体列表",
            componentName: "combo-entity-list-view",
          });
          break;
        case "entity-list-view":
          state.currentTableData.rightTabs.push({
            title: "&#xe61c;&nbsp;&nbsp;&nbsp;实体列表",
            componentName: "entity-list-view",
          });
          break;
        case "entity-view":
          state.currentTableData.rightTabs.push({
            title: "&#xe61c;&nbsp;&nbsp;&nbsp;实体信息",
            componentName: "entity-view",
          });
          break;
        case "search-replace-view":
          state.currentTableData.rightTabs.push({
            title: "&#xe61c;&nbsp;&nbsp;&nbsp;查找替换",
            componentName: "search-replace-view",
          });
          break;
        case "special-char-view":
          state.currentTableData.rightTabs.push({
            title: "&#xe61c;&nbsp;&nbsp;&nbsp;特殊字符",
            componentName: "special-char-view",
          });
          break;
        case "ineffect-data-view":
          state.currentTableData.rightTabs.push({
            title: "&#xe61c;&nbsp;&nbsp;&nbsp;无效数据",
            componentName: "ineffect-data-view",
          });
          break;
        case "data-diff-view":
          state.currentTableData.rightTabs.push({
            title: "&#xe61c;&nbsp;&nbsp;&nbsp;数据去重",
            componentName: "data-diff-view",
          });
          break;
      }
      Vue.set(state.currentTableData, "rightActiveName", componentName);
      return;
    } else {
      for (let index = 0; index < tabs.length; index++) {
        let currentTab = state.currentTableData.rightTabs[index];
        if (currentTab.componentName === componentName) {
          state.currentTableData.rightTabs.splice(index, 1);
          if (state.currentTableData.rightTabs.length > 0) {
            Vue.set(
              state.currentTableData,
              "rightActiveName",
              state.currentTableData.rightTabs[
                state.currentTableData.rightTabs.length - 1
              ].componentName
            );
          }
          break;
        }
      }
    }
  },
  // 记录右侧特殊字符tree的原始数据
  SET_SPECIALCHAR_TREE_DATA(state, specialCharData) {
    Vue.set(state.currentTableData, "specialCharData", specialCharData);
  },
  SET_INEFFECTDATA_TREE_DATA(state, ineffectData) {
    Vue.set(state.currentTableData, "ineffectData", ineffectData);
  },
  SET_DIFFDATA_TREE_DATA(state, diffData) {
    Vue.set(state.currentTableData, "diffData", diffData);
  },
  // 记录特殊字符错误数据
  SET_RENDERERRORDATA(state, renderErrorData) {
    Vue.set(state.currentTableData, "renderErrorData", renderErrorData);
  },
  SAVE_GRAPHDATA(state, { graphid, relationGraphData }) {
    for (let tableData of state.tableDataList) {
      if (tableData.graphid === graphid) {
        Vue.set(tableData, "saveRelationGraphDataOk", false);
        Vue.set(
          tableData,
          "relationGraphData",
          JSON.parse(JSON.stringify(relationGraphData))
        );
        Vue.set(tableData, "saveRelationGraphDataOk", true);
        break;
      }
    }
  },
};

const getters = {};

const actions = {
  // 没有数据的时候显示数据采集页面
  async showNoDataPage({ commit }, { title }) {
    commit("SET_LOADINGSHOWDATA_STATE", true);

    commit("ADD_TABLE_DATA_TO_LIST", {
      title,
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
    { commit, state, rootState },
    {
      pageIndex, // 根据这个参数判定是否是新加入还是点击了下一页
      tid, // 表的id
      count, // 查询数量
      offset, // 查询的偏移
      selectCondition,
      modelFilterStr,
      modelFilterChildList, // 数据筛选
    }
  ) {
    commit("SET_LOADINGSHOWDATA_STATE", true);
    let ajid = rootState.CaseDetail.caseBase.ajid;

    if (typeof selectCondition === "undefined") {
      // 添加新表
      selectCondition = JSON.parse(JSON.stringify(Default.defaultSelection));
    }
    if (typeof modelFilterStr === "undefined") {
      modelFilterStr = "";
    }
    if (typeof modelFilterChildList === "undefined") {
      modelFilterChildList = [];
    }

    let modelTreeList = [];
    let title = "";
    let tableename = "";
    for (let item of rootState.CaseDetail.dataCenterList) {
      for (let childItem of item.childrenArr) {
        if (String(childItem.tid) === String(tid)) {
          modelTreeList = childItem.modelTreeList;
          title = childItem.title; // 表的名称显示在tab标签上面
          tableename = childItem.tablename; // 表格的英文名称
          break;
        }
      }
    }

    let filterChildStr = convertSql.convertDataFilterToSqlStr(
      parseInt(tid),
      modelFilterChildList
    );
    // 新添加的需要
    if (
      !pageIndex &&
      state.currentTableData &&
      state.currentTableData.componentName !== "no-data-view"
    ) {
      modelFilterStr =
        tid !== "1"
          ? state.currentTableData.modelFilterStr + filterChildStr
          : filterChildStr;
    } else {
      modelFilterStr = filterChildStr;
    }

    // 需要累加过滤条件
    let data;
    if (
      typeof pageIndex !== "undefined" &&
      state.currentTableData &&
      state.currentTableData.hasOwnProperty("orderby")
    ) {
      let orderby = state.currentTableData.orderby;
      data = await showTable.QueryBaseTableData(
        ajid,
        tid,
        tableename,
        modelFilterStr,
        offset,
        count,
        orderby
      );
    } else {
      data = await showTable.QueryBaseTableData(
        ajid,
        tid,
        tableename,
        modelFilterStr,
        offset,
        count
      );
    }

    if (data.success) {
      let { headers, rows, sum, exportSql } = data;
      if (pageIndex) {
        // 更新数据
        commit("UPDATE_TABLE_DATA", { pageIndex, rows, sum, headers });
      } else {
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
          modelFilterStr,
          modelFilterChildList,
          rightTabs: [],
          showType: 1,
          tableename,
          exportSql,
        };
        if (modelTreeList && modelTreeList.length > 0) {
          let openeds = modelTreeList.map((item) => `${item.mid}`);
          obj.modelTree = { treeList: modelTreeList, openeds };
          obj.rightActiveName = "model-list-view";
          obj.rightTabs.push({
            title: "&#xe60f;&nbsp;&nbsp;&nbsp;模型库",
            componentName: "model-list-view",
          });
        }
        commit("ADD_TABLE_DATA_TO_LIST", obj);
      }
      commit("SET_LOADINGSHOWDATA_STATE", false);
    } else {
      log.info("errr........");
    }
  },

  // 执行模型列表中的模型
  async showModelTable(
    { commit, state, rootState },
    {
      pageIndex,
      tid,
      pgsqlTemplateDecode,
      count,
      offset,
      selectCondition,
      modelFilterStr,
      modelFilterChildList,
    }
  ) {
    commit("SET_LOADINGSHOWDATA_STATE", true);
    let ajid = rootState.CaseDetail.caseBase.ajid;

    if (typeof selectCondition === "undefined") {
      // 添加新表
      selectCondition = JSON.parse(JSON.stringify(Default.defaultSelection));
    }
    if (typeof modelFilterStr === "undefined") {
      modelFilterStr = "";
    }
    if (typeof modelFilterChildList === "undefined") {
      modelFilterChildList = [];
    }

    let {
      title,
      pgsqltemplate,
      orderby,
      mpids,
      showType,
      describe,
    } = await models.QueryModelSqlTemplateByMid(tid);

    if (
      typeof pageIndex !== "undefined" &&
      state.currentTableData &&
      state.currentTableData.hasOwnProperty("orderby")
    ) {
      orderby = state.currentTableData.orderby;
    }

    if (typeof pgsqlTemplateDecode === "undefined") {
      pgsqlTemplateDecode = aes.decrypt(pgsqltemplate);
      // 过滤结构体转sql字符串
    }
    let filterChildStr = convertSql.convertDataFilterToSqlStr(
      parseInt(tid),
      modelFilterChildList
    );
    let sql = modelSqlFormat.format(
      pgsqlTemplateDecode,
      orderby,
      selectCondition,
      ajid,
      modelFilterStr,
      filterChildStr
    );
    console.log(sql);
    let data = await showTable.QueryModelDataTableBySql(
      ajid,
      tid,
      sql,
      offset,
      count
    );
    if (data.success) {
      let { headers, rows, sum, exportSql, allrows } = data;
      // 判断是否add，还是update
      if (pageIndex) {
        // 需要同时更新headers 和 showHeaders ,因为有的模型会修改展示的列名称
        commit("UPDATE_TABLE_DATA", { pageIndex, headers, rows, sum, allrows });
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
          describe,
          pgsqlTemplateDecode,
          selectCondition,
          modelFilterStr,
          modelFilterChildList,
          showType,
          rightTabs: [],
          orderby,
          exportSql,
          allrows,
        };
        if (mpids && mpids.length > 0) {
          obj.mpids = mpids;
          obj.rightActiveName = "model-view";
          obj.rightTabs.push({
            title: "&#xe61c;&nbsp;&nbsp;&nbsp;模型参数",
            componentName: "model-view",
          });
        }
        commit("ADD_TABLE_DATA_TO_LIST", obj);
      }
      commit("SET_LOADINGSHOWDATA_STATE", false);
    } else {
      log.info("errr...........");
    }
  },
  // 点击表格中的link跳转的页面查询, 每次点击link的时候需要传递当前页面的modelFilterStr;
  async showLinkTable(
    { commit, state, dispatch },
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
      let filterChildStr = convertSql.convertDataFilterToSqlStr(
        parseInt(tid),
        state.currentTableData.modelFilterChildList
      );
      await dispatch("showModelTable", {
        tid: type,
        pgsqlTemplateDecode: msg.str,
        modelFilterStr: filterChildStr,
        modelFilterChildList: [],
        count: 30,
        offset: 0,
      });
    }

    commit("SET_LOADINGSHOWDATA_STATE", false);
  },
  // 执行数据可视化
  async showDataVisibleTable(
    { commit, state, rootState },
    {
      pageIndex,
      tid,
      pgsqlTemplateDecode,
      count,
      offset,
      selectCondition,
      modelFilterStr,
      modelFilterChildList,
      selectShowTypeValue,
      selectDataTypeValue,
      imgSrc,
      title,
    }
  ) {
    commit("SET_LOADINGSHOWDATA_STATE", true);
    let ajid = rootState.CaseDetail.caseBase.ajid;

    if (typeof selectCondition === "undefined") {
      // 添加新表
      selectCondition = JSON.parse(JSON.stringify(Default.defaultSelection));
    }
    if (typeof modelFilterStr === "undefined") {
      modelFilterStr = "";
    }
    if (typeof modelFilterChildList === "undefined") {
      modelFilterChildList = [];
    }

    let {
      pgsqltemplate,
      orderby,
      describe,
    } = await models.QueryModelSqlTemplateByMid(tid);
    console.log({ pgsqltemplate });
    if (typeof pgsqlTemplateDecode === "undefined") {
      pgsqlTemplateDecode = aes.decrypt(pgsqltemplate);
      // 过滤结构体转sql字符串
    }
    let filterChildStr = convertSql.convertDataFilterToSqlStr(
      parseInt(tid),
      modelFilterChildList
    );
    let sql = modelSqlFormat.format(
      pgsqlTemplateDecode,
      orderby,
      selectCondition,
      ajid,
      modelFilterStr,
      filterChildStr
    );
    console.log(sql);
    let data = await showTable.QueryModelDataTableBySql(
      ajid,
      tid,
      sql,
      offset,
      count
    );
    if (data.success) {
      let { headers, rows, sum, exportSql, allrows } = data;
      // 判断是否add，还是update
      if (pageIndex) {
        // 需要同时更新headers 和 showHeaders ,因为有的模型会修改展示的列名称
        commit("UPDATE_TABLE_DATA", { pageIndex, headers, rows, sum, allrows });
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
          dispatchName: "ShowTable/showDataVisibleTable",
          tableType: "dataVisible",
          describe,
          pgsqlTemplateDecode,
          selectCondition,
          modelFilterStr,
          modelFilterChildList,
          showType: 2, // 数据可视化不显示table数据
          rightTabs: [],
          orderby,
          exportSql,
          allrows,
          selectShowTypeValue,
          selectDataTypeValue,
          imgSrc,
        };
        commit("ADD_TABLE_DATA_TO_LIST", obj);
      }
      commit("SET_LOADINGSHOWDATA_STATE", false);
    } else {
      log.info("errr...........");
    }
  },
};
export default {
  state,
  mutations,
  actions,
  getters,
  namespaced: true,
};
