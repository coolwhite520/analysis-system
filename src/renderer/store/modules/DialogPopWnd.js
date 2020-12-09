// 控制那些对话框的弹出与否
const state = {
  standardViewSwitch: "begin-import", //"begin-import", // 标准采集的页面切换state
  standardDataVisible: false, // 标准采集
  autoDataVisible: false, //智能采集
  filterVisible: false,
  showFieldsVisible: false,
  showCollectionRecordVisible: false,
  graphicSettingVisible: false,
  nodeCombineVisible: false,
  showSaveProjectVisible: false,
  showErrorRowRecordVisible: false,
  dbConfigVisible: false,
  showDataVisibilityDialogVisible: false,
  showLinkModelDialogVisible: false,
  showCircleModelDialogVisible: false,
  showTwoEndsDialogVisible: false,
  showAwaitTaskDialogVisible: false,
  showUpdateErrorDialogVisible: false,
  showJdbzDialogVisible: false,
  showReportVisible: false,
  showReportHisVisible: false,
  showMoneySectionDialog: false,
  showWeiSettingVisible: false,
  showContactUsVisible: false,
  showUpdateVisible: false,
  showConvertDialog: false,
};

const mutations = {
  SET_STANDARDVIEW(state, newViewName) {
    state.standardViewSwitch = newViewName;
  },
  SET_STANDARDDATAVISIBLE(state, standardDataVisible) {
    state.standardDataVisible = standardDataVisible;
  },

  SET_AUTODATAVISIBAL(state, autoDataVisible) {
    state.autoDataVisible = autoDataVisible;
  },

  SET_FILTER_DIALOG_VISIBLE(state, filterVisible) {
    state.filterVisible = filterVisible;
  },
  SET_SHOW_FILEDS_DIALOG_VISIBLE(state, showFieldsVisible) {
    state.showFieldsVisible = showFieldsVisible;
  },
  SET_SHOWCOLLECTIONRECORDVISIBLE(state, showCollectionRecordVisible) {
    state.showCollectionRecordVisible = showCollectionRecordVisible;
  },
  SET_SHOWREPORTVISIBLE(state, showReportVisible) {
    state.showReportVisible = showReportVisible;
  },
  SET_GRAPHICSETTINGVISIBLE(state, graphicSettingVisible) {
    state.graphicSettingVisible = graphicSettingVisible;
  },
  SET_NODECOMBINEVISIBLE(state, nodeCombineVisible) {
    state.nodeCombineVisible = nodeCombineVisible;
  },
  SET_SHOWSAVEPROJECTVISIBLE(state, showSaveProjectVisible) {
    state.showSaveProjectVisible = showSaveProjectVisible;
  },
  SET_SHOWERRORROWRECORDVISIBLE(state, showErrorRowRecordVisible) {
    state.showErrorRowRecordVisible = showErrorRowRecordVisible;
  },
  SET_DBCONFIGVISIBLE(state, dbConfigVisible) {
    state.dbConfigVisible = dbConfigVisible;
  },
  SET_SHOWAWAITTASKDIALOGVISIBLE(state, showAwaitTaskDialogVisible) {
    state.showAwaitTaskDialogVisible = showAwaitTaskDialogVisible;
  },
  SET_SHOWDATAVISIBILITYDIALOGVISIBLE(state, showDataVisibilityDialogVisible) {
    state.showDataVisibilityDialogVisible = showDataVisibilityDialogVisible;
  },
  SET_SHOWLINKMODELDIALOGVISIBLE(state, showLinkModelDialogVisible) {
    state.showLinkModelDialogVisible = showLinkModelDialogVisible;
  },
  SET_SHOWCIRCLEMODELDIALOGVISIBLE(state, showCircleModelDialogVisible) {
    state.showCircleModelDialogVisible = showCircleModelDialogVisible;
  },
  SET_SHOWTWOENDSDIALOGVISIBLE(state, showTwoEndsDialogVisible) {
    state.showTwoEndsDialogVisible = showTwoEndsDialogVisible;
  },
  SET_SHOWUPDATEERRORDIALOGVISIBLE(state, showUpdateErrorDialogVisible) {
    state.showUpdateErrorDialogVisible = showUpdateErrorDialogVisible;
  },
  SET_SHOWJDBZDIALOGVISIBLE(state, showJdbzDialogVisible) {
    state.showJdbzDialogVisible = showJdbzDialogVisible;
  },
  SET_SHOWREPORTHISVISIBLE(state, showReportHisVisible) {
    state.showReportHisVisible = showReportHisVisible;
  },
  SET_SHOWMONEYSECTIONDIALOG(state, showMoneySectionDialog) {
    state.showMoneySectionDialog = showMoneySectionDialog;
  },
  SET_SHOWWEISETTINGVISIBLE(state, showWeiSettingVisible) {
    state.showWeiSettingVisible = showWeiSettingVisible;
  },
  SET_SHOWCONTACTUSVISIBLE(state, showContactUsVisible) {
    state.showContactUsVisible = showContactUsVisible;
  },
  SET_SHOWUPDATEVISIBLE(state, showUpdateVisible) {
    state.showUpdateVisible = showUpdateVisible;
  },
  SET_SHOWCONVERTDIALOG(state, showConvertDialog) {
    state.showConvertDialog = showConvertDialog;
  },
};

const actions = {};

export default {
  state,
  mutations,
  actions,
  namespaced: true,
};
