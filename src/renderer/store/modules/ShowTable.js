import showTable from "../../db/DataShowTable";
import Vue from "vue";
const state = {
  activeIndex: "", // 当前active的tab标签
  tableDataList: [], // 存放每个表的数据结构 { title: "标准采集" name: tid, componentName: "no-data-view", data: data}
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
  UPDATE_TABLE_DATA(state, { tid, data }) {
    for (let index = 0; index < state.tableDataList.length; index++) {
      let tableData = state.tableDataList[index];
      if (tableData.tid === tid) {
        console.log("UPDATE_TABLE_DATA", data);
        // Vue.set(state.tableDataList[index], "data", data);
        state.tableDataList.splice(index, 1, data);
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
  },
  async showPersonTable(
    { commit },
    { ajid, offset, tid, tablecname, tableename, count }
  ) {
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
  },

  async showPerson2Table(
    { commit },
    { ajid, offset, tid, tablecname, tableename, count }
  ) {
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
  },
  async showAccountTable(
    { commit },
    { ajid, offset, tid, tablecname, tableename, count }
  ) {
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
  },
  // 展示银行交易详细
  async showBankTable(
    { commit, state },
    { ajid, offset, tid, tablecname, tableename, count }
  ) {
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
  },
  // 展示银行交易详细
  async showTaxTable(
    { commit, state },
    { ajid, offset, tid, tablecname, tableename, count }
  ) {
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
  },

  async showModelTable(
    { commit, state },
    { ajid, offset, tid, tablecname, pgsql, orderby, count }
  ) {
    let data = await showTable.QueryModelTable(
      ajid,
      tid,
      pgsql,
      orderby,
      offset,
      count
    );
    console.log(data);
    // 判断是否add，还是update
    let bFind = false;
    for (let tableData of state.tableDataList) {
      if (tableData.tid === tid && tableData.pgsql === pgsql) {
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
    commit("SET_ACTIVEINDEX", tid);
  },
};
export default {
  state,
  mutations,
  actions,
  namespaced: true,
};
