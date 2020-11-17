import cases from "../../db/Cases";
import models from "../../db/Models";
import Vue from "vue";
const state = {
  caseBase: {}, //  st_case表对应的字段对象
  deleteState: "",
  entityCount: 0, //实体数量
  batchCount: 0, // 批次数量
  dataSum: 0, // 数据总量
  awaitTaskCount: 0, // 待调单数量
  dataCenterList: [], // 数据中心tree列表数据
  openeds: [], // 数据中心默认展开项目
  CollectionRecords: {},
  awaitTaskList: [],
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
  SET_LISTOPENEDS(state, openeds) {
    state.openeds = openeds;
  },
  SET_COLLECTIONRECORDS(state, { rows, headers, rowCount }) {
    Vue.set(state, "CollectionRecords", { rows, headers, rowCount });
  },
  SET_AWAITTASKLIST(state, awaitTaskList) {
    Vue.set(state, "awaitTaskList", awaitTaskList);
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
    let arr = [];
    for (let item of state.dataCenterList) {
      for (let childItem of item.childrenArr) {
        if (childItem.count > 0) {
          arr.push(childItem);
        }
      }
    }
    return arr;
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
    commit("SET_ENTITYCOUNT", res);
  },
  async queryBatchCount({ commit }, ajid) {
    let res = await cases.QueryBatchCount(ajid);
    commit("SET_BATCHCOUNT", res);
  },
  async queryAwaitTaskCount({ commit }, ajid) {
    let res = await cases.QueryAwaitTaskCount(ajid);
    commit("SET_AWAITTASK", res);
  },
  async queryCaseDataCenter({ commit }, ajid) {
    let { list, dataSum } = await cases.QueryDataCenterTableInfo(ajid);
    let treeList = [];
    let fatherNodes = list.filter((item) => {
      return item.parentid === "-1";
    });
    for (let item of fatherNodes) {
      let childrenArr = list.filter((child) => {
        return child.parentid === item.tid;
      });
      // 遍历子元素，根据tid获取模型的详细列表
      let promiseArray = [];
      for (let index = 0; index < childrenArr.length; index++) {
        let childItem = childrenArr[index];
        promiseArray.push(
          (async function() {
            let mids = await models.QueryModelmidsByTid(childItem.tid);
            if (mids.length > 0) {
              let modelsDetailList = await models.QueryModelListByMids(mids);
              let newTreeList = [];
              let parentList = modelsDetailList.filter((item) => {
                return item.parentid_200 === -1;
              });
              for (let father of parentList) {
                let childrenList = modelsDetailList.filter((item) => {
                  return item.parentid_200 === father.mid;
                });
                father.childrenList = childrenList;
                newTreeList.push(father);
              }
              // 把模型库添加到datacenter的项目中
              Vue.set(childrenArr[index], "modelTreeList", newTreeList);
            }
          })()
        );
      }
      await Promise.all(promiseArray);
      item.childrenArr = childrenArr;
      treeList.push(item);
    }
    let listOpeneds = [];
    for (let item of fatherNodes) {
      listOpeneds.push(item.tid);
    }
    if (treeList.length > 0) commit("SET_DATACENTERLIST", treeList);
    if (listOpeneds.length > 0) commit("SET_LISTOPENEDS", listOpeneds);
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
