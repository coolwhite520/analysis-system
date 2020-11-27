/**
 * 定义每个展示表
 */
import Vue from "vue";
import Default from "../../utils/sql/Default";
const uuid = require("uuid");
const lodash = require("lodash");

class CenterTable {
  constructor(
    type,
    hideEmptyField = false,
    rows = [],
    sum = 0,
    headers = [],
    showHeaders = []
  ) {
    this.type = type;
    this.sum = sum;
    this.hideEmptyField = hideEmptyField;
    this.rows = lodash.cloneDeep(rows);
    this.headers = lodash.cloneDeep(headers);
    this.showHeaders = lodash.cloneDeep(showHeaders);
  }
  updateHideEmptyField(hideEmptyField) {
    Vue.set(this, "hideEmptyField", hideEmptyField);
  }
  updateTableSum(sum) {
    Vue.set(this, "sum", lodash.cloneDeep(sum));
  }
  updateTableRows(rows) {
    Vue.set(this, "rows", lodash.cloneDeep(rows));
  }
  updateTableHeaders(headers) {
    Vue.set(this, "headers", lodash.cloneDeep(headers));
  }
  updateTableShowHeaders(showHeaders) {
    Vue.set(this, "ShowHeaders", lodash.cloneDeep(showHeaders));
  }
}

class RightSliderItem {
  constructor(title, componentName, data) {
    this.componentName = componentName;
    this.title = title;
    this.data = data;
  }
}

class RightSlider {
  constructor() {
    this.rightActiveName = "";
    this.sliders = [];
  }
  addSliderToList(rightSliderItem) {
    this.sliders.push(rightSliderItem);
  }
  updateRightActiveName(rightActiveName) {
    Vue.set(this, "rightActiveName", rightActiveName);
  }
}

class CenterGraph {
  constructor() {
    this.graphid = uuid.v1();
    this.graphicMoneySectionList = lodash.cloneDeep(
      Default.graphicMoneySectionList
    );
    this.xianKuanSetting = lodash.cloneDeep(Default.xianKuanSetting);
  }
  updateMoneySelectByID(id) {
    for (let item of this.graphicMoneySectionList) {
      if (item.id === id) {
        Vue.set(item, "selected", !item.selected);
        break;
      }
    }
  }
  updateGraphicMoneySectionList(graphicMoneySectionList) {
    Vue.set(
      this,
      "graphicMoneySectionList",
      lodash.cloneDeep(graphicMoneySectionList)
    );
  }
  updateGraphicMoneySectionList(xianKuanSetting) {
    Vue.set(this, "xianKuanSetting", lodash.cloneDeep(xianKuanSetting));
  }
}

class PageItem {
  constructor(
    ajid,
    tid,
    title,
    tableename,
    sqlTemplate,
    orderby,
    showType,
    componentName,
    dispatchName,
    fullScrrenFlag = false,
    modelFilterStr = "",
    modelFilterChildList = [],
    modelTree = {},
    mpids = []
  ) {
    this.pageIndex = "";
    this.ajid = ajid;
    this.title = title;
    this.tableename = tableename;
    this.dispatchName = dispatchName;
    this.uuid = uuid.v1();
    this.tid = tid;
    this.showType = showType;
    this.componentName = componentName;
    this.sqlTemplate = sqlTemplate;
    this.orderby = orderby;
    this.fullScrrenFlag = fullScrrenFlag;
    this.selectCondition = lodash.cloneDeep(Default.defaultSelection);
    this.modelFilterStr = modelFilterStr;
    this.modelFilterChildList = modelFilterChildList;
    this.mpids = mpids;
    this.modelTree = modelTree;
    this.entity = {};
    this.entityList = [];
    this.comboInfo = {};
    // 每个页面包含右侧菜单、中心table、和图像
    this.rightSlider = new RightSlider();
    this.centerTable = new CenterTable();
    this.centerGraph = new CenterGraph();
  }
  updatePageIndex(pageIndex) {
    Vue.set(this, "pageIndex", pageIndex);
  }
  updateEntity() {
    Vue.set(this, "entity", lodash.cloneDeep(entity));
  }
  updateComboInfo(comboInfo) {
    Vue.set(this, "comboInfo", lodash.cloneDeep(comboInfo));
  }
  updateEntityList(entityList) {
    Vue.set(this, "entityList", lodash.cloneDeep(entityList));
  }
  updateModelTree(modelTree) {
    Vue.set(this, "modelTree", lodash.cloneDeep(modelTree));
  }
  updateMpids(mpids) {
    Vue.set(this, "mpids", lodash.cloneDeep(mpids));
  }
  updateModelFilterChildList(modelFilterChildList) {
    Vue.set(
      this,
      "modelFilterChildList",
      lodash.cloneDeep(modelFilterChildList)
    );
  }
  updateFullScrrenFlag(fullScrrenFlag) {
    Vue.set(this, "fullScrrenFlag", fullScrrenFlag);
  }
  updateOrderBy(orderby) {
    Vue.set(this, "orderby", orderby);
  }
  updateSelectCondition(selectCondition) {
    Vue.set(this, "selectCondition", lodash.cloneDeep(selectCondition));
  }
}

let t = new PageItem(1, "haha", "123123", "asdfasdf", "233434", "odtybasdf");
t.updateOrderBy("oderby baiyang");
t.centerTable.updateTableRows([12, 2323, 2323]);
t = JSON.parse(JSON.stringify(t));
console.log(t);

export default {
  RightSliderItem,
  RightSlider,
  CenterTable,
  CenterGraph,
  PageItem,
};
