<template>
  <div style="width:100%; height:100%">
    <el-row style="background-color: #fff;padding: 5px;border: 1px solid #dddfe5;">
      <el-col :span="16">
        <el-button-group>
          <el-button
            size="mini"
            v-for="(item, index) of tableData.graphicMoneySectionList"
            :key="item.id"
            :style="{ color: item.selected ? item.color:'#1e1e1e' }"
            :icon="item.selected?'el-icon-success':'el-icon-error'"
            @click="handleClick(item.id)"
          >{{calLabel(item, index >0 ? tableData.graphicMoneySectionList[index-1]:null)}}</el-button>
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
        <el-input size="mini"></el-input>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="12">
        <div :id="miniMapID"></div>
      </el-col>
    </el-row>
    <el-row>
      <div :ref="id" :id="id" :style="{ height:limitHeight-26+'px', width: '100%'}"></div>
    </el-row>

    <el-row style="background-color: #f5f7fa;border: 1px solid #dddfe5;font-size:10px;">
      <el-col :span="3">
        <div class="tips">
          实体数量：
          <span>{{1}}</span>
        </div>
      </el-col>
      <el-col :span="3">
        <div class="tips">
          连接数量：
          <span>{{1}}</span>
        </div>
      </el-col>
      <el-col :span="3">
        <div class="tips">
          明细数量：
          <span>{{1}}</span>
        </div>
      </el-col>
      <el-col :span="5">&nbsp;</el-col>
      <el-col :span="5">&nbsp;</el-col>
      <el-col :span="5" style="text-align:right">
        <el-button
          type="text"
          size="mini"
          class="iconfont"
          style="padding-left:10px;border-left: 1px solid #dddfe5;"
          @click="handleClickFish"
        >{{ !enableFish ? '&#xe730;': '&#xe62a;'}}</el-button>

        <el-button
          type="text"
          size="mini"
          class="iconfont"
          style="padding:0;"
          @click="handleClickEnlarge"
        >&#xe622;</el-button>
        <el-button
          type="text"
          size="mini"
          class="iconfont"
          style="padding:0;"
          @click="handleClickReduce"
        >&#xe623;</el-button>
        <el-button
          type="text"
          size="mini"
          class="iconfont"
          style="padding:0;"
          @click="handleClickLocation"
        >&#xe649;</el-button>
        <el-button
          type="text"
          size="mini"
          class="iconfont"
          style="margin-right:10px;"
          @click="handleClickFullScreen"
        >{{ !fullScrrenFlag ?'&#xe6cc;':'&#xe6db;'}}</el-button>
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
      data: null,
      graph: null,
      id: uuid.v1(),
      toolBarID: uuid.v1(),
      miniMapID: uuid.v1(),
      fisheye: null,
      enableFish: false,
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
  },
  watch: {
    tableData: {
      handler(newValue, oldValue) {},
      deep: true,
    },
  },
  methods: {
    resize() {
      console.log("resize");
      let { clientWidth, clientHeight } = this.$refs[this.id];
      console.log({ clientWidth, clientHeight });
      this.graph.changeSize(clientWidth, clientHeight);
      this.graph.fitView(20);
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
          d: 2,
          r: 200,
          showLabel: true,
        });
        this.graph.addPlugin(this.fisheye);
      }

      // const minimap = new this.$G6.Minimap({
      //   size: [100, 100],
      //   className: "minimap",
      //   type: "delegate",
      //   // container: document.getElementById(this.miniMapID),
      // });
      // insertCss(`
      //   .g6-minimap-container {
      //     border: 1px solid #e2e2e2;
      //   }
      //   .g6-minimap-viewport {
      //     border: 2px solid rgb(25, 128, 255);
      //   }
      // `);
      // this.graph.addPlugin(minimap);
      const menu = new this.$G6.Menu({
        offsetX: 6,
        offsetX: 10,
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
    customResigterNode() {
      // 自定义节点
      this.$G6.registerNode(
        "rect-jsx",
        (cfg) => `
    <group>
      <rect>
        <rect style={{
          width: 150,
          height: 40,
          fill: ${cfg.color},
          radius: [6, 6, 0, 0],
          cursor: 'move'，
          stroke: ${cfg.color}
        }} draggable="true">
          <text style={{
            marginTop: 2,
            marginLeft: 75,
            textAlign: 'center',
            fontWeight: 'bold',
            fill: '#fff' }} draggable="true">{{label}}</text>
        </rect>
        <rect style={{
          width: 150,
          height: 55,
          stroke: ${cfg.color},
          fill: #ffffff,
          radius: [0, 0, 6, 6],
        }}>
          <text style={{ marginTop: 5, marginLeft: 3, fill: '#333', marginLeft: 4 }}>描述: {{description}}</text>
          <text style={{ marginTop: 10, marginLeft: 3, fill: '#333', marginLeft: 4 }}>创建者: {{meta.creatorName}}</text>
        </rect>
      </rect>
      <circle style={{
        stroke: ${cfg.color},
        r: 10,
        fill: '#fff',
        marginLeft: 75,
        cursor: 'pointer'
      }} name="circle">
        <image style={{ img: 'https://gw.alipayobjects.com/zos/antfincdn/FLrTNDvlna/antv.png', width: 12, height: 12,  marginLeft: 70,  marginTop: -5 }} />
      </circle>
    </group>
    `
      );
    },
    makeData() {
      let nodes = [];
      let edges = [];
      this.tableData.rows.forEach((row) => {
        let cxkh = row["cxkh"].value;
        let jymc = row["jymc"].value;
        let jydfzkh = row["jydfzkh"].value;
        let jydfmc = row["jydfmc"].value;
        let data1 = {
          id: cxkh + "\n" + jymc,
          label: cxkh + "\n" + jymc,
          // type: "rect-jsx",
          labelCfg: {
            // 标签配置属性
            positions: "bottom", // 标签的属性，标签在元素中的位置
            style: {
              // 包裹标签样式属性的字段 style 与标签其他属性在数据结构上并行
              // fontSize: 12, // 标签的样式属性，文字字体大小
              // ...            // 标签的其他样式属性
            },
          },
          // style: {
          //   // 包裹样式属性的字段 style 与其他属性在数据结构上并行
          //   fill: "#000", // 样式属性，元素的填充色
          //   stroke: "#888", // 样式属性，元素的描边色
          //   // ...              // 其他样式属性
          // },
        };
        let data2 = {
          id: jydfzkh + "\n" + jydfmc,
          label: jydfzkh + "\n" + jydfmc,

          // type: "rect-jsx",
          labelCfg: {
            // 标签配置属性
            positions: "bottom", // 标签的属性，标签在元素中的位置
            style: {
              // 包裹标签样式属性的字段 style 与标签其他属性在数据结构上并行
              // fontSize: 12, // 标签的样式属性，文字字体大小
              // ...            // 标签的其他样式属性
            },
          },
          // style: {
          //   // 包裹样式属性的字段 style 与其他属性在数据结构上并行
          //   fill: "#000", // 样式属性，元素的填充色
          //   stroke: "#888", // 样式属性，元素的描边色
          //   // ...              // 其他样式属性
          // },
        };
        let bFindData1 = false;
        let bFindData2 = false;
        for (let item of nodes) {
          if (item.id === data1.id) {
            bFindData1 = true;
          }
        }
        if (!bFindData1) nodes.push(data1);

        for (let item of nodes) {
          if (item.id === data2.id) {
            bFindData2 = true;
          }
        }
        if (!bFindData2) nodes.push(data2);

        let link1 = {
          source: cxkh + "\n" + jymc,
          target: jydfzkh + "\n" + jydfmc,
          label: "",
          style: {
            endArrow: true,
            startArrow: true,
          },
        };
        edges.push(link1);

        let link2 = {
          target: cxkh + "\n" + jymc,
          source: jydfzkh + "\n" + jydfmc,
          label: "",
          style: {
            endArrow: true,
            startArrow: true,
          },
        };
        edges.push(link2);
      });
      this.$G6.Util.processParallelEdges(edges);
      return { nodes, edges };
    },
  },
  mounted() {
    let _this = this;
    const erd = elementResizeDetectorMaker();
    erd.listenTo(document.getElementById(this.id), function (element) {
      _this.resize();
    });
    let { clientWidth, clientHeight } = this.$refs[this.id];
    let option = {
      width: clientWidth,
      height: clientHeight,
      container: this.id, // 指定挂载容器
      fitView: true,
      animate: true,
      modes: {
        default: ["drag-canvas", "zoom-canvas", "drag-node"], // 允许拖拽画布、放缩画布、拖拽节点
        defaultEdge: {
          size: 1,
          style: {
            stroke: "#e2e2e2",
            lineAppendWidth: 2,
          },
        },
        nodeStateStyles: {
          active: {
            opacity: 1,
          },
          inactive: {
            opacity: 0.2,
          },
        },
        edgeStateStyles: {
          active: {
            stroke: "#999",
          },
        },
      },
    };
    this.graph = new this.$G6.Graph(option);
    this.initPlugins();
    this.graph.data(this.makeData()); // 加载数据
    this.graph.render(); // 渲染
  },
};
</script>

<style scoped>
.tips {
  font-size: 10px;
  margin-top: 7px;
}
.g6-tooltip {
  border: 1px solid #e2e2e2;
  border-radius: 4px;
  font-size: 12px;
  color: #545454;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 10px 8px;
  box-shadow: rgb(174, 174, 174) 0px 0px 10px;
}
.g6-component-toolbar {
  position: relative;
}
</style>