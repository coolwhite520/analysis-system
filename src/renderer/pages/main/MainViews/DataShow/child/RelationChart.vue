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
  </div>
</template>

<script>
import { mapState } from "vuex";
import GraphicSetting from "@/pages/dialog/graphicsetting/graphicSettingDialog";
const uuid = require("uuid");
const elementResizeDetectorMaker = require("element-resize-detector");
import insertCss from "insert-css";
export default {
  props: ["tableData", "limitHeight"],
  data() {
    return {
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
    };
  },
  components: {
    "graphic-setting": GraphicSetting,
  },
  computed: {
    ...mapState("DialogPopWnd", ["graphicSettingVisible"]),
    fullScrrenFlag() {
      return this.tableData.fullScrrenFlag;
    },
    graphicMoneySectionList() {
      return this.tableData.graphicMoneySectionList;
    },
    allrows() {
      return this.tableData.allrows;
    },
  },
  watch: {
    inputValue(newValue, oldValue) {
      if (newValue === "") {
        let allNodes = this.graph.getNodes();
        allNodes.forEach((node) => {
          this.graph.setItemState(node, "hover", false);
        });
        return;
      }
      const nodes = this.graph.findAll("node", (node) => {
        return (
          node.get("model").name.includes(newValue) ||
          node.get("model").kh.includes(newValue)
        );
      });

      if (nodes.length > 0) {
        let allNodes = this.graph.getNodes();
        allNodes.forEach((node) => {
          this.graph.setItemState(node, "hover", false);
        });
        nodes.forEach((node) => {
          this.graph.setItemState(node, "hover", true);
        });
      }
    },
    // 通过计算属性获取对象的属性值，然后通过深度watch
    graphicMoneySectionList: {
      handler(newValue, oldValue) {
        this.graph.changeData(this.makeData()); // 加载数据
        this.updateEntityList();
      },
      immediate: false,
      deep: true,
    },
    allrows: {
      handler(newValue, oldValue) {
        this.graph.changeData(this.makeData()); // 加载数据
        this.updateEntityList();
      },
      immediate: false,
      deep: true,
    },
  },
  methods: {
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
      this.graph.fitCenter();
    },
    handleClickReduce() {
      this.graph.zoom(0.8);
      this.graph.fitCenter();
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
        offsetX: 6,
        offsetX: 0,
        itemTypes: ["node"],
        getContent(e) {
          const outDiv = document.createElement("div");
          outDiv.id = uuid.v1();
          outDiv.style.width = "180px";
          // outDiv.style.zIndex = 999;
          outDiv.innerHTML = `<ul>
        <li>测试01</li>
        <li>测试01</li>
        <li>测试01</li>
        <li>测试01</li>
        <li>测试01</li>
      </ul>`;
          return outDiv;
        },
        handleMenuClick(target, item) {
          console.log(target, item);
        },
      });
      this.graph.addPlugin(menu);
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
      this.$G6.registerNode(
        "inner-animate",
        {
          setState(name, value, item) {
            let group = item.getContainer();
            let cfg = {
              id: "node2",
              x: 300,
              y: 200,
              type: "background-animate",
              color: "#40a9ff",
              size: 20,
              label: "Background Animation",
              labelCfg: {
                position: "left",
                offset: 10,
              },
            };
            if (name === "selected") {
              if (value) {
                const r = cfg.size / 2;
                const back1 = group.addShape("circle", {
                  zIndex: -3,
                  attrs: {
                    x: 0,
                    y: 0,
                    r,
                    fill: cfg.color,
                    opacity: 0.6,
                  },
                  name: "back1-shape",
                });
                const back2 = group.addShape("circle", {
                  zIndex: -2,
                  attrs: {
                    x: 0,
                    y: 0,
                    r,
                    fill: cfg.color,
                    opacity: 0.6,
                  },
                  name: "back2-shape",
                });
                const back3 = group.addShape("circle", {
                  zIndex: -1,
                  attrs: {
                    x: 0,
                    y: 0,
                    r,
                    fill: cfg.color,
                    opacity: 0.6,
                  },
                  name: "back3-shape",
                });
                group.sort(); // Sort according to the zIndex
                back1.animate(
                  {
                    // Magnifying and disappearing
                    r: r + 10,
                    opacity: 0.1,
                  },
                  {
                    duration: 3000,
                    easing: "easeCubic",
                    delay: 0,
                    repeat: true, // repeat
                  }
                ); // no delay
                back2.animate(
                  {
                    // Magnifying and disappearing
                    r: r + 10,
                    opacity: 0.1,
                  },
                  {
                    duration: 3000,
                    easing: "easeCubic",
                    delay: 1000,
                    repeat: true, // repeat
                  }
                ); // 1s delay
                back3.animate(
                  {
                    // Magnifying and disappearing
                    r: r + 10,
                    opacity: 0.1,
                  },
                  {
                    duration: 3000,
                    easing: "easeCubic",
                    delay: 2000,
                    repeat: true, // repeat
                  }
                ); // 3s delay
              } else {
                if (item.isAnimating()) {
                  item.stopAnimate();
                }
              }
            } else if (name === "") {
            }
          },
        },
        "circle"
      );
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
    async updateEntityList() {
      const nodes = this.graph.getNodes();
      let entityList = nodes.map((node) => {
        let { model } = node._cfg;
        let edges = node.getEdges();
        return {
          id: model.id,
          kh: model.kh,
          name: model.name,
          relationCount: edges.length,
        };
      });
      entityList = entityList.sort(function (a, b) {
        return b.relationCount - a.relationCount;
      });
      await this.$store.commit("ShowTable/UPDATE_ENTITY_LIST", entityList);
      await this.$store.commit("ShowTable/ADD_OR_REMOVE_RIGHT_TAB", {
        componentName: "entity-view",
        action: "add",
      });
    },
  },
  mounted() {
    let _this = this;
    console.log(this.tableData.allrows);
    // this.registerNode();
    const erd = elementResizeDetectorMaker();
    erd.listenTo(document.getElementById(this.graphid), function (element) {
      _this.resize();
    });
    let { clientWidth, clientHeight } = this.$refs[this.graphid];
    let option = {
      width: clientWidth,
      height: clientHeight,
      container: this.graphid, // 指定挂载容器
      animate: true,
      defaultNode: {
        type: "circle",
        style: {
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
        hover: {
          fillOpacity: 0.1,
          lineWidth: 3,
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
          {
            type: "drag-node",
          },
          "zoom-canvas",
          "activate-relations",
          "click-select",
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
    // 画布消息监听click
    this.graph.on("node:click", (ev) => {
      const shape = ev.target;
      const node = ev.item;
      console.log(node._cfg.model);
    });
    // 画布监听keydown
    this.graph.on("keydown", (ev) => {});
    this.$bus.$on("swichNormalLayout", (data) => {
      let { graphid, layout } = data;
      if (graphid !== _this.graphid) return;
      console.log(layout, typeof layout);
      _this.graph.updateLayout(layout);
      _this.graph.changeData(_this.makeData()); // 加载数据
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
</style>