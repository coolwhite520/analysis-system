import cases from "../../db/Cases";

const state = {
  caseBase: {}, //  st_case表对应的字段对象
  deleteState: "",
  entityCount: 0, //实体数量
  batchCount: 0, // 批次数量
  dataSum: 0, // 数据总量
  awaitTaskCount: 0, // 待调单数量
  dataCenterList: [], // 数据中心tree列表数据
};
const mutations = {
  SET_CASE_DETAIL(state, caseBase) {
    state.caseBase = caseBase;
  },
  SET_DELETE_STATE(state, delState) {
    state.deleteState = delState;
  },
  SET_ENTITYCOUNT(state, entityCount) {
    state.entityCount = entityCount;
  },
  SET_BATCHCOUNT(state, batchCount) {
    state.batchCount = batchCount;
  },
  ADD_BATCHTOUNT(state) {
    state.batchCount++;
  },
  SET_AWAITTASK(state, awaitTask) {
    state.awaitTaskCount = awaitTask;
  },
  SET_DATACENTERLIST(state, list) {
    state.dataCenterList = list;
  },
  SET_DATA_SUM(state, dataSum) {
    state.dataSum = dataSum;
  },
  RESET_ALL_DATA(state) {
    state.caseBase = {}; //  st_case表对应的字段对象
    state.deleteState = "";
    state.entityCount = 0; //实体数量
    state.batchCount = 0; // 批次数量
    state.awaitTaskCount = 0; // 待调单数量
    state.dataCenterList = []; // 数据中心tree列表数据
    state.openeds = []; // 数据中心默认打开的节点
    state.dataSum = 0;
  },
};

const getters = {
  renderButtonGroupList: (state) => {
    return state.dataCenterList.filter((item) => {
      return item.count > 0;
    });
  },
  openeds: (state) => {
    let fatherNodes = state.dataCenterList.filter((item) => {
      return item.parentid === "-1";
    });
    let list = [];
    for (let item of fatherNodes) {
      list.push(item.tid);
    }
    return list;
  },
  renderTreeControlList: (state) => {
    let treeList = [];
    let fatherNodes = state.dataCenterList.filter((item) => {
      return item.parentid === "-1";
    });
    for (let item of fatherNodes) {
      let childrenArr = state.dataCenterList.filter((child) => {
        return child.parentid === item.tid;
      });
      item.childrenArr = childrenArr;
      treeList.push(item);
    }
    return treeList;
  },
};

const actions = {
  async deleteCase({ commit }, ajid) {
    let res = await cases.DropCaseByID(ajid);
    if (res) commit("SET_DELETE_STATE", "success");
    else commit("SET_DELETE_STATE", "failed");
  },
  async queryEntityCount({ commit }, ajid) {
    let res = await cases.QueryEntityCount(ajid);
    if (res) commit("SET_ENTITYCOUNT", res);
  },
  async queryBatchCount({ commit }, ajid) {
    let res = await cases.QueryBatchCount(ajid);
    if (res) commit("SET_BATCHCOUNT", res);
  },
  async queryAwaitTaskCount({ commit }, ajid) {
    let res = await cases.QueryAwaitTaskCount(ajid);
    if (res) commit("SET_AWAITTASK", res);
  },
  async queryCaseDataCenter({ commit }, ajid) {
    let { list, dataSum } = await cases.QueryDataCenterTableInfo(ajid);
    console.log(list);
    if (list) commit("SET_DATACENTERLIST", list);
    commit("SET_DATA_SUM", dataSum);
  },
};

export default {
  state,
  getters,
  mutations,
  actions,
  namespaced: true,
};
