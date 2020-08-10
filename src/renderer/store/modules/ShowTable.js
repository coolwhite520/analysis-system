import showTable from "../../db/DataShowTable";
import Vue from "vue";
const state = {
  activeIndex: "", // 当前active的tab标签
  tableDataList: [], // 存放每个表的数据结构 { title: "标准采集" name: tid, componentName: "no-data-view", data: data}
  loadingShowData: false,
};

const mutations = {
  ADD_TABLE_DATA_TO_LIST(state, tableData) {
    state.tableDataList.push(tableData);
  },
  SET_ACTIVEINDEX(state, activeIndex) {
    state.activeIndex = activeIndex;
  },
  CLEAR_TABLE_LIST(state) {
    state.tableDataList = [];
  },
  SET_LOADINGSHOWDATA_STATE(state, isLoading) {
    state.loadingShowData = isLoading;
  },
  UPDATE_TABLE_DATA(state, { tid, data }) {
    for (let index = 0; index < state.tableDataList.length; index++) {
      let tableData = state.tableDataList[index];
      if (tableData.tid === tid) {
        console.log("UPDATE_TABLE_DATA", data);
        Vue.set(state.tableDataList[index], "data", data);
        // state.tableDataList.splice(index, 1, data);
        return;
      }
    }
  },
  SET_DISPATCHNAME(state, { tid, dispatchName }) {
    for (let index = 0; index < state.tableDataList.length; index++) {
      let tableData = state.tableDataList[index];
      if (tableData.tid === tid) {
        state.tableDataList[index].dispatchName = dispatchName;
        Vue.set(state.tableDataList[index], "dispathName", dispatchName);
        return;
      }
    }
  },

  SET_PGSQL(state, { tid, pgsql }) {
    for (let index = 0; index < state.tableDataList.length; index++) {
      let tableData = state.tableDataList[index];
      if (tableData.tid === tid) {
        state.tableDataList[index].pgsql = pgsql;
        Vue.set(state.tableDataList[index], "pgsql", pgsql);
        return;
      }
    }
  },
  SET_SHOW_TYPE(state, { tid, showType }) {
    for (let index = 0; index < state.tableDataList.length; index++) {
      let tableData = state.tableDataList[index];
      if (tableData.tid === tid) {
        state.tableDataList[index].showType = showType;
        Vue.set(state.tableDataList[index], "showType", showType);
        return;
      }
    }
  },
  SET_ODERBY(state, { tid, orderby }) {
    for (let index = 0; index < state.tableDataList.length; index++) {
      let tableData = state.tableDataList[index];
      if (tableData.tid === tid) {
        state.tableDataList[index].orderby = orderby;
        Vue.set(state.tableDataList[index], "orderby", orderby);
        return;
      }
    }
  },
  SET_MODEL_MPIDS(state, { tid, mpids }) {
    for (let index = 0; index < state.tableDataList.length; index++) {
      let tableData = state.tableDataList[index];
      if (tableData.tid === tid) {
        state.tableDataList[index].mpids = mpids;
        Vue.set(state.tableDataList[index], "mpids", mpids);
        return;
      }
    }
  },
  SET_MODEL_PARAMS(state, { tid, params }) {
    for (let index = 0; index < state.tableDataList.length; index++) {
      let tableData = state.tableDataList[index];
      if (tableData.tid === tid) {
        state.tableDataList[index].params = params;
        Vue.set(state.tableDataList[index], "params", params);
        return;
      }
    }
  },
  REMOVE_TABLE_DATA_FROM_LIST(state, { tid }) {
    let rightTid = "";
    let leftTid = "";
    for (let index = 0; index < state.tableDataList.length; index++) {
      leftTid = state.tableDataList[index - 1]
        ? state.tableDataList[index - 1].tid
        : "";
      rightTid = state.tableDataList[index + 1]
        ? state.tableDataList[index + 1].tid
        : "";

      let tableData = state.tableDataList[index];
      if (tableData.tid === tid) {
        console.log("REMOVE_TABLE_DATA_FROM_LIST");
        state.tableDataList.splice(index, 1);
        break;
      }
    }
    if (state.activeIndex === tid) {
      // 判断是否有右边的表格
      if (rightTid !== "") state.activeIndex = rightTid;
      else if (leftTid !== "") state.activeIndex = leftTid;
    }
  },

  REMOVE_TABLE_DATAS_FROM_LIST(state, { tids }) {
    for (let index = state.tableDataList.length - 1; index >= 0; index--) {
      let tableData = state.tableDataList[index];
      let tid = tableData.tid;
      if (tids.includes(tid)) {
        state.tableDataList.splice(index, 1);
      }
    }
  },
};

