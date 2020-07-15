import cases from "../../db/Cases";
const state = {
  ajbh: "",
  ajmc: "",
  ajlb: "",
  ajlbmc: "",
  zcjddm: "",
  zcjdmc: "",
  cjsj: "",
  jjsj: "",
  xgsj: "",
  asjfsddxzqhdm: "",
  asjfsddxzqmc: "",
  jyaq: "",
  zhaq: "",
  cjr: "",
  sfsc: "",
  sfbdwkj: "",
  sjlx: "",
  caseDetail: {},
  deleteState: "",
};
const mutations = {
  SET_AJBH(state, ajbh) {
    state.ajbh = ajbh;
  },
  SET_AJMC(state, ajmc) {
    state.ajmc = ajmc;
  },
  SET_AJLB(state, ajlb) {
    state.ajlb = ajlb;
  },
  SET_AJLBMC(state, ajlbmc) {
    state.ajlbmc = ajlbmc;
  },
  SET_ZCJDDM(state, zcjddm) {
    state.zcjddm = zcjddm;
  },
  SET_ZCJDMC(state, zcjdmc) {
    state.zcjdmc = zcjdmc;
  },
  SET_CJSJ(state, cjsj) {
    state.cjsj = cjsj;
  },
  SET_JJSJ(state, jjsj) {
    state.jjsj = jjsj;
  },
  SET_XGSJ(state, xgsj) {
    state.xgsj = xgsj;
  },
  SET_ASJFSDDXZQHDM(state, asjfsddxzqhdm) {
    state.asjfsddxzqhdm = asjfsddxzqhdm;
  },
  SET_ASJFSDDXZQMC(state, asjfsddxzqmc) {
    state.asjfsddxzqmc = asjfsddxzqmc;
  },
  SET_JYAQ(state, jyaq) {
    state.jyaq = jyaq;
  },
  SET_ZHAQ(state, zhaq) {
    state.zhaq = zhaq;
  },
  SET_CJR(state, cjr) {
    state.cjr = cjr;
  },
  SET_SFSC(state, sfsc) {
    state.sfsc = sfsc;
  },
  SET_SFBDWKJ(state, sfbdwkj) {
    state.sfbdwkj = sfbdwkj;
  },
  SET_SJLX(state, sjlx) {
    state.sjlx = sjlx;
  },

  SET_CASE_DETAIL(state, caseDetail) {
    state.caseDetail = caseDetail;
  },
  SET_PARENTAJLB(state, parentAjlb) {
    state.parentAjlb = parentAjlb;
  },
  SET_DELETE_STATE(state, delState) {
    state.deleteState = delState;
  },
};

const actions = {
  async deleteCase({ commit }, ajid) {
    let res = await cases.DropCaseByID(ajid);
    if (res) commit("SET_DELETE_STATE", "success");
    else commit("SET_DELETE_STATE", "failed");
  },
};

export default {
  state,
  mutations,
  actions,
  namespaced: true,
};
