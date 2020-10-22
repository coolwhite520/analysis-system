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
      <el-col :span="2">
        <el-tooltip
          class="item"
          effect="dark"
          content="离散点显示开关(当一个节点没有任何的连接线称为离散节点)"
          placement="top-start"
          ><el-switch
            v-model="bSpreadNodeSwitch"
            active-color="#13ce66"
            inactive-color="#ff4949"
            inactive-text="离散"
            @change="handleChangeSpreadNodeValue"
          >
          </el-switch>
        </el-tooltip>
      </el-col>
      <el-col :span="2">
        <el-tooltip
          class="item"
          effect="dark"
          :content="switchButtonTip"
          placement="top-start"
          ><el-switch
            v-model="bOpenLineWidth"
            active-color="#13ce66"
            inactive-color="#ff4949"
            inactive-text="线宽"
          >
          </el-switch>
        </el-tooltip>
      </el-col>
      <el-col :span="1">
        <el-tooltip
          class="item"
          effect="dark"
          content="连接线条过滤设置"
          placement="top-start"
        >
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-s-tools"
            @click="handleClickSetting"
            circle
          ></el-button>
        </el-tooltip>
      </el-col>
      <el-col :span="3">
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
      v-on:confirmCombine="confirmCombine"
      v-on:updateCombineNodes="onUpdateNodesClearState"
      :nodes="currentSelectedNodes"
    ></combine-node>
    <div v-show="menuVisible">
      <div :id="menuId" class="menu">
        <div v-if="rightClickType === 'combo'">
          <div>
            <div>
              <el-button
                type="text"
                size="small"
                @click="handleClickUnCombo"
                class="iconfont menuItem"
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&#xe652;&nbsp;&nbsp;解体分组
              </el-button>
            </div>
          </div>
        </div>
        <div v-if="rightClickType === 'node'">
          <div v-if="false && nodeBelongCombo">
            <div>
              <el-button
                type="text"
                size="small"
                @click="handleClickRmoveNodeFromCombo"
                class="iconfont menuItem"
              >
                移出分组
              </el-button>
            </div>
          </div>
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
  </div>
</template>