const actions = {
  async showNoDataPage({ commit }, { tid, tablecname }) {
    commit("SET_LOADINGSHOWDATA_STATE", true);
    let bFind = false;
    for (let tableData of state.tableDataList) {
      if (tableData.tid === tid) {
        bFind = true;
        break;
      }
    }
    let data = [];
    if (bFind) {
      commit("UPDATE_TABLE_DATA", { tid, data });
    } else {
      commit("ADD_TABLE_DATA_TO_LIST", {
        title: tablecname,
        tid: tid,
        componentName: "no-data-view",
        data,
        dispatchName: "ShowTable/showNoDataPage",
      });
    }
    commit("SET_ACTIVEINDEX", tid);
    commit("SET_LOADINGSHOWDATA_STATE", false);
    commit("SET_SHOW_TYPE", { tid, showType: 1 });
  },
  async showPersonTable(
    { commit },
    { ajid, offset, tid, tablecname, tableename, count }
  ) {
    commit("SET_LOADINGSHOWDATA_STATE", true);
    let data = await showTable.QueryPersonBaseDataFromTableName(
      ajid,
      tid,
      tableename,
      offset,
      count
    );
    console.log(data);
    // 判断是否add，还是update
    let bFind = false;
    for (let tableData of state.tableDataList) {
      if (tableData.tid === tid) {
        bFind = true;
        break;
      }
    }
    if (bFind) {
      commit("UPDATE_TABLE_DATA", { tid, data });
    } else {
      commit("ADD_TABLE_DATA_TO_LIST", {
        title: tablecname,
        tid: tid,
        componentName: "table-data-view",
        data,
        dispatchName: "ShowTable/showPersonTable",
      });
    }
    commit("SET_ACTIVEINDEX", tid);
    commit("SET_LOADINGSHOWDATA_STATE", false);
    commit("SET_SHOW_TYPE", { tid, showType: 1 });
  },

  async showPerson2Table(
    { commit },
    { ajid, offset, tid, tablecname, tableename, count }
  ) {
    commit("SET_LOADINGSHOWDATA_STATE", true);
    let data = await showTable.QueryPerson2BaseDataFromTableName(
      ajid,
      tid,
      tableename,
      offset,
      count
    );
    console.log(data);
    // 判断是否add，还是update
    let bFind = false;
    for (let tableData of state.tableDataList) {
      if (tableData.tid === tid) {
        bFind = true;
        break;
      }
    }
    if (bFind) {
      commit("UPDATE_TABLE_DATA", { tid, data });
    } else {
      commit("ADD_TABLE_DATA_TO_LIST", {
        title: tablecname,
        tid: tid,
        componentName: "table-data-view",
        data,
        dispatchName: "ShowTable/showPerson2Table",
      });
    }
    commit("SET_ACTIVEINDEX", tid);
    commit("SET_LOADINGSHOWDATA_STATE", false);
    commit("SET_SHOW_TYPE", { tid, showType: 1 });
  },
  async showAccountTable(
    { commit },
    { ajid, offset, tid, tablecname, tableename, count }
  ) {
    commit("SET_LOADINGSHOWDATA_STATE", true);
    let data = await showTable.QueryAccountDataFromTableName(
      ajid,
      tid,
      tableename,
      offset,
      count
    );
    console.log(data);
    // 判断是否add，还是update
    let bFind = false;
    for (let tableData of state.tableDataList) {
      if (tableData.tid === tid) {
        bFind = true;
        break;
      }
    }
    if (bFind) {
      commit("UPDATE_TABLE_DATA", { tid, data });
    } else {
      commit("ADD_TABLE_DATA_TO_LIST", {
        title: tablecname,
        tid: tid,
        componentName: "table-data-view",
        data,
        dispatchName: "ShowTable/showAccountTable",
      });
    }

    commit("SET_ACTIVEINDEX", tid);
    commit("SET_LOADINGSHOWDATA_STATE", false);
    commit("SET_SHOW_TYPE", { tid, showType: 1 });
  },
  // 展示银行交易详细
  async showBankTable(
    { commit, state },
    { ajid, offset, tid, tablecname, tableename, count }
  ) {
    commit("SET_LOADINGSHOWDATA_STATE", true);
    let data = await showTable.QueryBankDetaiFromTableName(
      ajid,
      tid,
      tableename,
      offset,
      count
    );
    console.log(data);
    // 判断是否add，还是update
    let bFind = false;
    for (let tableData of state.tableDataList) {
      if (tableData.tid === tid) {
        bFind = true;
        break;
      }
    }
    if (bFind) {
      commit("UPDATE_TABLE_DATA", { tid, data });
    } else {
      commit("ADD_TABLE_DATA_TO_LIST", {
        title: tablecname,
        tid: tid,
        componentName: "table-data-view",
        data,
        dispatchName: "ShowTable/showBankTable",
      });
    }
    commit("SET_ACTIVEINDEX", tid);
    commit("SET_LOADINGSHOWDATA_STATE", false);
    commit("SET_SHOW_TYPE", { tid, showType: 1 });
  },
  // 展示银行交易详细
  async showTaxTable(
    { commit, state },
    { ajid, offset, tid, tablecname, tableename, count }
  ) {
    commit("SET_LOADINGSHOWDATA_STATE", true);
    let data = await showTable.QueryTaxFromTableName(
      ajid,
      tid,
      tableename,
      offset,
      count
    );
    console.log(data);
    // 判断是否add，还是update
    let bFind = false;
    for (let tableData of state.tableDataList) {
      if (tableData.tid === tid) {
        bFind = true;
        break;
      }
    }
    if (bFind) {
      commit("UPDATE_TABLE_DATA", { tid, data });
    } else {
      commit("ADD_TABLE_DATA_TO_LIST", {
        title: tablecname,
        tid: tid,
        componentName: "table-data-view",
        data,
        dispatchName: "ShowTable/showBankTable",
      });
    }
    commit("SET_ACTIVEINDEX", tid);
    commit("SET_LOADINGSHOWDATA_STATE", false);
    commit("SET_SHOW_TYPE", { tid, showType: 1 });
  },
  async showOtherTable(
    { commit, state },
    { ajid, offset, tid, tablecname, tableename, count }
  ) {
    let data = await showTable.QueryOthersFromTableName(
      ajid,
      tid,
      tableename,
      offset,
      count
    );
    console.log(data);
    commit("SET_LOADINGSHOWDATA_STATE", true);
    // 判断是否add，还是update
    let bFind = false;
    for (let tableData of state.tableDataList) {
      if (tableData.tid === tid) {
        bFind = true;
        break;
      }
    }
    if (bFind) {
      commit("UPDATE_TABLE_DATA", { tid, data });
    } else {
      commit("ADD_TABLE_DATA_TO_LIST", {
        title: tablecname,
        tid: tid,
        componentName: "table-data-view",
        data,
        dispatchName: "ShowTable/showBankTable",
      });
    }
    commit("SET_ACTIVEINDEX", tid);
    commit("SET_LOADINGSHOWDATA_STATE", false);
    commit("SET_SHOW_TYPE", { tid, showType: 1 });
  },

  async showModelTable(
    { commit, state },
    {
      ajid,
      offset,
      tid,
      tablecname,
      pgsql,
      showType,
      orderby,
      count,
      params,
      mpids,
    }
  ) {
    commit("SET_LOADINGSHOWDATA_STATE", true);
    let data = await showTable.QueryModelTable(
      ajid,
      tid,
      pgsql,
      orderby,
      offset,
      count,
      params
    );
    console.log(data);
    // 判断是否add，还是update
    let bFind = false;
    for (let tableData of state.tableDataList) {
      if (
        tableData.tid === tid &&
        tableData.pgsql === pgsql &&
        tableData.orderby === orderby
      ) {
        bFind = true;
        break;
      }
    }
    if (bFind) {
      commit("UPDATE_TABLE_DATA", { tid, data });
    } else {
      commit("ADD_TABLE_DATA_TO_LIST", {
        title: tablecname,
        tid: tid,
        componentName: "table-data-view",
        data,
        dispatchName: "ShowTable/showModelTable",
      });
    }
    commit("SET_PGSQL", { tid, pgsql });
    commit("SET_ODERBY", { tid, orderby });
    commit("SET_SHOW_TYPE", { tid, showType });
    commit("SET_MODEL_PARAMS", { tid, params });
    commit("SET_ACTIVEINDEX", tid);
    commit("SET_LOADINGSHOWDATA_STATE", false);
    commit("SET_MODEL_MPIDS", { tid, mpids });
  },
};
export default {
  state,
  mutations,
  actions,
  namespaced: true,
};
