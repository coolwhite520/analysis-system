import db from "../../db/db";
import cases from "../../db/Cases";
import { stat } from "fs";
const state = {
  caseDetail: {}, //  st_case表对应的字段对象
  deleteState: "",
  entityCount: 0, //实体数量
  batchCount: 0, // 批次数量
  awaitTaskCount: 0, // 待调单数量
  dataCenterList: [], // 数据中心tree列表数据
  openeds: [], // 数据中心默认打开的节点
};
const mutations = {
  SET_CASE_DETAIL(state, caseDetail) {
    state.caseDetail = caseDetail;
  },
  SET_PARENTAJLB(state, parentAjlb) {
    state.parentAjlb = parentAjlb;
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
    let list = await cases.QueryDataCenterTableInfo(ajid);
    console.log(list);
    if (list) commit("SET_DATACENTERLIST", list);
  },
};

export default {
  state,
  getters,
  mutations,
  actions,
  namespaced: true,
};