<script>
import Vue from "vue";
const md5 = require("md5-node");
import { mapState } from "vuex";
import { Decimal } from "decimal.js";
import GraphicSetting from "@/pages/dialog/graphicsetting/graphicSettingDialog";
import NodeCombine from "@/pages/dialog/nodeCombine/nodeCombineDialog";
const uuid = require("uuid");
const elementResizeDetectorMaker = require("element-resize-detector");
import insertCss from "insert-css";
export default {
  props: ["tableData", "limitHeight"],
  data() {
    return {
      menuId: uuid.v1(),
      menuVisible: false,
      rightClickType: "",
      inputValue: "",
      data: null,
      graph: null,
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
      rightClickComboInstance: null,
      nodeBelongCombo: null, // 右键点击分组中的node所属的combo实例
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
    ...mapState("CaseDetail", ["caseBase"]),
    fullScrrenFlag() {
      return this.tableData.fullScrrenFlag;
    },
    graphid() {
      return this.tableData.graphid;
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
    switchButtonTip() {
      if (this.tableData.xianKuanSetting.open) {
        let tipFilterName =
          this.tableData.xianKuanSetting.category === "je"
            ? "交易金额"
            : "交易笔数";
        let levelNum = this.tableData.xianKuanSetting.levelNum;
        return `线宽设置快捷开关(当前图表以${tipFilterName}为基准，分${levelNum}种线宽进行展示)`;
      }
      return "线宽设置快捷开关(未开启)";
    },
    bSpreadNodeSwitch: {
      get() {
        return this.tableData.SpreadNodeSwitch;
      },
      set(newValue) {
        this.$store.commit("ShowTable/SET_SPREADNODESWITCH", newValue);
      },
    },
    bOpenLineWidth: {
      get() {
        return this.tableData.xianKuanSetting.open;
      },
      set(newValue) {
        let obj = JSON.parse(JSON.stringify(this.tableData.xianKuanSetting));
        obj.open = newValue;
        this.$store.commit(
          "ShowTable/SET_NEW_XIAN_KUAN",
          JSON.parse(JSON.stringify(obj))
        );
      },
    },
  },
  watch: {
    inputValue(newValue, oldValue) {
      console.log(newValue, oldValue);
      this.currentSelectedNodes = [];
      if (newValue === "") {
        let allNodes = this.graph.getNodes();
        allNodes.forEach((node) => {
          this.graph.setItemState(node, "selected", false);
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
        this.graph.setItemState(node, "selected", false);
      });
      if (nodes.length > 0) {
        nodes.forEach((node) => {
          this.graph.setItemState(node, "selected", true);
        });
        this.currentSelectedNodes = nodes;
      }
    },
    "tableData.graphicMoneySectionList": {
      handler(newValue, oldValue) {
        // 因为监听的是对象，所以新旧两个值是一样的，都是同一个地址的引用对象
        if (
          this.tempgraphicMoneySectionStrMd5 !== md5(JSON.stringify(newValue))
        ) {
          console.log("tableData.graphicMoneySectionList");
          this.tempgraphicMoneySectionStrMd5 = md5(JSON.stringify(newValue));
          this.graph.changeData(this.makeData()); // 加载数据
          this.accordingXianKuanRefreshEdges(this.tableData.xianKuanSetting);
          this.accordingSpreadNodeSwitchRefreshNodes();
          this.updateEntityList();
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
            this.accordingXianKuanRefreshEdges(this.tableData.xianKuanSetting);
          }
        }
      },
      immediate: false,
      deep: true,
    },
    "tableData.xianKuanSetting": {
      handler(newValue, oldValue) {
        this.accordingXianKuanRefreshEdges(newValue);
      },
      immediate: false,
      deep: true,
    },
  },
  methods: {
    keepTwoDecimal(value) {
      if (typeof value === "number") {
        let strNumber = value + "";
        let index = strNumber.indexOf(".");
        if (index > 0) {
          return parseFloat(strNumber.slice(0, index + 2));
        }
        return value;
      }
      return value;
    },
    // 根据离散点开关刷新数据
    accordingSpreadNodeSwitchRefreshNodes() {
      if (this.bSpreadNodeSwitch) {
        // 显示离散点
        let allNodes = this.graph.getNodes();
        allNodes.forEach((node) => {
          this.graph.showItem(node);
        });
      } else {
        let allNodes = this.graph.getNodes();
        allNodes.forEach((node) => {
          if (node.getEdges().length === 0) this.graph.hideItem(node);
          else this.graph.showItem(node);
        });
      }
    },
    // 根据线宽设置
    accordingXianKuanRefreshEdges(xianKuanSetting) {
      let { category, levelNum, open, openNodeSpread } = xianKuanSetting;
      let allEdges = this.graph.getEdges();
      if (open) {
        let minJe, maxJe, minBs, maxBs;
        let bFirstLoop = true;
        for (let edge of allEdges) {
          let model = edge.getModel();
          if (bFirstLoop) {
            minJe = model.je;
            maxJe = model.je;
            minBs = model.bs;
            maxBs = model.bs;
            bFirstLoop = false;
          } else {
            if (model.je < minJe) {
              minJe = model.je;
            }
            if (model.je > maxJe) {
              maxJe = model.je;
            }
            if (model.bs < minBs) {
              minBs = model.bs;
            }
            if (model.bs > maxBs) {
              maxBs = model.bs;
            }
          }
        }
        function getLineWidth(value, valueSpanList) {
          for (let item of valueSpanList) {
            if (value >= item.beginValue && value < item.endValue) {
              return item.lineWidth;
            }
          }
        }
        if (category === "je") {
          let jeSpan = parseInt((maxJe - minJe) / levelNum) + 1;
          let jeXianKuanList = [];
          // 构造金额区间线宽数据
          for (let index = 0; index < levelNum; index++, minJe += jeSpan) {
            let obj = {
              beginValue: minJe,
              endValue: minJe + jeSpan,
              lineWidth: index + 1,
            };
            jeXianKuanList.push(obj);
          }
          //
          allEdges.forEach((edge) => {
            let model = edge.getModel();
            model.style.lineWidth = getLineWidth(model.je, jeXianKuanList);
            this.graph.updateItem(edge, model);
          });
        } else {
          let bsSpan = parseInt((maxBs - minBs) / levelNum) + 1;
          let bsXianKuanList = [];
          // 构造金额区间线宽数据
          for (let index = 0; index < levelNum; index++, minBs += bsSpan) {
            let obj = {
              beginValue: minBs,
              endValue: minBs + bsSpan,
              lineWidth: index + 1,
            };
            bsXianKuanList.push(obj);
          }
          //
          allEdges.forEach((edge) => {
            let model = edge.getModel();
            model.style.lineWidth = getLineWidth(model.bs, bsXianKuanList);
            this.graph.updateItem(edge, model);
          });
        }
      } else {
        allEdges.forEach((edge) => {
          let model = edge.getModel();
          model.style.lineWidth = 1;
          this.graph.updateItem(edge, model);
        });
      }
    },
    accordingNodeFindCombo(combos, node) {
      for (let combo of combos) {
        let { nodes, combos } = combo.getChildren();
        for (let item of nodes) {
          if (item.getModel().id === node.getModel().id) {
            return combo;
          }
        }
        return this.accordingNodeFindCombo(combos, node);
      }
    },
    handleClickUnCombo() {
      this.graph.expandCombo(this.rightClickComboInstance);
      let nodes = this.rightClickComboInstance.getNodes();
      nodes.forEach((node) => {
        let model = node.getModel();
        delete model.comboId;
        this.graph.updateItem(node, model);
      });
      this.graph.uncombo(this.rightClickComboInstance);
      this.rightClickComboInstance = null;
      this.menuVisible = false;
      this.$store.commit("ShowTable/ADD_OR_REMOVE_RIGHT_TAB", {
        componentName: "combo-entity-list-view",
        action: "remove",
      });
    },
    confirmCombine(obj) {
      let { comboName } = obj;
      console.log(comboName);
      let comboid = uuid.v1();
      let comboCfg = {
        id: comboid,
        label: comboName,
      };
      let nodeIds = this.currentSelectedNodes.map((node) => {
        this.graph.clearItemStates(node, "selected");
        let model = node.getModel();
        model.comboId = comboid;
        this.graph.updateItem(node, model);
        return node.getModel().id;
      });
      this.currentSelectedNodes = [];
      this.graph.createCombo(comboCfg, nodeIds);
    },
    onUpdateNodesClearState(nodeIndex) {
      let node = this.currentSelectedNodes[nodeIndex];
      this.graph.clearItemStates(node, "selected");
      this.currentSelectedNodes.splice(nodeIndex, 1);
    },
    onUpdateNodesState({ graphid, nodeid, state }) {
      if (graphid === this.graphid) {
        let node = this.graph.findById(nodeid);
        if (state === "clear") {
          this.graph.clearItemStates(node, "selected");
        } else {
          this.graph.setItemState(node, "selected", true);
        }
      }
    },
    handleClickRmoveNodeFromCombo() {
      this.menuVisible = false;
      console.log(this.nodeBelongCombo, this.currentSelectedNodes[0]);
      for (let item of this.nodeBelongCombo.getNodes()) {
        if (item.getModel().id === this.currentSelectedNodes[0].getModel().id) {
          let ret = this.nodeBelongCombo.removeChild(item);
          console.log("handleClickRmoveNodeFromCombo:", ret);
        }
      }

      // let bbox = this.nodeBelongCombo.getBBox();
      // let cfg = {
      //   x: bbox.centerX + bbox.width + 50,
      //   y: bbox.centerY + bbox.height + 50,
      // };
      // this.currentSelectedNodes[0].updatePosition(cfg);
    },
    handleClickLockOrUnlock() {
      this.menuVisible = false;
      let node = this.currentSelectedNodes[0];
      this.graph.clearItemStates(node, "selected");
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
    },
    handleClickCombineNodes() {
      this.$store.commit("DialogPopWnd/SET_NODECOMBINEVISIBLE", true);
      this.menuVisible = false;
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

      const tooltip = new this.$G6.Tooltip({
        offsetX: 10,
        offsetY: 20,
        getContent(e) {
          if (e.item.getType() === "node") {
            let nodeModel = e.item.getModel();
            let edges = e.item.getEdges();
            let czjeTotal = 0;
            let czbsTotal = 0;
            let jzjeTotal = 0;
            let jzbsTotal = 0;
            let jcchae = 0; //进出帐差额
            let jczongbs = 0;
            for (let edge of edges) {
              let edgeModel = edge.getModel();
              if (edgeModel.target === nodeModel.id) {
                jzjeTotal = new Decimal(jzjeTotal).add(
                  new Decimal(edgeModel.je)
                );
                jzbsTotal += edgeModel.bs;
              } else {
                czjeTotal = new Decimal(czjeTotal).add(
                  new Decimal(edgeModel.je)
                );
                czbsTotal += edgeModel.bs;
              }
            }
            jcchae = new Decimal(jzjeTotal).sub(new Decimal(czjeTotal));
            jczongbs = jzbsTotal + czbsTotal;

            const outDiv = document.createElement("div");
            outDiv.style.width = "180px";
            outDiv.innerHTML = `
      <h4>${nodeModel.name || nodeModel.id}${
              e.item.hasLocked() ? "(已锁定)" : ""
            }</h4>
      <ul>
        <li class="tip-li">交易关联数：${edges.length}&nbsp;&nbsp;</li>
        <li class="tip-li">出账总金额：${czjeTotal}&nbsp;&nbsp;元</li>
        <li class="tip-li">出账总笔数：${czbsTotal}&nbsp;&nbsp;</li>
        <li class="tip-li">进账总金额：${jzjeTotal}&nbsp;&nbsp;元</li>
        <li class="tip-li">进账总笔数：${jzbsTotal}&nbsp;&nbsp;</li>
        <li class="tip-li">进出总差额：<span class="chae-style"><b>${jcchae}&nbsp;&nbsp;</b></span>元</li>
        <li class="tip-li">进出总笔数：<span><b>${jczongbs}&nbsp;&nbsp;</b></span></li>
      </ul>`;
            insertCss(`
        .tip-li{
          font-size: 10px;
        }
      `);
            if (jcchae > 0) {
              insertCss(`
              .chae-style{
                color:#cd594b;
              }
            `);
            } else {
              insertCss(`
              .chae-style{
                color:#46962e;
              }
            `);
            }
            // style="color:#cd594b"
            // style="color:#46962e"
            return outDiv;
          } else if (e.item.getType() === "edge") {
            let nodeModel = e.item.getModel();
            let zhuanChuFang = nodeModel.source;
            let zhuanRuFang = nodeModel.target;
            const outDiv = document.createElement("div");
            outDiv.style.width = "180px";
            outDiv.innerHTML = `
      <ul>
        <li class="tip-li">转出方：${zhuanChuFang}</li>
        <li class="tip-li">转入方：${zhuanRuFang}</li>
        <li class="tip-li">转账金额：${nodeModel.je}&nbsp;&nbsp;元</li>
        <li class="tip-li">转账笔数：${nodeModel.bs}&nbsp;&nbsp;</li>
      </ul>`;
            insertCss(`
        .tip-li{
          font-size: 10px;
        }
      `);
            return outDiv;
          }
        },
        itemTypes: ["node", "edge"],
      });

      this.graph.addPlugin(tooltip);

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
    // 注册一个自定义的combo
    registerSelfCombo() {
      // The symbols for the marker inside the combo
      const collapseIcon = (x, y, r) => {
        return [
          ["M", x - r, y],
          ["a", r, r, 0, 1, 0, r * 2, 0],
          ["a", r, r, 0, 1, 0, -r * 2, 0],
          ["M", x - r + 4, y],
          ["L", x - r + 2 * r - 4, y],
        ];
      };
      const expandIcon = (x, y, r) => {
        return [
          ["M", x - r, y],
          ["a", r, r, 0, 1, 0, r * 2, 0],
          ["a", r, r, 0, 1, 0, -r * 2, 0],
          ["M", x - r + 4, y],
          ["L", x - r + 2 * r - 4, y],
          ["M", x - r + r, y - r + 4],
          ["L", x, y + r - 4],
        ];
      };
      this.$G6.registerCombo(
        "cCircle",
        {
          drawShape: function draw(cfg, group) {
            const self = this;
            // Get the shape style, where the style.r corresponds to the R in the Illustration of Built-in Rect Combo
            const style = self.getShapeStyle(cfg);
            // Add a circle shape as keyShape which is the same as the extended 'circle' type Combo
            const circle = group.addShape("circle", {
              attrs: {
                ...style,
                x: 0,
                y: 0,
                r: style.r,
              },
              draggable: true,
              name: "combo-keyShape",
            });
            // Add the marker on the bottom
            const marker = group.addShape("marker", {
              attrs: {
                ...style,
                fill: "#fff",
                opacity: 1,
                x: 0,
                y: style.r,
                r: 10,
                symbol: collapseIcon,
              },
              draggable: true,
              name: "combo-marker-shape",
            });

            return circle;
          },
          // Define the updating logic for the marker
          afterUpdate: function afterUpdate(cfg, combo) {
            const self = this;
            // Get the shape style, where the style.r corresponds to the R in the Illustration of Built-in Rect Combo
            const style = self.getShapeStyle(cfg);
            const group = combo.get("group");
            // Find the marker shape in the graphics group of the Combo
            const marker = group.find(
              (ele) => ele.get("name") === "combo-marker-shape"
            );
            // Update the marker shape
            marker.attr({
              x: 0,
              y: style.r,
              // The property 'collapsed' in the combo data represents the collapsing state of the Combo
              // Update the symbol according to 'collapsed'
              symbol: cfg.collapsed ? expandIcon : collapseIcon,
            });
          },
        },
        "circle"
      );
    },
    // 1
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
    makeData() {
      switch (this.tableData.tid) {
        case "202":
          return this.makeData202();
          break;
        case "203":
          return this.makeData203();
          break;
        case "213":
          return this.makeData213();
          break;
      }
    },
    makeData213() {
      // 重点交易对手团伙发现：参数 金额，笔数。参数可设置团伙分类 以 主体名称（JYMCGROUP），证件号码（JYZJHMGROUP），卡号（CXKHGROUP） 划分
      this.currentSelectedNodes = [];
      let nodes = [];
      let edges = [];
      let keyName = "";
      let keyDfName = "";
      this.tableData.allrows.forEach((row) => {
        let jymc =
          row[
            `${this.tableData.selectCondition.SelectThType.ThId.toLowerCase()}`
          ];
        let jydfmc =
          row[
            `${this.tableData.selectCondition.SelectThType.DsThId.toLowerCase()}`
          ];
        let czje = parseFloat(row["czje"]);
        let czbs = parseInt(row["czbs"]);
        let jzje = parseFloat(row["jzje"]);
        let jzbs = parseInt(row["jzbs"]);
        let jyzje = parseInt(row["jyzje"]);
        let jyzbs = parseInt(row["jyzbs"]);
        let data1 = {
          id: jymc,
          name: jymc,
          label: jymc,
          tid: this.tableData.tid, //tableid
        };
        let data2 = {
          id: jydfmc,
          name: jydfmc,
          label: jydfmc,
          tid: this.tableData.tid,
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
            tid: this.tableData.tid,
            source: jymc,
            target: jydfmc,
            je: czje,
            bs: czbs,
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
            tid: this.tableData.tid,
            source: jydfmc,
            target: jymc,
            je: jzje,
            bs: jzbs,
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
    makeData203() {
      this.currentSelectedNodes = [];
      let nodes = [];
      let edges = [];
      this.tableData.allrows.forEach((row) => {
        let jymc = row["jymc"];
        let cxkh = row["jyzjhm"];

        let jydfmc = row["jydfmc"];
        let jydfzkh = row["jydfzjhm"];

        let czje = parseFloat(row["czje"]);
        let czbs = parseInt(row["czbs"]);
        let jzje = parseFloat(row["jzje"]);
        let jzbs = parseInt(row["jzbs"]);
        let jyzje = parseInt(row["jyzje"]);
        let jyzbs = parseInt(row["jyzbs"]);
        let data1 = {
          id: cxkh + "\n" + jymc,
          kh: cxkh,
          name: jymc,
          label: cxkh + "\n" + jymc,
          tid: this.tableData.tid, //tableid
        };
        let data2 = {
          id: jydfzkh + "\n" + jydfmc,
          kh: jydfzkh,
          name: jydfmc,
          label: jydfzkh + "\n" + jydfmc,
          tid: this.tableData.tid,
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
            tid: this.tableData.tid,
            source: cxkh + "\n" + jymc,
            target: jydfzkh + "\n" + jydfmc,
            je: czje,
            bs: czbs,
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
            tid: this.tableData.tid,
            source: jydfzkh + "\n" + jydfmc,
            target: cxkh + "\n" + jymc,
            je: jzje,
            bs: jzbs,
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
    makeData202() {
      this.currentSelectedNodes = [];
      let nodes = [];
      let edges = [];
      this.tableData.allrows.forEach((row) => {
        let cxkh = row["cxkh"];
        let jymc = row["jymc"];
        let jydfzkh = row["jydfzkh"];
        let jydfmc = row["jydfmc"];
        let czje = parseFloat(row["czje"]);
        let czbs = parseInt(row["czbs"]);
        let jzje = parseFloat(row["jzje"]);
        let jzbs = parseInt(row["jzbs"]);
        let jyzje = parseInt(row["jyzje"]);
        let jyzbs = parseInt(row["jyzbs"]);
        let data1 = {
          tid: this.tableData.tid,
          id: cxkh + "\n" + jymc,
          kh: cxkh,
          name: jymc,
          label: cxkh + "\n" + jymc,
        };
        let data2 = {
          tid: this.tableData.tid,
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
            tid: this.tableData.tid,
            source: cxkh + "\n" + jymc,
            target: jydfzkh + "\n" + jydfmc,
            je: czje,
            bs: czbs,
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
            tid: this.tableData.tid,
            source: jydfzkh + "\n" + jydfmc,
            target: cxkh + "\n" + jymc,
            je: jzje,
            bs: jzbs,
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
        // if (tempEdges.length > 0) {
        //   if (!bFindData1) nodes.push(data1);
        //   if (!bFindData2) nodes.push(data2);
        //   edges.push(...tempEdges);
        // }
        if (!bFindData1) nodes.push(data1);
        if (!bFindData2) nodes.push(data2);
        edges.push(...tempEdges);
      });
      this.$G6.Util.processParallelEdges(edges);
      this.entityCount = nodes.length;
      this.linkCount = edges.length;
      this.detailCount = this.entityCount + this.linkCount;
      return { nodes, edges };
    },
    handleChangeSpreadNodeValue(newVal) {
      this.accordingSpreadNodeSwitchRefreshNodes();
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
      // this.$store.commit("ShowTable/ADD_OR_REMOVE_RIGHT_TAB", {
      //   componentName: "entity-list-view",
      //   action: "add",
      // });
    },
    calculateEntityInfo(node) {
      let nodeModel = node.getModel();
      let edges = node.getEdges();
      let czjeTotal = 0;
      let czbsTotal = 0;
      let jzjeTotal = 0;
      let jzbsTotal = 0;
      let jcchae = 0; //进出帐差额
      let jczongbs = 0;
      for (let edge of edges) {
        let edgeModel = edge.getModel();
        console.log(edgeModel);
        if (edgeModel.target === nodeModel.id) {
          jzjeTotal = new Decimal(jzjeTotal).add(new Decimal(edgeModel.je));
          jzbsTotal += edgeModel.bs;
        } else {
          czjeTotal = new Decimal(czjeTotal).add(new Decimal(edgeModel.je));
          czbsTotal += edgeModel.bs;
        }
      }
      jcchae = new Decimal(jzjeTotal).sub(new Decimal(czjeTotal));
      jczongbs = jzbsTotal + czbsTotal;
      let entityTableData = [
        {
          title: "姓名",
          describe: nodeModel.name,
        },
        {
          title: "卡号",
          describe: nodeModel.kh,
        },
        {
          title: "交易关联数",
          describe: edges.length,
        },
        {
          title: "出账总金额",
          describe: czjeTotal,
        },
        {
          title: "出账总笔数",
          describe: czbsTotal,
        },
        {
          title: "进账总金额",
          describe: jzjeTotal,
        },
        {
          title: "进账总笔数",
          describe: jzbsTotal,
        },
        {
          title: "进出总差额",
          describe: jcchae,
        },
        {
          title: "进出总笔数",
          describe: jczongbs,
        },
      ];
      let nodeStyle = [
        {
          title: "节点图标",
          describe: nodeModel.icon.img,
        },
        {
          title: "节点背景色",
          describe: nodeModel.style.fill,
        },
        {
          title: "节点边框色",
          describe: nodeModel.style.stroke,
        },
        {
          title: "节点标签色",
          describe: nodeModel.labelCfg.style.fill
            ? nodeModel.labelCfg.style.fill
            : null,
        },
      ];
      let obj = {
        nodeid: nodeModel.id,
        nodeStyle,
        entityTableData,
      };
      return obj;
    },
    // 遍历一个combo，并获取tree结构,并获取所有的nodes和所有的nodes关联的edges
    async travelCombo(root, combo, allNodes, allEdges) {
      // combo.getChildren()返回的结果中的nodes有bug，拖动一次新增一个
      let comboName = combo.getModel().label;
      let comboChildren = combo.getModel().children;
      let comboId = combo.getModel().id;
      let children = [];
      let obj = {
        label: comboName,
        id: comboId,
        type: "combo",
        children,
      };
      root.push(obj);
      for (let item of comboChildren) {
        if (item.itemType === "node") {
          let node = this.graph.findById(item.id);
          allNodes.push(node);
          let edges = node.getEdges();
          allEdges.push(...edges);
          children.push({
            label: node.getModel().name,
            id: node.getModel().id,
            itemData: node.getModel(),
            type: "node",
          });
        } else if (item.itemType === "combo") {
          let combo = this.graph.findById(item.id);
          await this.travelCombo(obj.children, combo, allNodes, allEdges);
        }
      }
    },
  },

  mounted() {
    let _this = this;
    this.tempgraphicMoneySectionStrMd5 = md5(
      JSON.stringify(this.tableData.graphicMoneySectionList)
    );
    // this.registerNode();
    this.registerSelfCombo();
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
        type: "cCircle", // Combo 类型
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
          img: "/static/images/icons/银行卡.png",
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
          lineAppendWidth: 5,
        },
      },
      nodeStateStyles: {
        selected: {
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
      comboStateStyles: {
        dragenter: {
          lineWidth: 4,
          stroke: "#FE9797",
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
    if (this.tableData.hasOwnProperty("relationGraphData")) {
      console.log("a-->", this.tableData.relationGraphData);
      let data = this.$lodash.cloneDeepWith(this.tableData.relationGraphData);
      console.log("a-->", data);
      this.graph.data(data);
    } else {
      this.graph.data(this.makeData()); // 加载数据
    }
    this.graph.render(); // 渲染

    this.updateEntityList();
    this.accordingXianKuanRefreshEdges(this.tableData.xianKuanSetting);
    this.accordingSpreadNodeSwitchRefreshNodes();
    let nodes = this.graph.getNodes();
    let edges = this.graph.getEdges();
    this.entityCount = nodes.length;
    this.linkCount = edges.length;
    this.detailCount = this.entityCount + this.linkCount;
    // 监听布局切换
    // this.$store.commit("MainPageSwitch/SET_TABBARACTIVENAME", "second");
    // 当 click-select 选中的元素集合发生变化时将会触发下面时机事件，e 中包含相关信息
    this.graph.on("nodeselectchange", async (e) => {
      console.log("nodeselectchange", e);
      // 单个节点的select
      let node = e.target;
      if (node) {
        let type = node.getType();
        let nodeModel = node.get("model");
        if (type === "node") {
          let entity = this.calculateEntityInfo(node);
          console.log({ entity });
          this.$store.commit("ShowTable/UPDATE_ENTITY", entity);
          this.$store.commit("ShowTable/ADD_OR_REMOVE_RIGHT_TAB", {
            componentName: "entity-view",
            action: "add",
          });
        } else if (type === "combo") {
          let comboentityList = [];
          let allNodes = [];
          let allEdges = [];
          await this.travelCombo(comboentityList, node, allNodes, allEdges);
          // 给所有边去重复
          allEdges = this.$lodash.uniqWith(allEdges, this.$lodash.isEqual);
          let zuNeiNodeCount = allNodes.length; // 组内成员数量
          let zuNeiJjze = 0; // 组内交易总额
          let zuNeiJjbs = 0; // 组内交易笔数
          let zuNeiDuiWaiJjze = 0; // 组内对外交易总额
          let zuNeiDuiWaiJjbs = 0; // 组内对外交易笔数
          let zuNeiDuiWaiJjChaE = 0;
          function belongsToNodes(id) {
            for (let node of allNodes) {
              if (node.getModel().id === id) {
                return true;
              }
            }
            return false;
          }

          for (let edge of allEdges) {
            let modelData = edge.getModel();
            let sourceId = modelData.source;
            let targetId = modelData.target;
            if (belongsToNodes(sourceId) && belongsToNodes(targetId)) {
              zuNeiJjze = new Decimal(zuNeiJjze).add(new Decimal(modelData.je));
              zuNeiJjbs = new Decimal(zuNeiJjbs).add(new Decimal(modelData.bs));
            } else {
              zuNeiDuiWaiJjze = new Decimal(zuNeiDuiWaiJjze).add(
                new Decimal(modelData.je)
              );
              zuNeiDuiWaiJjbs = new Decimal(zuNeiDuiWaiJjbs).add(
                new Decimal(modelData.bs)
              );
              if (belongsToNodes(sourceId)) {
                zuNeiDuiWaiJjChaE = new Decimal(zuNeiDuiWaiJjChaE).sub(
                  modelData.je
                );
              } else {
                zuNeiDuiWaiJjChaE = new Decimal(zuNeiDuiWaiJjChaE).add(
                  modelData.je
                );
              }
            }
          }
          this.$store.commit("ShowTable/UPDATE_COMBO_ENTITY_LIST", {
            comboName: nodeModel.label,
            comboentityList,
            comboTableData: [
              {
                title: "组内成员数量",
                describe: zuNeiNodeCount,
              },
              {
                title: "组内成员间交易总额",
                describe: zuNeiJjze,
              },
              {
                title: "组内成员间交易笔数",
                describe: zuNeiJjbs,
              },
              {
                title: "组内对外交易总额",
                describe: zuNeiDuiWaiJjze,
              },
              {
                title: "组内对外交易笔数",
                describe: zuNeiDuiWaiJjbs,
              },
              {
                title: "组内对外交易差额",
                describe: zuNeiDuiWaiJjChaE,
              },
            ],
          });
          this.$store.commit("ShowTable/ADD_OR_REMOVE_RIGHT_TAB", {
            componentName: "combo-entity-list-view",
            action: "add",
          });
        }
      }
      const selectedNodes = this.graph.findAllByState("node", "selected");
      console.log(selectedNodes);
      selectedNodes.forEach((cn) => {
        this.graph.setItemState(cn, "selected", false);
      });
      if (e.select) {
        e.selectedItems.nodes.forEach((cn) => {
          this.graph.setItemState(cn, "selected", true); // 设置当前节点的 click 状态为 true
        });
        this.currentSelectedNodes = e.selectedItems.nodes;
      } else {
        this.currentSelectedNodes = [];
      }
    });
    this.graph.on("click", () => {
      this.menuVisible = false;
    });
    // collapse/expand when click the marker
    this.graph.on("combo:click", (e) => {
      if (e.target.get("name") === "combo-marker-shape") {
        // graph.collapseExpandCombo(e.item.getModel().id);
        this.graph.collapseExpandCombo(e.item);
        // if (this.graph.get("layout")) this.graph.layout();
        // else this.graph.refreshPositions();
      }
    });
    this.graph.on("combo:dragend", (e) => {
      this.graph.getCombos().forEach((combo) => {
        this.graph.setItemState(combo, "dragenter", false);
      });
    });
    this.graph.on("node:dragend", (e) => {
      this.graph.getCombos().forEach((combo) => {
        this.graph.setItemState(combo, "dragenter", false);
      });
    });
    this.graph.on("combo:dragenter", (e) => {
      this.graph.setItemState(e.item, "dragenter", true);
    });
    this.graph.on("combo:dragleave", (e) => {
      this.graph.setItemState(e.item, "dragenter", false);
    });

    // 右键点击combo
    this.graph.on("combo:contextmenu", (evt) => {
      this.rightClickType = "combo";
      console.log(evt);
      this.rightClickComboInstance = evt.item;
      //当前节点定位
      this.menuVisible = true; // 显示模态窗口，跳出自定义菜单栏
      let menu = document.getElementById(this.menuId);
      menu.style.left = evt.clientX + "px";
      menu.style.top = evt.clientY + "px";
    });
    // 右键菜单node
    this.graph.on("node:contextmenu", (evt) => {
      this.rightClickType = "node";
      let node = evt.item;
      this.nodeBelongCombo = this.accordingNodeFindCombo(
        this.graph.getCombos(),
        node
      );
      let nodeid = node.get("model").id;
      let filterNodes = this.currentSelectedNodes.filter((n) => {
        let nId = n.get("model").id;
        return nId === nodeid;
      });
      if (filterNodes.length === 0) {
        this.currentSelectedNodes.forEach((cn) => {
          this.graph.setItemState(cn, "selected", false);
        });
        this.graph.setItemState(node, "selected", true);
        this.currentSelectedNodes = [];
        this.currentSelectedNodes.push(node);
      }
      //当前节点定位
      this.menuVisible = true;
      let menu = document.getElementById(this.menuId);
      menu.style.left = evt.clientX + "px";
      menu.style.top = evt.clientY + "px";
      console.log("右键被点击的event:", evt);
    });

    this.graph.on("node:mouseleave", (evt) => {
      this.menuVisible = false;
    });
    this.graph.on("combo:mouseleave", (evt) => {
      this.menuVisible = false;
    });
    // 画布监听keydown
    this.graph.on("keydown", (ev) => {
      // console.log(ev);
    });
    // 布局切换监听
    this.$bus.$on("swichNormalLayout", (data) => {
      let { graphid, layout } = data;
      if (graphid !== _this.graphid) return;
      console.log(layout, typeof layout);
      _this.graph.updateLayout(layout);
      this.updateEntityList();
      this.accordingXianKuanRefreshEdges(this.tableData.xianKuanSetting);
      this.graph.fitView(20);
    });
    // node节点状态更新监听, 针对entitylist组件中鼠标移动进行图表中node的状态更新
    this.$bus.$on("updateNodeState", this.onUpdateNodesState);

    //保存当前图表数据
    this.$bus.$on("saveGraphData", (data) => {
      let { graphid } = data;
      if (graphid !== _this.graphid) return;
      // 包含nodes，edges，combos
      let relationGraphData = this.graph.save();
      console.log(relationGraphData);
      this.$store.commit("ShowTable/SAVE_GRAPHDATA", {
        graphid,
        relationGraphData,
      });
    });
    // 图表导出到图片
    this.$bus.$on("exportPicture", async (data) => {
      let { graphid } = data;
      if (graphid !== _this.graphid) return;
      let pngName = `案件${this.caseBase.ajmc}-${this.tableData.title}`;
      console.log(pngName);
      this.graph.downloadFullImage(pngName, "image/png");
    });
    // 监听右侧菜单中点击table中的每个实体消息
    this.$bus.$on("clickEntityRow", (data) => {
      let { graphid, nodeid } = data;
      if (graphid !== _this.graphid) return;
      console.log({ graphid, nodeid });
      let node = this.graph.findById(nodeid);
      let entity = this.calculateEntityInfo(node);
      console.log({ entity });
      this.$store.commit("ShowTable/UPDATE_ENTITY", entity);
      this.$store.commit("ShowTable/ADD_OR_REMOVE_RIGHT_TAB", {
        componentName: "entity-view",
        action: "add",
      });
    });
    this.$bus.$on("nodeStyleSetting", (data) => {
      console.log({ data });
      let { graphid, nodeid, nodeStyle } = data;
      if (graphid !== _this.graphid) return;
      let node = this.graph.findById(nodeid);
      this.graph.clearItemStates(node, "selected");
      let nodeModel = node.getModel();
      switch (nodeStyle.title) {
        case "节点图标":
          nodeModel.icon.img = nodeStyle.describe;
          this.graph.updateItem(nodeid, nodeModel);
          break;
        case "节点背景色":
          nodeModel.style.fill = nodeStyle.describe;
          this.graph.updateItem(nodeid, nodeModel);
          break;
        case "节点边框色":
          nodeModel.style.stroke = nodeStyle.describe;
          this.graph.updateItem(nodeid, nodeModel);
          break;
        case "节点标签色":
          nodeModel.labelCfg.style.fill = nodeStyle.describe;
          this.graph.updateItem(nodeid, nodeModel);
          break;
      }
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