<template>
  <div style="width: 100%; height: 100%">
    <el-row
      style="background-color: #fff; padding: 5px; border: 1px solid #dddfe5"
    >
      <el-col :span="16">
        <el-button-group>
          <el-button
            size="mini"
            v-for="(item, index) of tableData.graphicMoneySectionList"
            :key="item.id"
            :style="{ color: item.selected ? item.color : '#1e1e1e' }"
            :icon="item.selected ? 'el-icon-success' : 'el-icon-error'"
            @click="handleClick(item.id)"
            >{{
              calLabel(
                item,
                index > 0 ? tableData.graphicMoneySectionList[index - 1] : null
              )
            }}</el-button
          >
        </el-button-group>
      </el-col>
      <el-col :span="1">
        <el-button
          size="mini"
          type="primary"
          icon="el-icon-s-tools"
          @click="handleClickSetting"
          circle
        ></el-button>
      </el-col>
      <el-col :span="7">
        <el-input size="mini" v-model="inputValue"></el-input>
      </el-col>
    </el-row>

    <!-- <div :id="miniMapID" style="width:100px;"></div> -->
    <div
      :ref="graphid"
      style="position: relative"
      :id="graphid"
      :style="{ height: limitHeight - 26 + 'px', width: '100%' }"
    ></div>

    <el-row
      style="
        background-color: #f5f7fa;
        border: 1px solid #dddfe5;
        font-size: 10px;
      "
    >
      <el-col :span="3">
        <div class="tips">
          实体数量：
          <span>{{ entityCount }}</span>
        </div>
      </el-col>
      <el-col :span="3">
        <div class="tips">
          连接数量：
          <span>{{ linkCount }}</span>
        </div>
      </el-col>
      <el-col :span="3">
        <div class="tips">
          明细数量：
          <span>{{ detailCount }}</span>
        </div>
      </el-col>
      <el-col :span="5">&nbsp;</el-col>
      <el-col :span="5">&nbsp;</el-col>
      <el-col :span="5" style="text-align: right">
        <el-button
          type="text"
          size="mini"
          class="iconfont"
          style="padding-left: 10px; border-left: 1px solid #dddfe5"
          @click="handleClickFish"
          >{{ !enableFish ? "&#xe730;" : "&#xe62a;" }}</el-button
        >

        <el-button
          type="text"
          size="mini"
          class="iconfont"
          style="padding: 0"
          @click="handleClickEnlarge"
          >&#xe622;</el-button
        >
        <el-button
          type="text"
          size="mini"
          class="iconfont"
          style="padding: 0"
          @click="handleClickReduce"
          >&#xe623;</el-button
        >
        <el-button
          type="text"
          size="mini"
          class="iconfont"
          style="padding: 0"
          @click="handleClickLocation"
          >&#xe649;</el-button
        >
        <el-button
          type="text"
          size="mini"
          class="iconfont"
          style="margin-right: 10px"
          @click="handleClickFullScreen"
          >{{ !fullScrrenFlag ? "&#xe6cc;" : "&#xe6db;" }}</el-button
        >
      </el-col>
    </el-row>
    <!-- 设置popwnd -->
    <graphic-setting v-if="graphicSettingVisible"></graphic-setting>
    <combine-node
      v-if="nodeCombineVisible"
      :nodes="currentSelectedNodes"
    ></combine-node>
    <div v-show="menuVisible">
      <div id="menu" class="menu">
        <div v-if="currentSelectedNodes.length === 1">
          <div>
            <el-button
              type="text"
              size="small"
              @click="handleClickLockOrUnlock"
              class="iconfont menuItem"
              v-html="lockOrUnlock"
            >
            </el-button>
          </div>
        </div>
        <div v-if="currentSelectedNodes.length > 1">
          <div>
            <el-button
              type="text"
              size="small"
              @click="handleClickCombineNodes"
              class="iconfont menuItem"
              v-html="combineOrUncombine"
            >
            </el-button>
          </div>
        </div>
        <div>
          <el-button
            type="text"
            size="small"
            @click="handleClickDeleteNodes"
            class="iconfont menuItem"
            v-html="deleteTips"
          >
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
const md5 = require("md5-node");
import { mapState } from "vuex";
import GraphicSetting from "@/pages/dialog/graphicsetting/graphicSettingDialog";
import NodeCombine from "@/pages/dialog/nodeCombine/nodeCombineDialog";
const uuid = require("uuid");
const elementResizeDetectorMaker = require("element-resize-detector");
import insertCss from "insert-css";
export default {
  props: ["tableData", "limitHeight"],
  data() {
    return {
      menuVisible: false,
      inputValue: "",
      data: null,
      graph: null,
      graphid: uuid.v1(),
      toolBarID: uuid.v1(),
      miniMapID: uuid.v1(),
      fisheye: null,
      enableFish: false,
      entityCount: 0,
      linkCount: 0,
      detailCount: 0,
      tempAllRowsStrMd5: "",
      tempgraphicMoneySectionStrMd5: "",
      currentSelectedNodes: [],
    };
  },
  components: {
    "graphic-setting": GraphicSetting,
    "combine-node": NodeCombine,
  },
  computed: {
    ...mapState("DialogPopWnd", [
      "graphicSettingVisible",
      "nodeCombineVisible",
    ]),
    fullScrrenFlag() {
      return this.tableData.fullScrrenFlag;
    },
    lockOrUnlock() {
      let node = this.currentSelectedNodes[0];
      if (node.hasLocked()) {
        return "&nbsp;&nbsp;&nbsp;&nbsp;&#xe60e;&nbsp;&nbsp;取消锁定";
      } else {
        return "&nbsp;&nbsp;&nbsp;&nbsp;&#xe60d;&nbsp;&nbsp;锁定节点";
      }
    },
    combineOrUncombine() {
      return `&nbsp;&nbsp;&nbsp;&nbsp;&#xe629;&nbsp;&nbsp;将选中的${this.currentSelectedNodes.length}个节点添加到分组`;
    },
    deleteTips() {
      if (this.currentSelectedNodes.length > 1) {
        return `&nbsp;&nbsp;&nbsp;&nbsp;&#xe62c;&nbsp;&nbsp;删除选中的${this.currentSelectedNodes.length}个节点`;
      }
      return `&nbsp;&nbsp;&nbsp;&nbsp;&#xe62c;&nbsp;&nbsp;删除节点`;
    },
  },
  watch: {
    inputValue(newValue, oldValue) {
      console.log(newValue, oldValue);
      this.currentSelectedNodes = [];
      if (newValue === "") {
        let allNodes = this.graph.getNodes();
        allNodes.forEach((node) => {
          this.graph.setItemState(node, "searchLikeOrSelected", false);
        });
        return;
      }
      const nodes = this.graph.findAll("node", (node) => {
        return (
          node.get("model").name.indexOf(newValue) !== -1 ||
          node.get("model").kh.indexOf(newValue) !== -1
        );
      });
      let allNodes = this.graph.getNodes();
      allNodes.forEach((node) => {
        this.graph.setItemState(node, "searchLikeOrSelected", false);
      });
      if (nodes.length > 0) {
        nodes.forEach((node) => {
          this.graph.setItemState(node, "searchLikeOrSelected", true);
        });
        this.currentSelectedNodes = nodes;
      }
    },
    "tableData.graphicMoneySectionList": {
      handler(newValue, oldValue) {
        // 因为监听的是对象，所以新旧两个值是一样的，都是同一个地址的引用对象
        if (this.tempgraphicMoneySectionStrMd5 === "") {
          this.tempgraphicMoneySectionStrMd5 = md5(JSON.stringify(newValue));
        } else {
          if (
            this.tempgraphicMoneySectionStrMd5 !== md5(JSON.stringify(newValue))
          ) {
            console.log("tableData.graphicMoneySectionList");
            this.tempgraphicMoneySectionStrMd5 = md5(JSON.stringify(newValue));
            this.graph.changeData(this.makeData()); // 加载数据
            this.updateEntityList();
          }
        }
      },
      immediate: false,
      deep: true,
    },
    "tableData.allrows": {
      handler(newValue, oldValue) {
        if (this.tempAllRowsStrMd5 === "") {
          this.tempAllRowsStrMd5 = md5(JSON.stringify(newValue));
        } else {
          if (this.tempAllRowsStrMd5 !== md5(JSON.stringify(newValue))) {
            this.tempAllRowsStrMd5 = md5(JSON.stringify(newValue));
            console.log("tableData.allrows");
            this.graph.changeData(this.makeData()); // 加载数据
            this.updateEntityList();
          }
        }
      },
      immediate: false,
      deep: true,
    },
  },
  methods: {
    handleClickLockOrUnlock() {
      let node = this.currentSelectedNodes[0];
      this.graph.clearItemStates(node, "searchLikeOrSelected");
      if (node.hasLocked()) {
        const model = node.get("model");
        model.label = model.id;
        model.style.lineDash = [1, 1];
        node.update(model);
        node.unlock();
      } else {
        const model = node.get("model");
        model.label = model.id + "(已锁定)";
        model.style.lineDash = [1, 0];
        node.update(model);
        node.lock();
      }

      this.menuVisible = false;
    },
    handleClickCombineNodes() {
      this.menuVisible = false;
      this.$store.commit("DialogPopWnd/SET_NODECOMBINEVISIBLE", true);
    },
    handleClickDeleteNodes() {
      this.currentSelectedNodes.forEach((item) => {
        this.graph.removeItem(item);
      });
      this.currentSelectedNodes = [];
      this.menuVisible = false;
    },
    resize() {
      console.log("resize");
      let { clientWidth, clientHeight } = this.$refs[this.graphid];
      console.log({ clientWidth, clientHeight });
      this.graph.changeSize(clientWidth, clientHeight);
      this.graph.fitView();
    },
    calLabel(item, preItem) {
      let label = "";
      if (item.id === "1" || item.id === "4") {
        label = `${item.value}${item.label}`;
      } else {
        if (preItem) label = `${preItem.value}-${item.value}${item.label}`;
      }
      return label;
    },
    async handleClickSetting() {
      await this.$store.commit("DialogPopWnd/SET_GRAPHICSETTINGVISIBLE", true);
    },
    async handleClick(value) {
      await this.$store.commit("ShowTable/MODIFY_MONDY_SECTION_CHECKED", value);
      // 重新渲染页面
    },
    handleClickFish() {
      this.enableFish = !this.enableFish;
      if (this.enableFish) {
        this.fisheye = new this.$G6.Fisheye({
          d: 2,
          r: 200,
          showLabel: true,
        });
        this.graph.addPlugin(this.fisheye);
      } else {
        this.graph.removePlugin(this.fisheye);
      }
    },
    handleClickEnlarge() {
      this.graph.zoom(1.2);
    },
    handleClickReduce() {
      this.graph.zoom(0.8);
    },
    handleClickLocation() {
      this.graph.fitView(20);
    },
    handleClickFullScreen() {
      this.$store.commit("ShowTable/UPDATE_FULLSCRRENFLAG");
    },
    // 初始化插件
    initPlugins() {
      if (this.enableFish) {
        this.fisheye = new this.$G6.Fisheye({
          d: 3,
          r: 200,
          showLabel: true,
        });
        this.graph.addPlugin(this.fisheye);
      }

      const minimap = new this.$G6.Minimap({
        size: [100, 100],
      });
      insertCss(`
        .g6-minimap-container {
          border: 1px solid #e2e2e2;
        }
        .g6-minimap-viewport {
          border: 2px solid rgb(25, 128, 255);
        }
      `);
      this.graph.addPlugin(minimap);

      const menu = new this.$G6.Menu({
        offsetX: 0,
        offsetX: 0,
        itemTypes: ["node", "combo"],
        getContent(e) {
          const outDiv = document.createElement("div");
          outDiv.id = uuid.v1();
          outDiv.style.width = "180px";
          outDiv.style.zIndex = 999;
          outDiv.innerHTML = `<ul clase="menu">
                                <li class="menu__item">
                                合并所有选中节点
                                </li class="menu__item">
                                <li class="menu__item">分离所有节点</li>
                                <li class="menu__item">锁定节点</li>
                                <li class="menu__item">测试01</li>
                                <li class="menu__item">测试01</li>
                              </ul>`;
          insertCss(`
            .menu__item {
              display: block;
            }
            .menu {
              border-radius: 10px;
              border: 1px solid #999999;
              background-color: #f4f4f4;
            }
            li:hover {
              background-color: #1790ff;
              color: white;
            }
          `);
          return outDiv;
        },
        handleMenuClick(target, item) {
          console.log(target, item);
        },
      });
      // this.graph.addPlugin(menu);
    },
    // 当返回""的时候不绘制这条线
    calculateLineColorByJinE(jinE) {
      let moneyList = this.tableData.graphicMoneySectionList;
      for (let i = 0; i < moneyList.length; i++) {
        let item = moneyList[i];
        let value = item.value * 10000;
        if (item.id === "1") {
          if (jinE < value) {
            return item.selected ? item.color : "";
          }
        } else if (item.id === "4") {
          if (jinE > value) {
            return item.selected ? item.color : "";
          }
        } else {
          let preItem = moneyList[i - 1];
          let nextItem = moneyList[i + 1];
          let preValue = preItem.value * 10000;
          let nextValue = nextItem.value * 10000;
          if (jinE > preValue && jinE <= value) {
            return item.selected ? item.color : "";
          }
          if (jinE > value && jinE <= nextValue) {
            return nextItem.selected ? nextItem.color : "";
          }
        }
      }
    },
    // 注册一个节点继承circle
    registerNode() {
      const Util = this.$G6.Util;
      this.$G6.registerNode("mycircle", "circle");
    },
    makeData() {
      let nodes = [];
      let edges = [];
      this.tableData.allrows.forEach((row) => {
        // 序号(++)，
        // 交易卡号(cxkh)，
        // 交易名称(jymc)，
        // 交易证件号码(jyzjhm)，
        // 对手账号(jydfzkh)，
        // 对手名称(jydfmc)，
        // 对手身份证号(jydfzjhm)，
        // 交易总金额(jyzje)，
        // 交易总笔数(jyzbs)，
        // 出账金额(czje)，
        // 出账笔数(czbs)，
        // 进账金额(jzje)，
        // 进账笔数(jzbs)，
        // 进出帐差额(jczce)，
        // 最早交易日期(zzjyrq)，
        // 最晚交易日期(zwjyrq)
        let cxkh = row["cxkh"];
        let jymc = row["jymc"];
        let jydfzkh = row["jydfzkh"];
        let jydfmc = row["jydfmc"];
        let czje = parseFloat(row["czje"]);
        let czbs = parseInt(row["czbs"]);
        let jzje = parseFloat(row["jzje"]);
        let jzbs = parseInt(row["jzbs"]);

        let data1 = {
          id: cxkh + "\n" + jymc,
          kh: cxkh,
          name: jymc,
          label: cxkh + "\n" + jymc,
        };
        let data2 = {
          id: jydfzkh + "\n" + jydfmc,
          kh: jydfzkh,
          name: jydfmc,
          label: jydfzkh + "\n" + jydfmc,
        };
        let bFindData1 = false;
        let bFindData2 = false;
        for (let item of nodes) {
          if (item.id === data1.id) {
            bFindData1 = true;
          }
        }
        for (let item of nodes) {
          if (item.id === data2.id) {
            bFindData2 = true;
          }
        }
        // 画线
        let tempEdges = [];
        if (czje > 0) {
          let lineColor = this.calculateLineColorByJinE(czje);
          let link1 = {
            source: cxkh + "\n" + jymc,
            target: jydfzkh + "\n" + jydfmc,
            label: `${czje}元（${czbs}笔）`,
            style: {
              endArrow: {
                path: "M 0,0 L 8,4 L 8,-4 Z",
                fill: lineColor,
              },
              stroke: lineColor,
            },
          };
          if (lineColor !== "") tempEdges.push(link1);
        }
        if (jzje > 0) {
          let lineColor = this.calculateLineColorByJinE(jzje);
          let link2 = {
            target: cxkh + "\n" + jymc,
            source: jydfzkh + "\n" + jydfmc,
            label: `${jzje}元（${jzbs}笔）`,
            style: {
              endArrow: {
                path: "M 0,0 L 8,4 L 8,-4 Z",
                fill: lineColor,
              },
              stroke: lineColor,
            },
          };
          if (lineColor !== "") tempEdges.push(link2);
        }
        if (tempEdges.length > 0) {
          if (!bFindData1) nodes.push(data1);
          if (!bFindData2) nodes.push(data2);
          edges.push(...tempEdges);
        }
      });
      this.$G6.Util.processParallelEdges(edges);
      this.entityCount = nodes.length;
      this.linkCount = edges.length;
      this.detailCount = this.entityCount + this.linkCount;
      return { nodes, edges };
    },
    // 更新实体列表
    updateEntityList() {
      const nodes = this.graph.getNodes();
      let entityList = nodes.map((node) => {
        let model = node.get("model");
        let edges = node.getEdges();
        return {
          ...model,
          relationCount: edges.length,
        };
      });
      entityList = entityList.sort(function (a, b) {
        return b.relationCount - a.relationCount;
      });
      this.$store.commit("ShowTable/UPDATE_ENTITY_LIST", entityList);
      this.$store.commit("ShowTable/ADD_OR_REMOVE_RIGHT_TAB", {
        componentName: "entity-list-view",
        action: "add",
      });
    },
  },
  mounted() {
    let _this = this;
    // this.registerNode();
    const erd = elementResizeDetectorMaker();
    erd.listenTo(document.getElementById(this.graphid), function (element) {
      _this.resize();
    });
    let { clientWidth, clientHeight } = this.$refs[this.graphid];
    let option = {
      groupByTypes: false,
      width: clientWidth,
      height: clientHeight,
      container: this.graphid, // 指定挂载容器
      animate: true,
      defaultCombo: {
        type: "circle", // Combo 类型
        // ... 其他配置
      },
      defaultNode: {
        type: "circle",
        style: {
          // 默认是虚线
          lineDash: [1, 1],
          fill: "#d9dce1",
          stroke: "#3c4e6b",
        },
        icon: {
          show: true,
          img: "/static/images/yinhangka.png",
          width: 15,
          height: 15,
        },
        labelCfg: {
          position: "bottom",
          offset: 0,
          style: {
            fontSize: 5,
          },
        },
      },
      defaultEdge: {
        labelCfg: {
          autoRotate: true,
          style: {
            fontSize: 5,
          },
        },
        style: {
          lineWidth: 1,
        },
      },
      nodeStateStyles: {
        searchLikeOrSelected: {
          shadowColor: "red",
          shadowBlur: 10,
        },
        active: {
          opacity: 1,
        },
        inactive: {
          opacity: 0.2,
        },
      },
      edgeStateStyles: {
        active: {
          opacity: 1,
        },
        inactive: {
          opacity: 0.2,
        },
      },
      // linkCenter: true,
      modes: {
        default: [
          "drag-node",
          "drag-combo",
          "zoom-canvas",
          "activate-relations",
          { type: "click-select", trigger: "ctrl" }, //点选
          {
            // 框选
            type: "brush-select",
            fillOpacity: 0.1,
            lineWidth: 2,
            stroke: "red",
            trigger: "drag",
          },
        ],
      },
    };
    this.graph = new this.$G6.Graph(option);
    this.initPlugins();
    this.graph.data(this.makeData()); // 加载数据
    this.graph.render(); // 渲染
    this.updateEntityList();
    // 监听布局切换
    this.$store.commit("ShowTable/SET_RELATION_GRAPH_ID", this.graphid);
    this.$store.commit("MainPageSwitch/SET_TABBARACTIVENAME", "second");
    // 当 click-select 选中的元素集合发生变化时将会触发下面时机事件，e 中包含相关信息
    this.graph.on("nodeselectchange", (e) => {
      const selectedNodes = this.graph.findAllByState(
        "node",
        "searchLikeOrSelected"
      );
      console.log(selectedNodes);
      selectedNodes.forEach((cn) => {
        this.graph.setItemState(cn, "searchLikeOrSelected", false);
      });
      if (e.select) {
        e.selectedItems.nodes.forEach((cn) => {
          this.graph.setItemState(cn, "searchLikeOrSelected", true); // 设置当前节点的 click 状态为 true
        });
        this.currentSelectedNodes = e.selectedItems.nodes;
      } else {
        this.currentSelectedNodes = [];
      }
      // 单个节点的select
      let node = e.target;
      if (node) {
        let nodeModel = node.get("model");
        const states = node.getStates();
        console.log(states);
        this.$store.commit("ShowTable/UPDATE_ENTITY", nodeModel);
        this.$store.commit("ShowTable/ADD_OR_REMOVE_RIGHT_TAB", {
          componentName: "entity-view",
          action: "add",
        });
      }
    });
    // 右键菜单
    this.graph.on("node:contextmenu", (evt) => {
      let node = evt.item;
      console.log(evt);
      let nodeid = node.get("model").id;
      let filterNodes = this.currentSelectedNodes.filter((n) => {
        let nId = n.get("model").id;
        return nId === nodeid;
      });
      if (filterNodes.length === 0) {
        this.currentSelectedNodes.forEach((cn) => {
          this.graph.setItemState(cn, "searchLikeOrSelected", false);
        });
        this.graph.setItemState(node, "searchLikeOrSelected", true);
        this.currentSelectedNodes = [];
        this.currentSelectedNodes.push(node);
      }
      //当前节点定位
      this.menuVisible = false; // 先把模态框关死，目的是 第二次或者第n次右键鼠标的时候 它默认的是true
      this.menuVisible = true; // 显示模态窗口，跳出自定义菜单栏
      let menu = document.querySelector("#menu");
      menu.style.left = evt.clientX + "px";
      menu.style.top = evt.clientY + "px";
      console.log("右键被点击的event:", evt);
    });

    this.graph.on("node:mouseleave", (evt) => {
      this.menuVisible = false;
    });
    // 画布监听keydown
    this.graph.on("keydown", (ev) => {
      console.log(ev);
    });
    this.$bus.$on("swichNormalLayout", (data) => {
      let { graphid, layout } = data;
      if (graphid !== _this.graphid) return;
      console.log(layout, typeof layout);
      _this.graph.updateLayout(layout);
      this.updateEntityList();
    });
  },
};
</script>

<style >
.g6-minimap {
  position: absolute;
  right: 0;
  bottom: 1px;
  background-color: #fff;
}
</style>

<style scoped>
.tips {
  font-size: 10px;
  margin-top: 7px;
}

.g6-tooltip {
  border: 1px solid #e2e2e2;
  border-radius: 4px;
  font-size: 12px;
  color: #000;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 10px 8px;
  box-shadow: rgb(174, 174, 174) 0px 0px 10px;
}
.g6-component-toolbar {
  position: relative;
}
.menu {
  color: #202124;
  width: 200px;
  position: fixed;
  border-radius: 4px;
  background-color: #ffffff;
  z-index: 999;
  border: 1px solid #b6b6bb;
  box-shadow: 5px 5px 10px 5px #b6b6bb,
    -5px 5px 5px 5px rgba(255, 255, 255, 0.5);
}
.menuItem {
  font-size: 10px;
}
</style>