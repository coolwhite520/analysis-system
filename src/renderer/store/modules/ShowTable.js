import showTable from "../../db/DataShowTable";
import models from "../../db/Models";
import Vue from "vue";
import aes from "@/utils/aes";
import LinkSqlFormat from "@/utils/sql/LinkSqlFormat.js";
import sqlFormat from "@/utils/sql/ModelSqlFormat.js";

const state = {
  activeIndex: "", // 当前active的tab索引
  tableDataList: [], // 存放每个表的数据结构 { title: "标准采集" name: tid, componentName: "no-data-view", data: data}
  loadingShowData: false,
  currentTableData: {},
  pageIndex: "0", //为每个进来的table分配一个id，作为tab的标记
};

const mutations = {
  // 向数组添加新的表数据
  ADD_TABLE_DATA_TO_LIST(state, tableData) {
    state.currentTableData = tableData;
    let newId = parseInt(state.pageIndex);
    newId++;
    // 分配页面索引
    Vue.set(tableData, "pageIndex", String(newId));
    state.tableDataList.push(tableData);
    state.pageIndex = String(newId);
    state.activeIndex = state.pageIndex;
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
  UPDATE_TABLE_DATA(state, { pageIndex, rows, headers }) {
    for (let index = 0; index < state.tableDataList.length; index++) {
      let tableData = state.tableDataList[index];
      if (tableData.pageIndex === pageIndex) {
        if (rows) Vue.set(state.tableDataList[index], "rows", rows);
        if (headers) Vue.set(state.tableDataList[index], "headers", headers);
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
  // 更新图标的筛选条件
  UPDATE_TABLE_FILTER(state, { pageIndex, filter }) {
    for (let index = 0; index < state.tableDataList.length; index++) {
      let tableData = state.tableDataList[index];
      if (tableData.pageIndex === pageIndex) {
        Vue.set(
          state.tableDataList[index],
          "filter",
          JSON.parse(JSON.stringify(filter))
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
    });

    commit("SET_LOADINGSHOWDATA_STATE", false);
  },
  // 展示基础页面（数据中心的基本表格）
  async showBaseTable(
    { commit },
    {
      pageIndex, // 根据这个参数判定是否是新加入
      ajid, // 案件id
      tid, // 表的id
      title, // 表的名称显示在tab标签上面
      tableename, // 表格的英文名称
      count, // 查询数量
      selectCondition,
      offset, // 查询的偏移
      filter, // 过滤条件
      modelTreeList, // 基本表对应的右侧模型列表的tree结构，第一展示的时候需要保存
    }
  ) {
    commit("SET_LOADINGSHOWDATA_STATE", true);
    let data = await showTable.QueryBaseTableData(
      ajid,
      tid,
      tableename,
      filter,
      offset,
      count
    );
    console.log(data);
    if (data.success) {
      let { headers, rows, sum } = data;
      if (pageIndex) {
        // 更新数据
        commit("UPDATE_TABLE_DATA", { pageIndex, rows });
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
          filter,
          rightTabs: [],
          showType: 1,
        };
        if (modelTreeList) {
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

  async showModelTable(
    { commit, state },
    {
      pageIndex,
      ajid,
      tid,
      title,
      pgsqlTemplate, // 模版
      orderby, // 排序方式
      selectCondition, // 用户选择的东西
      filter, //过滤条件
      showType, //展示的方式
      count,
      offset,
      describe, // 模型描述
      mpids, // 子选项
    }
  ) {
    commit("SET_LOADINGSHOWDATA_STATE", true);
    let pgsqlTemplateDecode = aes.decrypt(pgsqlTemplate);
    let sql = sqlFormat.FormatModelSqlStr(
      pgsqlTemplateDecode,
      orderby,
      selectCondition,
      ajid,
      filter,
      ""
    );
    let data = await showTable.QueryModelTable(ajid, tid, sql, offset, count);
    if (data.success) {
      let { headers, rows, sum } = data;
      // 判断是否add，还是update

      if (pageIndex) {
        // 需要同时更新headers 和 showHeaders ,因为有的模型会修改展示的列名称
        commit("UPDATE_TABLE_DATA", { pageIndex, headers, rows });
      } else {
        let obj = {
          ajid,
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
          pgsqlTemplate,
          filter,
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
  // 点击link跳转的页面
  async showLinkTable(
    { commit, rootState },
    {
      pageIndex,
      ajid,
      tid,
      selectCondition,
      row,
      linkMid,
      fieldename,
      offset,
      count,
    }
  ) {
    console.log({
      pageIndex,
      ajid,
      tid,
      linkMid,
      row,
      selectCondition,
      fieldename,
      offset,
      count,
    });
    commit("SET_LOADINGSHOWDATA_STATE", true);
    let title = "";
    let pgsqlTemplateDecode = "";
    let orderby = "";
    let modelTreeList = [];
    let tableename = "";
    let sql = ""; //最后格式化后的真实sql
    if (linkMid === 4 || linkMid === 18) {
      for (let item of rootState.CaseDetail.dataCenterList) {
        for (let childItem of item.childrenArr) {
          if (String(childItem.tid) === String(linkMid)) {
            title = childItem.title;
            tableename = childItem.tablename;
            modelTreeList = childItem.modelTreeList;
            break;
          }
        }
      }
      // title = linkMid === 4 ? "资金交易明细" : "通话记录";
      let res = LinkSqlFormat.format(
        { M_TYPE: parseInt(tid), Sql_Detail: pgsqlTemplateDecode },
        row,
        selectCondition,
        fieldename.toUpperCase()
      );
      if (res) {
        // let tableename =
        //   linkMid === 4 ? "gas_bank_records" : "gas_phone_call_info";
        let filter = res.msg;
        let data = await showTable.QueryBaseTableData(
          ajid,
          linkMid,
          tableename,
          filter,
          offset,
          count
        );
        console.log(data);
        if (data.success) {
          let { headers, rows, sum } = data;
          if (pageIndex) {
            // 更新数据
            commit("UPDATE_TABLE_DATA", { pageIndex, rows });
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
              dispatchName: "ShowTable/showLinkTable",
              tableType: "base",
              hideEmptyField: false,
              filter,
              rightTabs: [],
              showType: 1,
              row,
              linkMid,
              fieldename,
            };

            if (modelTreeList) {
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
        }
      }
    } else {
      // 先根据linkmid获取sql模版
      let data = await models.QueryModelSqlTemplateByMid(linkMid);
      if (data.success) {
        let pgsqlTemplate = data.gpsqltemplate;
        title = data.modelname;
        pgsqlTemplateDecode = aes.decrypt(pgsqlTemplate);
        orderby = data.orderby;
        // 获取连接拼接的sql
        let res = LinkSqlFormat.format(
          { M_TYPE: parseInt(tid), Sql_Detail: pgsqlTemplateDecode },
          row,
          selectCondition,
          fieldename.toUpperCase()
        );
        if (res != null) {
          console.log({ res: res["msg"], orderby, selectCondition, ajid });
          // 最后格式化连接返回的模版
          let filter = res.msg;
          let childTid = res.type;
          sql = sqlFormat.FormatModelSqlStr(
            res["msg"],
            orderby,
            selectCondition,
            ajid,
            filter
          );
          data = await showTable.QueryModelTable(
            ajid,
            childTid,
            sql,
            offset,
            count
          );
          if (data.success) {
            let { headers, rows, sum } = data;
            // 判断是否add，还是update

            if (pageIndex) {
              // 需要同时更新headers 和 showHeaders ,因为有的模型会修改展示的列名称
              commit("UPDATE_TABLE_DATA", { pageIndex, headers, rows });
            } else {
              let obj = {
                ajid,
                tid,
                title,
                headers,
                showHeaders: headers,
                hideEmptyField: false,
                sum,
                rows,
                componentName: "table-data-view",
                dispatchName: "ShowTable/showLinkTable",
                tableType: "model",
                selectCondition,
                describe: "",
                pgsqlTemplate,
                filter,
                showType: 1,
                rightTabs: [],
                orderby,
                row,
                linkMid,
                fieldename,
              };
              // if (mpids && mpids.length > 0) {
              //   obj.rightTabs.push({
              //     tabIndex: "0",
              //     title: "&#xe61c;&nbsp;&nbsp;&nbsp;模型参数",
              //     mpids,
              //     componentName: "model-view",
              //     visible: true,
              //   });
              // }
              commit("ADD_TABLE_DATA_TO_LIST", obj);
            }
          }
        }
      }
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
