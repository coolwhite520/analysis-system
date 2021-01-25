<template>
  <div>
    <el-row
      style="background-color: #fff; padding: 5px; border: 1px solid #dddfe5"
    >
      <el-col :span="16" v-if="tableData.tableType !== 'emptyGraph'">
        <el-button-group>
          <el-button
            size="mini"
            v-for="(item, index) of tableData.graphicMoneySectionList"
            :key="item.id"
            :style="{ color: item.selected ? item.color : '#1e1e1e' }"
            :icon="item.selected ? 'el-icon-success' : 'el-icon-error'"
            @click="handleClickMoneySpan(item.id)"
            >{{
              calLabel(
                item,
                index > 0 ? tableData.graphicMoneySectionList[index - 1] : null
              )
            }}</el-button
          >
        </el-button-group>
      </el-col>
      <el-col :span="2" v-if="tableData.tableType !== 'emptyGraph'">
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
      <el-col :span="2" v-if="tableData.tableType !== 'emptyGraph'">
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
      <el-col :span="1" v-if="tableData.tableType !== 'emptyGraph'">
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
      <template v-if="tableData.tableType === 'emptyGraph'">
        <el-col :span="21"> &nbsp; </el-col>
      </template>
      <el-col :span="3">
        <el-input
          size="mini"
          v-model="inputValue"
          placeholder="关键字查询"
        ></el-input>
      </el-col>
    </el-row>

    <!-- <div :id="miniMapID" style="width:100px;"></div> -->
    <div
      v-loading="loading"
      element-loading-text="拼命加载中"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.8)"
    >
      <div
        :id="graphid"
        :style="{ height: limitHeight - 26 + 'px', width: '100%' }"
      ></div>
      <div :id="myOverviewDiv"></div>
      <div>
        <ul :id="contextMenuId" class="ctxmenu">
          <!-- <li id="cut" class="menu-item" onclick="cxcommand(event)">剪切</li>
      <li id="copy" class="menu-item" onclick="cxcommand(event)">拷贝</li>
      <li id="paste" class="menu-item" onclick="cxcommand(event)">粘贴</li>
      <li id="delete" class="menu-item" onclick="cxcommand(event)">删除</li> -->
          <li
            :id="selectRelatedNodesId"
            class="menu-item"
            @click="cxcommand('selectRelatedNodes')"
          >
            选中关联节点
          </li>
          <li :id="unGroupId" class="menu-item" @click="cxcommand('unGroup')">
            解体当前分组
          </li>
          <li
            :id="makeGroupId"
            class="menu-item"
            @click="cxcommand('makeGroup')"
          >
            合并选中实体
          </li>
          <li
            :id="removeFromGroupId"
            class="menu-item"
            @click="cxcommand('removeFromGroup')"
          >
            从分组移除
          </li>
          <li :id="addToGroupId" class="menu-item">
            添加到分组
            <ul class="ctxmenu">
              <li
                v-for="(item, index) in allGroupList"
                :key="index"
                class="menu-item"
                @click="cxcommand('addToGroup', item)"
              >
                {{ item.text }}
              </li>
            </ul>
          </li>
        </ul>
      </div>
      <!-- <el-button @click="handleClickTest">双向绑定</el-button> -->
    </div>
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
        <el-tooltip
          class="item"
          effect="dark"
          :content="
            !enableDragCavans
              ? '点击可拖拽画布(也可双击空白画布进行切换)'
              : '点击可框选节点(也可双击空白画布进行切换)'
          "
          placement="top-start"
        >
          <el-button
            type="text"
            size="mini"
            class="iconfont"
            style="padding-left: 10px; border-left: 1px solid #dddfe5"
            @click="handleClickSwitchDragCavans"
            >{{ enableDragCavans ? "&#xe642;" : "&#xe625;" }}</el-button
          >
        </el-tooltip>
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
    <graphic-setting v-if="graphicSettingVisible"></graphic-setting>

    <!-- 连接两个节点 -->
    <div v-if="showLinkNodeDialog">
      <el-dialog
        v-dialogDrag
        :close-on-click-modal="false"
        class="standard-data-dialog"
        :append-to-body="true"
        :visible="showLinkNodeDialog"
        width="25%"
        @close="handleClose"
        :modal="true"
      >
        <div slot="title" class="dialog-title">
          <i class="iconfont" style="color: white; font-size: 30px">&#xe752;</i>
          <span class="title-text" style="color: white">创建连接</span>
          <div class="button-right">
            <span class="title-close" @click="handleClose"></span>
          </div>
        </div>
        <div style="text-align: left">
          <div>
            源节点：<span style="color: green">{{ sourceNodeData.text }}</span>
          </div>
          <div style="text-align: center">
            <el-button type="text" @click="handleClickSwitch"
              ><span class="iconfont" style="font-size: 40px"
                >&#xe648;</span
              ></el-button
            >
          </div>
          <div>
            目标节点：<span style="color: #f29c38">{{ desNodeData.text }}</span>
          </div>
        </div>
        <div>
          请输入交易金额：&nbsp;&nbsp;&nbsp;<el-input-number
            :precision="2"
            :step="0.1"
            style="margin-top: 10px; width: 50%"
            ref="inputName"
            size="mini"
            v-model="inputNewLinkJe"
            placeholder="请输入交易金额"
          ></el-input-number>
        </div>
        <div>
          请输入交易笔数：&nbsp;&nbsp;
          <el-input-number
            style="margin-top: 10px; width: 50%"
            ref="inputName"
            size="mini"
            v-model="inputNewLinkBs"
            placeholder="请输入交易笔数"
          ></el-input-number>
        </div>

        <el-row style="margin-top: 20px; text-align: center">
          <el-button @click="handleClose" size="mini" style="width: 30%"
            >取消</el-button
          >

          <el-button
            @click="handleClickSureLink"
            size="mini"
            style="width: 30%"
            type="primary"
            >确定</el-button
          >
        </el-row>
      </el-dialog>
    </div>
  </div>
</template>

<script>
/*
在文件中搜索
7eba17a4ca3b1a8346
会看到类似这段代码
a.ax = d[u.Da("7eba17a4ca3b1a8346")][u.Da("78a118b7")](d, u.wl, 4, 4);
//替换成
a.ax = function(){return true;}
npm引入的话，在node_modules中搜索
go.js和go-debug.js分别按上面步骤替换代码即可
*/
import go from "gojs";
import insertCss from "insert-css";
import { mapState } from "vuex";
import { Decimal } from "decimal.js";
import Tools from "./findDisTools/tools";
import GraphicSetting from "@/pages/dialog/graphicsetting/graphicSettingDialog";
const uuid = require("uuid");
const md5 = require("md5-node");
const elementResizeDetectorMaker = require("element-resize-detector");

const $ = go.GraphObject.make;
function ParallelRouteLink() {
  go.Link.call(this);
}
go.Diagram.inherit(ParallelRouteLink, go.Link);

ParallelRouteLink.prototype.computeSpacing = function () {
  return 20;
};
ParallelRouteLink.prototype.computePoints = function () {
  var result = go.Link.prototype.computePoints.call(this);
  if (
    !this.isOrthogonal &&
    this.curve !== go.Link.Bezier &&
    this.hasCurviness()
  ) {
    var curv = this.computeCurviness();

    if (curv !== 0) {
      var num = this.pointsCount;
      // console.log({ num });
      var pidx = 0;
      var qidx = num - 1;
      if (num >= 4) {
        pidx++;
        qidx--;
      }

      var frompt = this.getPoint(pidx);
      var topt = this.getPoint(qidx);
      var dx = topt.x - frompt.x;
      var dy = topt.y - frompt.y;

      var mx = frompt.x + (dx * 1) / 800;
      var my = frompt.y + (dy * 1) / 800;
      var px = mx;
      var py = my;
      if (-0.01 < dy && dy < 0.01) {
        if (dx > 0) py -= curv;
        else py += curv;
      } else {
        var slope = -dx / dy;
        var e = Math.sqrt((curv * curv) / (slope * slope + 1));
        if (curv < 0) e = -e;
        px = (dy < 0 ? -1 : 1) * e + mx;
        py = slope * (px - mx) + my;
      }

      mx = frompt.x + (dx * 799) / 800;
      my = frompt.y + (dy * 799) / 800;
      var qx = mx;
      var qy = my;
      if (-0.01 < dy && dy < 0.01) {
        if (dx > 0) qy -= curv;
        else qy += curv;
      } else {
        var slope = -dx / dy;
        var e = Math.sqrt((curv * curv) / (slope * slope + 1));
        if (curv < 0) e = -e;
        qx = (dy < 0 ? -1 : 1) * e + mx;
        qy = slope * (qx - mx) + my;
      }
      this.clearPoints();
      this.insertPointAt(pidx + 1, px, py);
      this.insertPointAt(qidx + 1, qx, qy);
    }
  }
  return result;
};

export default {
  props: ["tableData", "limitHeight"],
  created() {},
  data() {
    return {
      inputNewLinkJe: 0,
      inputNewLinkBs: 0,
      sourceNodeData: null,
      desNodeData: null,
      showLinkNodeDialog: false,
      loading: false,
      selectRelatedNodesId: "li" + uuid.v1(),
      unGroupId: "li" + uuid.v1(),
      makeGroupId: "li" + uuid.v1(),
      addToGroupId: "li" + uuid.v1(),
      removeFromGroupId: "li" + uuid.v1(),
      // 默认overview
      defaultOverViewStrokeColor: "#3982f7",
      // node默认属性
      defaultNodeFillColor: "#f0f4fe",
      defaultNodeStrokeColor: "#1a202d",
      selectedStrokeColor: "red",
      selectedTextColor: "white",
      defaultNodeTextColor: "gray",
      defaultNodeStrokeWidth: 1,
      defaultLineStrokeWidth: 3,
      myDiagram: null,
      myOverview: null,
      myContextMenu: null,
      enableDragCavans: true,
      // link默认属性
      linkTextVisible: true,
      linkTexteditable: false,
      myOverviewDiv: "div-" + uuid.v1().replace(/-/g, ""),
      contextMenuId: "div-" + uuid.v1().replace(/-/g, ""),
      allGroupList: [], // 所有的分组信息
      entityCount: 0,
      linkCount: 0,
      detailCount: 0,
      inputValue: "",
      currentRightNode: null,
      tempgraphicMoneySectionStrMd5: "",
      tempAllRowsStrMd5: "",
      defaultImg: "/static/images/icons/银行卡.png",
    };
  },
  watch: {
    inputValue(newValue, oldValue) {
      if (newValue === "") {
        this.myDiagram.clearSelection();
        return;
      }
      let list = new go.List();
      const nodes = this.myDiagram.nodes;
      nodes.each((node) => {
        if (node.data.text.indexOf(newValue) !== -1) {
          list.add(node);
        }
      });
      this.myDiagram.selectCollection(list);
    },
    "tableData.graphicMoneySectionList": {
      handler(newValue, oldValue) {
        // 因为监听的是对象，所以新旧两个值是一样的，都是同一个地址的引用对象
        if (
          this.tempgraphicMoneySectionStrMd5 !== md5(JSON.stringify(newValue))
        ) {
          console.log("tableData.graphicMoneySectionList");
          this.tempgraphicMoneySectionStrMd5 = md5(JSON.stringify(newValue));
          let { nodes, links } = this.makeData();
          this.myDiagram.model = new go.GraphLinksModel(nodes, links); // 加载数据
          this.accordingXianKuanRefreshEdges(this.tableData.xianKuanSetting);
          this.accordingSpreadNodeSwitchRefreshNodes();
          this.allNodesToFront();
          this.updateEntityList();
          let layout = this.tableData.graphType;
          this.onSwitchLayout({ graphid: this.graphid, layout });
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
            let { nodes, links } = this.makeData();
            this.myDiagram.model = new go.GraphLinksModel(nodes, links); // 加载数据
            this.updateEntityList();
            this.accordingXianKuanRefreshEdges(this.tableData.xianKuanSetting);
            this.allNodesToFront();
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
  computed: {
    ...mapState("DialogPopWnd", ["graphicSettingVisible"]),
    ...mapState("CaseDetail", ["caseBase"]),
    fullScrrenFlag() {
      return this.tableData.fullScrrenFlag;
    },
    graphid() {
      return this.tableData.graphid;
    },
    bSpreadNodeSwitch: {
      get() {
        return this.tableData.SpreadNodeSwitch;
      },
      set(newValue) {
        this.$store.commit("ShowTable/SET_SPREADNODESWITCH", newValue);
      },
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
  components: {
    "graphic-setting": GraphicSetting,
  },
  methods: {
    handleClickSwitch() {
      let temp = this.sourceNodeData;
      this.sourceNodeData = this.$lodash.cloneDeep(this.desNodeData);
      this.desNodeData = this.$lodash.cloneDeep(temp);
    },
    handleClose() {
      this.showLinkNodeDialog = false;
    },
    handleClickSureLink() {
      this.addLinkData(
        this.sourceNodeData.key,
        this.desNodeData.key,
        this.inputNewLinkJe,
        this.inputNewLinkBs
      );
      this.showLinkNodeDialog = false;
    },
    async handleClickMoneySpan(value) {
      this.$store.commit("ShowTable/MODIFY_MONDY_SECTION_CHECKED", value);
      // 重新渲染页面
    },
    accordingSpreadNodeSwitchRefreshNodes() {
      let allNodes = this.myDiagram.nodes;
      if (this.bSpreadNodeSwitch) {
        // 显示离散点
        allNodes.each((node) => {
          node.visible = true;
        });
      } else {
        allNodes.each((node) => {
          if (node instanceof go.Group) {
            node.visible = true;
          } else if (
            node instanceof go.Node &&
            node.linksConnected.count === 0
          ) {
            node.visible = false;
          } else node.visible = true;
        });
      }
      console.log("accordingSpreadNodeSwitchRefreshNodes");
    },
    // 根据线宽设置
    accordingXianKuanRefreshEdges(xianKuanSetting) {
      let { category, levelNum, open, openNodeSpread } = xianKuanSetting;
      let allEdges = this.myDiagram.links;
      if (open) {
        let minJe, maxJe, minBs, maxBs;
        let bFirstLoop = true;
        allEdges.each((edge) => {
          let model = edge.data;
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
        });
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
          this.myDiagram.startTransaction("strokeWidth");
          allEdges.each((edge) => {
            this.myDiagram.model.setDataProperty(
              edge.data,
              "strokeWidth",
              getLineWidth(edge.data.je, jeXianKuanList)
            );
          });
          this.myDiagram.commitTransaction("strokeWidth");
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
          this.myDiagram.startTransaction("strokeWidth");
          allEdges.each((edge) => {
            this.myDiagram.model.setDataProperty(
              edge.data,
              "strokeWidth",
              getLineWidth(edge.data.bs, bsXianKuanList)
            );
          });
          this.myDiagram.commitTransaction("strokeWidth");
        }
      } else {
        this.myDiagram.startTransaction("strokeWidth");
        allEdges.each((edge) => {
          this.myDiagram.model.setDataProperty(edge.data, "strokeWidth", 1);
        });
        this.myDiagram.commitTransaction("strokeWidth");
      }
    },
    handleClickSwitchDragCavans() {
      this.enableDragCavans = !this.enableDragCavans;
      this.switchAllowScroll();
    },
    async handleClickSetting() {
      await this.$store.commit("DialogPopWnd/SET_GRAPHICSETTINGVISIBLE", true);
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
    covertColorToRgba(colorHex, alpha = 0.3) {
      if (colorHex.charAt(0) == "#") {
        let rgb = parseInt(colorHex.substr(1, 6), 16);
        let r = rgb >> 16;
        let g = (rgb >> 8) & 0xff;
        let b = rgb & 0xff;
        let rgba = "rgba(" + r + "," + g + "," + b + ", " + alpha + ")";
        return rgba;
      }
      return colorHex;
    },
    handleChangeSpreadNodeValue(newVal) {
      this.accordingSpreadNodeSwitchRefreshNodes();
      this.updateEntityList();
    },
    handleClickEnlarge() {
      this.myDiagram.scale += 0.1;
    },
    handleClickReduce() {
      this.myDiagram.scale -= 0.1;
    },
    handleClickLocation() {
      this.myDiagram.commandHandler.zoomToFit();
    },
    handleClickFullScreen() {
      this.$store.commit("ShowTable/UPDATE_FULLSCRRENFLAG");
    },
    GridLayout() {
      // 以关联数量进行降序排列
      this.myDiagram.layout = $(go.GridLayout, {
        wrappingColumn: 15,
        sorting: go.GridLayout.Descending,
        comparer: function (pa, pb) {
          var da = pa.findLinksConnected();
          var db = pb.findLinksConnected();
          if (da.count < db.count) return -1;
          if (da.count > db.count) return 1;
          return 0;
        },
      });
    },
    CircularLayout() {
      this.myDiagram.layout = $(go.CircularLayout);
      console.log("CircularLayout");
    },
    switchAllowScroll() {
      this.myDiagram.allowHorizontalScroll = this.enableDragCavans;
      this.myDiagram.allowVerticalScroll = this.enableDragCavans;
    },
    initDiagram() {
      let _this = this;
      this.myContextMenu = $(go.HTMLInfo, {
        show: showContextMenu,
        hide: hideContextMenu,
      });
      var cxElement = document.getElementById(this.contextMenuId);
      cxElement.addEventListener(
        this.contextMenuId,
        function (e) {
          e.preventDefault();
          return false;
        },
        false
      );
      // this.myDiagram.contextMenu = myContextMenu;
      function hideCX() {
        if (_this.myDiagram.currentTool instanceof go.ContextMenuTool) {
          _this.myDiagram.currentTool.doCancel();
        }
      }
      function showContextMenu(obj, diagram, tool) {
        // Show only the relevant buttons given the current state.
        var cmd = diagram.commandHandler;
        var hasMenuItem = false;
        function maybeShowItem(elt, pred) {
          if (pred) {
            elt.style.display = "block";
            hasMenuItem = true;
          } else {
            elt.style.display = "none";
          }
        }
        let selection = diagram.selection;

        if (obj instanceof go.Group && selection.size === 1) {
          maybeShowItem(document.getElementById(_this.unGroupId), true);
        } else {
          maybeShowItem(document.getElementById(_this.unGroupId), false);
        }

        if (obj instanceof go.Node && !(obj instanceof go.Group)) {
          maybeShowItem(
            document.getElementById(_this.selectRelatedNodesId),
            true
          );
          _this.currentRightNode = obj;
        } else {
          maybeShowItem(
            document.getElementById(_this.selectRelatedNodesId),
            false
          );
        }

        function isAllInGroup() {
          let success = true;
          var it = selection.iterator;
          while (it.next()) {
            if (it.value instanceof go.Node) {
              if (
                it.value.data.hasOwnProperty("group") &&
                it.value.data.group
              ) {
                continue;
              } else {
                success = false;
                break;
              }
            }
          }
          return success;
        }
        maybeShowItem(
          document.getElementById(_this.removeFromGroupId),
          isAllInGroup()
        );
        maybeShowItem(
          document.getElementById(_this.addToGroupId),
          _this.haveGroupList()
        );
        maybeShowItem(
          document.getElementById(_this.makeGroupId),
          selection.size > 1
        );
        // maybeShowItem(
        //   document.getElementById("cut"),
        //   false && cmd.canCutSelection()
        // );
        // maybeShowItem(document.getElementById("copy"), cmd.canCopySelection());
        // maybeShowItem(
        //   document.getElementById("paste"),
        //   cmd.canPasteSelection(
        //     diagram.toolManager.contextMenuTool.mouseDownPoint
        //   )
        // );
        // maybeShowItem(
        //   document.getElementById("delete"),
        //   cmd.canDeleteSelection()
        // );
        // Now show the whole context menu element
        if (hasMenuItem) {
          cxElement.classList.add("show-menu");
          // we don't bother overriding positionContextMenu, we just do it here:
          var mousePt = new go.Point(
            diagram.lastInput.event.clientX,
            diagram.lastInput.event.clientY
          );
          // mousePt = diagram.transformDocToView(mousePt);
          cxElement.style.left = mousePt.x + 10 + "px";
          cxElement.style.top = mousePt.y + "px";
        }
        window.addEventListener("click", hideCX, true);
      }
      function hideContextMenu() {
        cxElement.classList.remove("show-menu");
        window.removeEventListener("click", hideCX, true);
      }
      this.myDiagram = $(
        go.Diagram,
        this.graphid,
        {
          initialAutoScale: go.Diagram.UniformToFill,
          initialContentAlignment: go.Spot.Center,
          contentAlignment: go.Spot.Center,
          allowDrop: this.enableDragCavans,
          "animationManager.isEnabled": true,
          "animationManager.duration": 800,
          // allowHorizontalScroll: true,
          // allowVerticalScroll: true,
          "toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom,
          // "commandHandler.archetypeGroupData": {
          //   text: "组",
          //   isGroup: true,
          //   color: "blue",
          // },
          "toolManager.hoverDelay": 100, // how quickly tooltips are shown
          "undoManager.isEnabled": true,
        },
        {
          doubleClick: (e, node) => {
            this.enableDragCavans = !this.enableDragCavans;
            this.switchAllowScroll();
          },
        }
      );

      // this.myDiagram.addDiagramListener(
      //   "BackgroundSingleClicked",
      //   function (e) {
      //     _this.inputValue = "";
      //   }
      // );

      // this.myDiagram.addDiagramListener(
      //   "BackgroundDoubleClicked",
      //   function (e) {
      //     _this.inputValue = "";
      //   }
      // );
    },
    initOverView() {
      let _this = this;
      insertCss(`
        #${_this.myOverviewDiv} {
            position: absolute;
            width: 200px;
            height: 100px;
            bottom: 40px;
            right: 8px;
            background-color: #f5f7fa;
            z-index: 300;
            border: solid 1px #e2e2e2;
          }
      `);
      this.myOverview = $(
        go.Overview,
        this.myOverviewDiv, // the HTML DIV element for the Overview
        {
          observed: _this.myDiagram,
          contentAlignment: go.Spot.Center,
          initialScale: 0.05,
          autoScale: go.Diagram.None,
          hasHorizontalScrollbar: false, // don't show any scrollbars
          hasVerticalScrollbar: false,
          "toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom,
          "undoManager.isEnabled": true,
        }
      ); // tell it which Diagram to show and pan
      let shape = this.myOverview.box.elt(0);
      shape.stroke = _this.defaultOverViewStrokeColor;
      console.log(shape.fill);
    },
    textStyle() {
      return {
        font: "bold 9pt Segoe UI, sans-serif",
        stroke: "black",
        margin: 0,
      };
    },
    updateEntityList() {
      const nodes = this.myDiagram.nodes;
      let entityList = [];
      nodes.each((node) => {
        let model = node.data;
        let edges = node.linksConnected;
        if (this.bSpreadNodeSwitch) {
          entityList.push({
            ...model,
            id: model.key,
            relationCount: edges.count,
          });
        } else {
          if (node.visible) {
            entityList.push({
              ...model,
              id: model.key,
              relationCount: edges.count,
            });
          }
        }
      });
      entityList = entityList.sort(function (a, b) {
        return b.relationCount - a.relationCount;
      });
      this.entityCount = entityList.length;
      this.linkCount = this.myDiagram.links.count;
      this.detailCount = this.entityCount + this.linkCount;
      this.$store.commit("ShowTable/UPDATE_ENTITY_LIST", entityList);
      console.log("updateEntityList");
    },
    // 随机布局
    randomLayout() {
      let viewportBounds = this.myDiagram.viewportBounds;
      let allNodes = this.myDiagram.nodes;
      this.myDiagram.startTransaction("reset position");
      allNodes.each((node) => {
        let point = new go.Point(
          Math.random() * viewportBounds.width,
          Math.random() * viewportBounds.height
        );
        this.myDiagram.model.setDataProperty(
          node.data,
          "loc",
          go.Point.stringify(point)
        );
      });
      this.myDiagram.commitTransaction("reset position");
      this.myDiagram.layout = $(go.Layout);
      // this.myDiagram.layout.doLayout(this.myDiagram.nodes);
    },
    // 聚类布局
    ForceDirectedLayout() {
      let allNodes = this.myDiagram.nodes;
      this.myDiagram.startTransaction("reset position");
      allNodes.each((node) => {
        this.myDiagram.model.setDataProperty(node.data, "loc", "0 0");
      });
      this.myDiagram.commitTransaction("reset position");
      this.myDiagram.layout = $(go.ForceDirectedLayout);
    },
    // 组织结构布局
    func1() {
      this.myDiagram.layout = $(
        go.TreeLayout, // use a TreeLayout to position all of the nodes
        {
          isOngoing: false, // don't relayout when expanding/collapsing panels
          treeStyle: go.TreeLayout.StyleLastParents,
          // properties for most of the tree:
          angle: 90,
          layerSpacing: 80,
          // properties for the "last parents":
          alternateAngle: 0,
          alternateAlignment: go.TreeLayout.AlignmentStart,
          alternateNodeIndent: 15,
          alternateNodeIndentPastParent: 1,
          alternateNodeSpacing: 15,
          alternateLayerSpacing: 40,
          alternateLayerSpacingParentOverlap: 1,
          alternatePortSpot: new go.Spot(0.001, 1, 20, 0),
          alternateChildPortSpot: go.Spot.Left,
        }
      );
    },
    layoutTree(option) {
      if (option == undefined)
        option = {
          //layerSpacing: 150,
          //angle: 90,
          comparer: go.LayoutVertex.smartComparer,
        };

      this.myDiagram.layout = $(go.TreeLayout, {
        comparer: go.LayoutVertex.smartComparer,
      });

      this.myDiagram.startTransaction("change Layout");
      var lay = this.myDiagram.layout;

      var style = option.style == undefined ? "Layered" : option.style;
      if (style === "Layered") lay.treeStyle = go.TreeLayout.StyleLayered;
      else if (style === "Alternating")
        lay.treeStyle = go.TreeLayout.StyleAlternating;
      else if (style === "LastParents")
        lay.treeStyle = go.TreeLayout.StyleLastParents;
      else if (style === "RootOnly")
        lay.treeStyle = go.TreeLayout.StyleRootOnly;

      var layerStyle =
        option.layerStyle == undefined ? "Individual" : option.layerStyle;
      if (layerStyle === "Individual")
        lay.layerStyle = go.TreeLayout.LayerIndividual;
      else if (layerStyle === "Siblings")
        lay.layerStyle = go.TreeLayout.LayerSiblings;
      else if (layerStyle === "Uniform")
        lay.layerStyle = go.TreeLayout.LayerUniform;

      var angle = option.angle == undefined ? 90 : option.angle;
      angle = parseFloat(angle, 10);
      lay.angle = angle;

      var align = option.align == undefined ? "CenterChildren" : option.align;
      if (align === "CenterChildren")
        lay.alignment = go.TreeLayout.AlignmentCenterChildren;
      else if (align === "CenterSubtrees")
        lay.alignment = go.TreeLayout.AlignmentCenterSubtrees;
      else if (align === "Start") lay.alignment = go.TreeLayout.AlignmentStart;
      else if (align === "End") lay.alignment = go.TreeLayout.AlignmentEnd;
      else if (align === "Bus") lay.alignment = go.TreeLayout.AlignmentBus;
      else if (align === "BusBranching")
        lay.alignment = go.TreeLayout.AlignmentBusBranching;
      else if (align === "TopLeftBus")
        lay.alignment = go.TreeLayout.AlignmentTopLeftBus;
      else if (align === "BottomRightBus")
        lay.alignment = go.TreeLayout.AlignmentBottomRightBus;

      var nodeSpacing =
        option.nodeSpacing == undefined ? 20 : option.nodeSpacing;
      nodeSpacing = parseFloat(nodeSpacing, 10);
      lay.nodeSpacing = nodeSpacing;

      var nodeIndent = option.nodeIndent == undefined ? 0 : option.nodeIndent;
      nodeIndent = parseFloat(nodeIndent, 10);
      lay.nodeIndent = nodeIndent;

      var nodeIndentPastParent =
        option.nodeIndentPastParent == undefined
          ? 0
          : option.nodeIndentPastParent;
      nodeIndentPastParent = parseFloat(nodeIndentPastParent, 10);
      lay.nodeIndentPastParent = nodeIndentPastParent;

      var layerSpacing =
        option.layerSpacing == undefined ? 50 : option.layerSpacing;
      layerSpacing = parseFloat(layerSpacing, 10);
      lay.layerSpacing = layerSpacing;

      var layerSpacingParentOverlap =
        option.layerSpacingParentOverlap == undefined
          ? 0
          : option.layerSpacingParentOverlap;
      layerSpacingParentOverlap = parseFloat(layerSpacingParentOverlap, 10);
      lay.layerSpacingParentOverlap = layerSpacingParentOverlap;

      var sorting = option.sorting == undefined ? "Forwards" : option.sorting;
      if (sorting === "Forwards") lay.sorting = go.TreeLayout.SortingForwards;
      else if (sorting === "Reverse")
        lay.sorting = go.TreeLayout.SortingReverse;
      else if (sorting === "Ascending")
        lay.sorting = go.TreeLayout.SortingAscending;
      else if (sorting === "Descending")
        lay.sorting = go.TreeLayout.SortingDescending;

      var compaction =
        option.compaction == undefined ? "Block" : option.compaction;
      if (compaction === "Block")
        lay.compaction = go.TreeLayout.CompactionBlock;
      else if (compaction === "None")
        lay.compaction = go.TreeLayout.CompactionNone;

      var breadthLimit =
        option.breadthLimit == undefined ? 0 : option.breadthLimit;
      breadthLimit = parseFloat(breadthLimit, 10);
      lay.breadthLimit = breadthLimit;

      var rowSpacing = option.rowSpacing == undefined ? 25 : option.rowSpacing;
      rowSpacing = parseFloat(rowSpacing, 10);
      lay.rowSpacing = rowSpacing;

      var rowIndent = option.rowIndent == undefined ? 10 : option.rowIndent;
      rowIndent = parseFloat(rowIndent, 10);
      lay.rowIndent = rowIndent;

      var setsPortSpot =
        option.setsPortSpot == undefined ? true : option.setsPortSpot;
      lay.setsPortSpot = setsPortSpot;

      var setsChildPortSpot =
        option.setsChildPortSpot == undefined ? true : option.setsChildPortSpot;
      lay.setsChildPortSpot = setsChildPortSpot;

      this.myDiagram.commitTransaction("change Layout");
      this.myDiagram.layout = $(go.Layout);
    },
    initNodeTemplate() {
      let _this = this;
      function mouseEnter(e, obj) {
        // 设置全部的node和link opacity 0.2
        let allNodes = _this.myDiagram.nodes;
        allNodes.each((node) => {
          node.opacity = 0.1;
        });
        let allLinks = _this.myDiagram.links;
        allLinks.each((node) => {
          node.opacity = 0.1;
        });
        // 设置关联的node和link的透明度为1
        obj.opacity = 1;
        obj.isShadowed = true;
        let links = obj.findLinksConnected();
        links.each((link) => {
          link.opacity = 1;
        });
        let nodes = obj.findNodesConnected();
        nodes.each((node) => {
          node.opacity = 1;
          node.isShadowed = true;
        });
      }
      function mouseLeave(e, obj) {
        let allNodes = _this.myDiagram.nodes;
        allNodes.each((node) => {
          node.opacity = 1;
          node.isShadowed = false;
        });
        let allLinks = _this.myDiagram.links;
        allLinks.each((node) => {
          node.opacity = 1;
        });
      }

      function mayWorkFor(node1, node2) {
        if (!(node2 instanceof go.Node)) return false; // must be a Node
        if (node1 === node2) return false; // cannot work for yourself
        return true;
      }
      // 节点
      this.myDiagram.nodeTemplate = $(
        go.Node,
        "Vertical",
        {
          locationSpot: go.Spot.Center,
          contextMenu: this.myContextMenu,
          selectionAdorned: false,
          mouseEnter: mouseEnter,
          mouseLeave: mouseLeave,
          shadowOffset: new go.Point(3, 3),
          shadowBlur: 20,
        },
        new go.Binding("layerName"),
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(
          go.Point.stringify
        ),
        $(
          go.Panel,
          "Auto",
          $(
            go.Shape,
            "Circle",
            {
              name: "SHAPE",
              portId: "",
              strokeWidth: _this.defaultNodeStrokeWidth,
            },
            new go.Binding("fill", "bkColor").makeTwoWay(),
            new go.Binding("stroke", "strokeColor").makeTwoWay()
          ),
          $(
            go.Picture,
            {
              width: 32,
              height: 32,
              name: "GRAPHPICTURE",
            },
            new go.Binding("source", "img").makeTwoWay()
          )
        ),
        $(
          go.TextBlock,
          { margin: 8, name: "TEXT", editable: true },
          new go.Binding("text", "text", function (val) {
            return val.trim();
          }),
          new go.Binding("stroke", "nodeTextColor").makeTwoWay()
        ),
        {
          click: function (e, obj) {
            console.log(obj);
            let entity = _this.calculateEntityInfo(obj);
            _this.$store.commit("ShowTable/UPDATE_ENTITY", entity);
            _this.$store.commit("ShowTable/ADD_OR_REMOVE_RIGHT_TAB", {
              componentName: "entity-view",
              action: "add",
            });
          },
          selectionChanged: function (obj) {
            obj.layerName = obj.isSelected ? "Foreground" : "";
            var textObj = obj.findObject("TEXT");
            textObj.background = obj.isSelected
              ? _this.selectedStrokeColor
              : "transparent";
            textObj.stroke = obj.isSelected
              ? _this.selectedTextColor
              : _this.defaultNodeTextColor;
          },
          mouseDragEnter: function (e, node, prev) {
            var shape = node.findObject("SHAPE");
            if (shape) {
              shape._prevFill = shape.fill; // remember the original brush
              shape.fill = "darkred";
            }
          },
          mouseDragLeave: function (e, node, next) {
            var shape = node.findObject("SHAPE");
            if (shape && shape._prevFill) {
              shape.fill = shape._prevFill; // restore the original brush
            }
          },
          mouseDrop: function (e, node) {
            var diagram = node.diagram;
            var selection = diagram.selection;
            if (mayWorkFor(selection, node)) {
              let groupKey = uuid.v1();
              diagram.startTransaction("make new group");
              diagram.model.addNodeData({
                key: groupKey,
                isGroup: true,
                text: node.data.text,
              });
              diagram.commitTransaction("make new group");
              let group = diagram.findNodeForKey(groupKey);
              group.addMembers(selection);
              var desSet = new go.Set();
              desSet.add(node);
              group.addMembers(desSet);
            }
          },
        }
      );
    },
    initLinkTemplate() {
      let _this = this;
      let linkType = null;
      if (this.tableData.tableType === "dataVisible") {
        linkType = ParallelRouteLink;
      } else if (this.tableData.tableType === "zjctGraph") {
        linkType = go.Link; // the whole link panel
      } else {
        linkType = ParallelRouteLink;
      }
      this.myDiagram.linkTemplate = $(
        linkType,
        {
          shadowOffset: new go.Point(3, 3),
          shadowBlur: 20,
          curve:
            _this.tableData.tableType === "zjctGraph"
              ? go.Link.Bezier
              : go.Link.Normal,
          toShortLength: 8,
          selectionAdorned: false,
        },
        new go.Binding("toShortLength", "strokeWidth", function (val) {
          return 8 + val * _this.defaultLineStrokeWidth;
        }),
        $(
          go.Shape,
          {
            isPanelMain: true,
            stroke: "transparent",
            strokeWidth: 8,
          },
          new go.Binding("strokeWidth", "strokeWidth", function (val) {
            return val * 2;
          })
        ),
        $(
          go.Shape,
          {
            isPanelMain: true,
            strokeWidth: _this.defaultLineStrokeWidth,
            name: "SHAPE1",
          },
          new go.Binding("strokeWidth", "strokeWidth", function (val) {
            return val * _this.defaultLineStrokeWidth;
          }),
          new go.Binding("stroke", "stroke")
        ),
        $(
          go.Shape,
          { toArrow: "Standard", name: "SHAPE2" },
          new go.Binding("stroke", "stroke"),
          new go.Binding("fill", "stroke"),
          new go.Binding("scale", "strokeWidth", function (val) {
            return (
              _this.defaultLineStrokeWidth +
              (val * _this.defaultLineStrokeWidth) / 9
            );
          })
        ),
        $(
          go.Panel,
          "Auto", // this whole Panel is a link label
          $(go.Shape, "Rectangle", {
            fill: "white",
            stroke: "transparent",
          }),
          $(
            go.TextBlock,
            { margin: 3, name: "TEXT", editable: true },
            new go.Binding("text", "text"),
            new go.Binding("stroke", "stroke")
          )
        ),
        {
          click: function (e, obj) {
            console.log(obj);
            let linkEntity = _this.calculateLinkInfo(obj);
            console.log(linkEntity);
            _this.$store.commit("ShowTable/UPDATE_LINK_ENTITY", linkEntity);
            _this.$store.commit("ShowTable/ADD_OR_REMOVE_RIGHT_TAB", {
              componentName: "link-view",
              action: "add",
            });
          },
          mouseEnter: function (e, link) {
            // link.isShadowed = true;
          },
          mouseLeave: function (e, link) {
            // link.isShadowed = false;
          },
          selectionChanged: function (obj) {
            let textObj = obj.findObject("TEXT");
            if (obj.isSelected) {
              textObj._bkColor = textObj.background;
              textObj._stroke = textObj.stroke;
            }
            textObj.background = obj.isSelected
              ? _this.selectedStrokeColor
              : textObj._bkColor;
            textObj.stroke = obj.isSelected
              ? _this.selectedTextColor
              : textObj._stroke;
          },
        }
      );
    },
    initGroupTemplate() {
      let _this = this;
      function mayWorkFor(node1, node2) {
        if (node1 === node2) return false; // cannot work for yourself
        if (node2 instanceof go.Group) {
          return true; // must be a Node and a group
        }
        return false;
      }
      this.myDiagram.groupTemplate = $(
        go.Group,
        "Auto",
        {
          resizable: true,
          contextMenu: this.myContextMenu,
          selectionAdorned: false,
          shadowOffset: new go.Point(3, 3),
          shadowBlur: 40,
          handlesDragDropForMembers: true,
          // layout: $(go.TreeLayout, {
          //   angle: 90,
          //   arrangement: go.TreeLayout.ArrangementHorizontal,
          //   isRealtime: false,
          // }),
        },
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(
          go.Point.stringify
        ),
        $(
          go.Shape,
          "Rectangle", // surrounds everything
          {
            name: "SHAPE",
            parameter1: 10,
            fill: _this.defaultNodeStrokeColor,
            stroke: _this.defaultNodeStrokeColor,
          }
        ),
        $(
          go.Panel,
          "Vertical", // position header above the subgraph
          { defaultAlignment: go.Spot.Left },
          $(
            go.Panel,
            "Horizontal", // the header
            { defaultAlignment: go.Spot.Top },
            $("SubGraphExpanderButton"), // this Panel acts as a Button
            $(
              go.TextBlock, // group title near top, next to button
              { font: "Bold 12pt Sans-Serif", stroke: "white", editable: true },
              new go.Binding("text", "text").makeTwoWay()
            )
          ),
          $(
            go.Placeholder, // represents area for all member parts
            {
              padding: new go.Margin(0, 10),
              background: _this.defaultNodeFillColor,
            }
          )
        ),
        {
          click: function (e, obj) {
            let comboentityList = [];
            let allNodes = [];
            let allEdges = [];
            _this.travelCombo(comboentityList, obj, allNodes, allEdges);
            console.log(comboentityList, obj, allNodes, allEdges);
            // 给所有边去重复
            allEdges = _this.$lodash.uniqWith(allEdges, _this.$lodash.isEqual);
            let zuNeiNodeCount = allNodes.length; // 组内成员数量
            let zuNeiJjze = 0; // 组内交易总额
            let zuNeiJjbs = 0; // 组内交易笔数
            let zuNeiDuiWaiJjze = 0; // 组内对外交易总额
            let zuNeiDuiWaiJjbs = 0; // 组内对外交易笔数
            let zuNeiDuiWaiJjChaE = 0;
            function belongsToNodes(key) {
              for (let node of allNodes) {
                if (node.data.key === key) {
                  return true;
                }
              }
              return false;
            }

            for (let edge of allEdges) {
              let modelData = edge.data;
              let sourceId = modelData.from;
              let targetId = modelData.to;
              if (belongsToNodes(sourceId) && belongsToNodes(targetId)) {
                zuNeiJjze = new Decimal(zuNeiJjze).add(
                  new Decimal(modelData.je)
                );
                zuNeiJjbs = new Decimal(zuNeiJjbs).add(
                  new Decimal(modelData.bs)
                );
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
            _this.$store.commit("ShowTable/UPDATE_COMBO_ENTITY_LIST", {
              comboName: obj.data.text,
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
            _this.$store.commit("ShowTable/ADD_OR_REMOVE_RIGHT_TAB", {
              componentName: "combo-entity-list-view",
              action: "add",
            });
          },
          selectionChanged: function (obj) {
            var shape = obj.findObject("SHAPE");
            shape.stroke = obj.isSelected
              ? _this.selectedStrokeColor
              : _this.defaultNodeStrokeColor;
          },
          mouseEnter: function (e, obj) {
            obj.isShadowed = true;
          },
          mouseLeave: function (e, obj) {
            obj.isShadowed = false;
          },
          mouseDragEnter: function (e, node, prev) {
            var shape = node.findObject("SHAPE");
            if (shape) {
              shape._prevFill = shape.fill; // remember the original brush
              shape.fill = "darkred";
            }
          },
          mouseDragLeave: function (e, node, next) {
            var shape = node.findObject("SHAPE");
            if (shape && shape._prevFill) {
              shape.fill = shape._prevFill; // restore the original brush
            }
          },
          mouseDrop: function (e, group) {
            var diagram = group.diagram;
            var selection = diagram.selection; // assume just one Node in selection
            if (mayWorkFor(selection, group)) {
              group.addMembers(selection);
            }
          },
        }
      );
    },
    haveGroupList() {
      this.allGroupList = [];
      let allNodes = this.myDiagram.nodes;
      allNodes.each((node) => {
        if (node instanceof go.Group) {
          this.allGroupList.push(node.data);
        }
      });
      console.log(this.allGroupList);
      return this.allGroupList.length > 0;
    },
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
          if (jinE >= preValue && jinE <= value) {
            return item.selected ? item.color : "";
          }
          if (jinE >= value && jinE <= nextValue) {
            return nextItem.selected ? nextItem.color : "";
          }
        }
      }
    },

    makeData() {
      // 数据可视化
      if (this.tableData.tableType === "dataVisible") {
        return this.makeDataVisible();
      } else if (this.tableData.tableType === "zjctGraph") {
        // 资金透视模型图
        return this.makeDataZjCt();
      } else {
        // 其他发现模型
        return this.makeDataNormal();
      }
    },
    makeDataZjCt() {
      let nodes = this.tableData.originGraphData.nodes.map((node) => {
        let {
          CardNo,
          FieldName,
          IdentityNo,
          IsRoot,
          UniqueKey,
          Username,
        } = node;
        return {
          key: UniqueKey,
          kh: CardNo,
          name: Username,
          text: CardNo + "\n" + Username,
        };
      });
      let links = [];
      this.tableData.originGraphData.links.forEach((link) => {
        let {
          source,
          target,
          tradeMoney,
          tradeTime,
          tradeCount,
          dataType,
        } = link;
        let lineColor = this.calculateLineColorByJinE(tradeMoney);
        if (lineColor !== "") {
          links.push({
            dataType,
            from: source,
            to: target,
            je: tradeMoney,
            bs: parseInt(tradeCount),
            rq: tradeTime,
            text:
              dataType === 0
                ? `${tradeMoney}元（${tradeTime}）`
                : `${tradeMoney}元（${tradeCount}笔）`,

            stroke: lineColor,
          });
        }
      });
      nodes.forEach((node) => {
        node.loc = "0 0";
        node.img = "/static/images/icons/银行卡.png";
        node.bkColor = this.defaultNodeFillColor;
        node.strokeColor = this.defaultNodeStrokeColor;
        node.nodeTextColor = this.defaultNodeTextColor;
      });
      links.forEach((link) => {
        link.strokeWidth = this.defaultLineStrokeWidth;
      });
      return { nodes, links };
    },

    makeDataNormal() {
      switch (this.tableData.tid) {
        case 202:
          return this.makeData202();
          break;
        case 203:
          return this.makeData203();
          break;
        case 213:
          return this.makeData213();
          break;
        case 218:
          return this.makeData218();
          break;
        default:
          return { nodes: [], links: [] };
          break;
      }
    },
    makeData218() {
      let nodes = [];
      let links = [];
      this.tableData.allrows.forEach((row) => {
        let jymc = row["jymc"];
        let jydfmc = row["jydfmc"];
        let czje = parseFloat(row["czje"]);
        let czbs = parseInt(row["czbs"]);
        let jzje = parseFloat(row["jzje"]);
        let jzbs = parseInt(row["jzbs"]);
        let jyzje = parseInt(row["jyzje"]);
        let jyzbs = parseInt(row["jyzbs"]);
        let data1 = {
          key: jymc,
          kh: jymc,
          name: jymc,
          text: jymc,
          tid: this.tableData.tid, //tableid
        };
        let data2 = {
          key: jydfmc,
          kh: jydfmc,
          name: jydfmc,
          text: jydfmc,
          tid: this.tableData.tid,
        };
        let bFindData1 = false;
        let bFindData2 = false;
        for (let item of nodes) {
          if (item.key === data1.key) {
            bFindData1 = true;
            break;
          }
        }
        if (!bFindData1) nodes.push(data1);
        for (let item of nodes) {
          if (item.key === data2.key) {
            bFindData2 = true;
            break;
          }
        }
        if (!bFindData2) nodes.push(data2);
      });
      return { nodes, links };
    },
    makeData213() {
      // 重点交易对手团伙发现：参数 金额，笔数。参数可设置团伙分类 以 主体名称（JYMCGROUP），证件号码（JYZJHMGROUP），卡号（CXKHGROUP） 划分
      let nodes = [];
      let links = [];
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
          key: jymc,
          name: jymc,
          text: jymc,
          tid: this.tableData.tid, //tableid
        };
        let data2 = {
          key: jydfmc,
          name: jydfmc,
          text: jydfmc,
          tid: this.tableData.tid,
        };
        let bFindData1 = false;
        let bFindData2 = false;
        for (let item of nodes) {
          if (item.key === data1.key) {
            bFindData1 = true;
            break;
          }
        }
        if (!bFindData1) nodes.push(data1);
        for (let item of nodes) {
          if (item.key === data2.key) {
            bFindData2 = true;
            break;
          }
        }
        if (!bFindData2) nodes.push(data2);

        // 画线
        let templinks = [];
        if (czje > 0) {
          let lineColor = this.calculateLineColorByJinE(czje);
          let link1 = {
            tid: this.tableData.tid,
            from: jymc,
            to: jydfmc,
            je: czje,
            bs: czbs,
            text: `${czje}元（${czbs}笔）`,
            stroke: lineColor,
          };
          if (lineColor !== "") templinks.push(link1);
        }
        if (jzje > 0) {
          let lineColor = this.calculateLineColorByJinE(jzje);
          let link2 = {
            tid: this.tableData.tid,
            from: jydfmc,
            to: jymc,
            je: jzje,
            bs: jzbs,
            text: `${jzje}元（${jzbs}笔）`,
            stroke: lineColor,
          };
          if (lineColor !== "") templinks.push(link2);
        }
        if (templinks.length > 0) {
          links.push(...templinks);
        }
      });
      nodes.forEach((node) => {
        node.loc = "0 0";
        node.img = "/static/images/icons/银行卡.png";
        node.bkColor = this.defaultNodeFillColor;
        node.strokeColor = this.defaultNodeStrokeColor;
        node.nodeTextColor = this.defaultNodeTextColor;
      });
      links.forEach((link) => {
        link.strokeWidth = this.defaultLineStrokeWidth;
      });
      return { nodes, links };
    },
    makeData203() {
      let nodes = [];
      let links = [];
      this.tableData.allrows.forEach((row) => {
        let jymc = row["jymc"];
        let jydfmc = row["jydfmc"];
        let czje = parseFloat(row["czje"]);
        let czbs = parseInt(row["czbs"]);
        let jzje = parseFloat(row["jzje"]);
        let jzbs = parseInt(row["jzbs"]);
        let jyzje = parseInt(row["jyzje"]);
        let jyzbs = parseInt(row["jyzbs"]);
        let data1 = {
          key: jymc,
          kh: jymc,
          name: jymc,
          text: jymc,
          tid: this.tableData.tid, //tableid
        };
        let data2 = {
          key: jydfmc,
          kh: jydfmc,
          name: jydfmc,
          text: jydfmc,
          tid: this.tableData.tid,
        };
        let bFindData1 = false;
        let bFindData2 = false;
        for (let item of nodes) {
          if (item.key === data1.key) {
            bFindData1 = true;
            break;
          }
        }
        if (!bFindData1) nodes.push(data1);
        for (let item of nodes) {
          if (item.key === data2.key) {
            bFindData2 = true;
            break;
          }
        }
        if (!bFindData2) nodes.push(data2);

        // 画线
        let templinks = [];
        if (czje > 0) {
          let lineColor = this.calculateLineColorByJinE(czje);
          let link1 = {
            tid: this.tableData.tid,
            from: jymc,
            to: jydfmc,
            je: czje,
            bs: czbs,
            text: `${czje}元（${czbs}笔）`,
            stroke: lineColor,
          };
          if (lineColor !== "") templinks.push(link1);
        }
        if (jzje > 0) {
          let lineColor = this.calculateLineColorByJinE(jzje);
          let link2 = {
            tid: this.tableData.tid,
            from: jydfmc,
            to: jymc,
            je: jzje,
            bs: jzbs,
            text: `${jzje}元（${jzbs}笔）`,
            stroke: lineColor,
          };
          if (lineColor !== "") templinks.push(link2);
        }
        if (templinks.length > 0) {
          links.push(...templinks);
        }
      });
      nodes.forEach((node) => {
        node.loc = "0 0";
        node.img = "/static/images/icons/银行卡.png";
        node.bkColor = this.defaultNodeFillColor;
        node.strokeColor = this.defaultNodeStrokeColor;
        node.nodeTextColor = this.defaultNodeTextColor;
      });
      links.forEach((link) => {
        link.strokeWidth = this.defaultLineStrokeWidth;
      });
      return { nodes, links };
    },
    makeData202() {
      let nodes = [];
      let links = [];
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
          key: cxkh + "\n" + jymc,
          kh: cxkh,
          name: jymc,
          text: cxkh + "\n" + jymc,
        };
        let data2 = {
          tid: this.tableData.tid,
          key: jydfzkh + "\n" + jydfmc,
          kh: jydfzkh,
          name: jydfmc,
          text: jydfzkh + "\n" + jydfmc,
        };
        let bFindData1 = false;
        let bFindData2 = false;
        for (let item of nodes) {
          if (item.key === data1.key) {
            bFindData1 = true;
            break;
          }
        }
        if (!bFindData1) nodes.push(data1);

        for (let item of nodes) {
          if (item.key === data2.key) {
            bFindData2 = true;
            break;
          }
        }
        if (!bFindData2) nodes.push(data2);
        // 画线
        let templinks = [];
        if (czje > 0) {
          let lineColor = this.calculateLineColorByJinE(czje);
          let link1 = {
            tid: this.tableData.tid,
            from: cxkh + "\n" + jymc,
            to: jydfzkh + "\n" + jydfmc,
            je: czje,
            bs: czbs,
            text: `${czje}元（${czbs}笔）`,
            stroke: lineColor,
          };
          if (lineColor !== "") templinks.push(link1);
        }
        if (jzje > 0) {
          let lineColor = this.calculateLineColorByJinE(jzje);
          let link2 = {
            tid: this.tableData.tid,
            from: jydfzkh + "\n" + jydfmc,
            to: cxkh + "\n" + jymc,
            je: jzje,
            bs: jzbs,
            text: `${jzje}元（${jzbs}笔）`,
            stroke: lineColor,
          };
          if (lineColor !== "") templinks.push(link2);
        }
        links.push(...templinks);
      });
      nodes.forEach((node) => {
        node.loc = "0 0";
        node.img = this.defaultImg;
        node.bkColor = this.defaultNodeFillColor;
        node.strokeColor = this.defaultNodeStrokeColor;
        node.nodeTextColor = this.defaultNodeTextColor;
      });
      links.forEach((link) => {
        link.strokeWidth = this.defaultLineStrokeWidth;
      });
      return { nodes, links };
    },

    handleClickTest() {
      let jsonStr = this.myDiagram.model.toJson();
      console.log(jsonStr);
    },
    // 遍历一个combo，并获取tree结构,并获取所有的nodes和所有的nodes关联的edges
    travelCombo(root, groupObj, allNodes, allEdges) {
      // combo.getChildren()返回的结果中的nodes有bug，拖动一次新增一个
      let comboName = groupObj.data.text;
      let comboChildren = groupObj.memberParts;
      let comboId = groupObj.data.key;
      let children = [];
      let obj = {
        label: comboName,
        id: comboId,
        type: "combo",
        children,
      };
      root.push(obj);

      comboChildren.each((part) => {
        if (part instanceof go.Node && !(part instanceof go.Group)) {
          let node = this.myDiagram.findNodeForKey(part.key);
          allNodes.push(node);
          let edges = node.findLinksConnected();
          edges.each((edge) => allEdges.push(edge));
          children.push({
            label: node.data.name,
            id: node.data.key,
            itemData: node.data,
            type: "node",
          });
        } else if (part instanceof go.Group) {
          let combo = this.myDiagram.findNodeForKey(part.key);
          this.travelCombo(obj.children, combo, allNodes, allEdges);
        }
      });
    },
    cxcommand(type, item) {
      var diagram = this.myDiagram;
      let selection = diagram.selection;
      switch (type) {
        // case "cut":
        //   diagram.commandHandler.cutSelection();
        //   break;
        // case "copy":
        //   diagram.commandHandler.copySelection();
        //   break;
        // case "paste":
        //   diagram.commandHandler.pasteSelection(
        //     diagram.toolManager.contextMenuTool.mouseDownPoint
        //   );
        //   break;
        // case "delete":
        //   diagram.commandHandler.deleteSelection();
        //   break;
        case "makeGroup":
          {
            let groupKey = uuid.v1();
            diagram.startTransaction("make new group");
            diagram.model.addNodeData({
              key: groupKey,
              isGroup: true,
              text: selection.first().data.text,
            });
            diagram.commitTransaction("make new group");
            let group = diagram.findNodeForKey(groupKey);
            group.addMembers(selection);
          }

          break;
        case "unGroup":
          {
            let group = selection.first();
            diagram.startTransaction("unGroup");
            group.memberParts.each((part) => {
              diagram.model.setDataProperty(part.data, "group", "");
            });
            diagram.commitTransaction("unGroup");
            diagram.remove(group);
          }
          break;
        case "removeFromGroup":
          {
            console.log("removeFromGroup");
            diagram.startTransaction("removeFromGroup");
            selection.each((part) => {
              if (part instanceof go.Node) {
                diagram.model.setDataProperty(part.data, "group", "");
              }
            });
            diagram.commitTransaction("removeFromGroup");
          }
          break;
        case "addToGroup":
          {
            let group = diagram.findNodeForKey(item.key);
            selection.each((part) => {
              if (part.data.key !== item.key) {
                let tempSet = new go.Set();
                tempSet.add(part);
                group.addMembers(tempSet);
              }
            });
          }
          break;
        case "selectRelatedNodes":
          {
            var list = new go.List();
            // 把已经选中的加进来
            selection.each((n) => list.add(n));
            list.add(this.currentRightNode);
            let nodes = this.currentRightNode.findNodesConnected();
            nodes.each((n) => list.add(n));
            // diagram.selectCollection(list);
            list.each((node) => {
              node.isSelected = true;
            });
            diagram.focus();
            return;
          }
          break;
      }
      diagram.clearSelection();
      diagram.currentTool.stopTool();
    },
    allNodesToFront() {
      this.myDiagram.nodes.each((node) => {
        if (node instanceof go.Group || node instanceof go.Link) {
        } else {
          node.layerName = "Foreground";
        }
      });
      console.log("allNodesToFront");
    },
    onUpdateNodesState({ graphid, nodeid, state }) {
      if (graphid === this.graphid) {
        let part = this.myDiagram.findNodeForKey(nodeid);
        if (state === "clear") {
          this.myDiagram.clearSelection();
        } else {
          let set = new go.List();
          set.add(part);
          this.myDiagram.selectCollection(set);
        }
      }
    },
    calculateLinkInfo(link) {
      let linkModel = link.data;
      let fromNode = this.myDiagram.findNodeForKey(link.data.from);
      let toNode = this.myDiagram.findNodeForKey(link.data.to);
      let linkData = [
        {
          title: "源节点",
          ename: "from",
          describe: fromNode.data.text,
        },
        {
          ename: "to",
          title: "目标节点",
          describe: toNode.data.text,
        },
        {
          ename: "je",
          title: "金额(元)",
          describe: linkModel.je,
        },
      ];
      if (linkModel.hasOwnProperty("dataType") && linkModel.dataType === 0) {
        linkData.push({
          ename: "rq",
          title: "日期",
          describe: linkModel.rq,
        });
        let obj = {
          linkid: link.key,
          linkData,
          dataType: linkModel.dataType,
        };
        return obj;
      } else {
        linkData.push({
          ename: "bs",
          title: "笔数",
          describe: linkModel.bs,
        });
        let obj = {
          linkid: link.key,
          linkData,
        };
        return obj;
      }
    },
    calculateEntityInfo(node) {
      let nodeModel = node.data;
      let edges = node.findLinksConnected();
      let jyEdgeCount = 0;
      let czjeTotal = 0;
      let czbsTotal = 0;
      let jzjeTotal = 0;
      let jzbsTotal = 0;
      let jcchae = 0; //进出帐差额
      let jczongbs = 0;
      edges.each((edge) => {
        let edgeModel = edge.data;
        jyEdgeCount++;
        if (edgeModel.to === nodeModel.key) {
          jzjeTotal = new Decimal(jzjeTotal).add(new Decimal(edgeModel.je));
          jzbsTotal += edgeModel.bs;
        } else {
          czjeTotal = new Decimal(czjeTotal).add(new Decimal(edgeModel.je));
          czbsTotal += edgeModel.bs;
        }
      });
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
          describe: jyEdgeCount,
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
          title: "出账总金额",
          describe: czjeTotal,
        },
        {
          title: "出账总笔数",
          describe: czbsTotal,
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
          describe: nodeModel.img,
        },
        {
          title: "节点背景色",
          describe: nodeModel.bkColor,
        },
        {
          title: "节点边框色",
          describe: nodeModel.strokeColor,
        },
        // {
        //   title: "节点标签色",
        //   describe: nodeModel.nodeTextColor,
        // },
      ];
      let obj = {
        nodeid: nodeModel.key,
        nodeStyle,
        entityTableData,
      };
      return obj;
    },
    onClickNode(data) {
      console.log(data);
      let { graphid, nodeid } = data;
      if (graphid !== this.graphid) return;
      let node = this.myDiagram.findNodeForKey(nodeid);
      console.log(node);
      let entity = this.calculateEntityInfo(node);
      console.log({ entity });
      this.$store.commit("ShowTable/UPDATE_ENTITY", entity);
      this.$store.commit("ShowTable/ADD_OR_REMOVE_RIGHT_TAB", {
        componentName: "entity-view",
        action: "add",
      });
    },
    onNodeStyleSetting(data) {
      console.log({ data });
      let { graphid, nodeid, nodeStyle } = data;
      if (graphid !== this.graphid) return;
      let node = this.myDiagram.findNodeForKey(nodeid);
      let nodeModel = node.data;
      switch (nodeStyle.title) {
        case "节点图标":
          this.myDiagram.startTransaction("modify");
          this.myDiagram.model.setDataProperty(
            nodeModel,
            "img",
            nodeStyle.describe
          );
          this.myDiagram.commitTransaction("modify");
          break;
        case "节点背景色":
          this.myDiagram.startTransaction("modify");
          this.myDiagram.model.setDataProperty(
            nodeModel,
            "bkColor",
            nodeStyle.describe
          );
          this.myDiagram.commitTransaction("modify");
          break;
        case "节点边框色":
          this.myDiagram.startTransaction("modify");
          this.myDiagram.model.setDataProperty(
            nodeModel,
            "strokeColor",
            nodeStyle.describe
          );
          this.myDiagram.commitTransaction("modify");
          break;
        case "节点标签色":
          nodeModel.labelCfg.style.fill = nodeStyle.describe;
          this.graph.updateItem(nodeid, nodeModel);
          break;
      }
    },
    async OnSavePicture(data) {
      console.log(data);
      let { graphid } = data;
      if (graphid !== this.graphid) return;
      let pngName = `案件${this.caseBase.ajmc}-${this.tableData.title}.png`;
      let result = await this.$electron.remote.dialog.showSaveDialog({
        title: "请选择要保存的文件名",
        buttonLabel: "保存",
        defaultPath: pngName,
        filters: [{ name: "图片", extensions: ["png"] }],
      });
      if (result.canceled) {
        return;
      }
      var d = this.myDiagram.documentBounds;
      var halfWidth = Math.ceil(d.width);
      var halfHeight = Math.ceil(d.height);
      var img = this.myDiagram.makeImage({
        scale: 1,
        maxSize: new go.Size(Infinity, Infinity),
        size: new go.Size(halfWidth, halfHeight),
        background: "rgba(255, 255, 255, 255)",
      });
      var base64Data = img.src.replace(/^data:image\/\w+;base64,/, "");
      var dataBuffer = new Buffer(base64Data, "base64"); // 解码图片
      const fs = require("fs");
      fs.writeFileSync(result.filePath, dataBuffer);
      // var a = document.createElement("a");
      // a.style = "display: none";
      // a.href = img.src;
      // a.download = pngName;
      // a.click();
      // window.URL.revokeObjectURL(img.src);
    },
    onSaveGraphData(data) {
      let { graphid } = data;
      if (graphid !== this.graphid) return;
      // 包含nodes，edges，combos
      let relationGraphData = this.myDiagram.model.toJson();
      console.log(relationGraphData);
      this.$store.commit("ShowTable/SAVE_GRAPHDATA", {
        graphid,
        relationGraphData,
      });
    },
    onFindShortLink(data) {
      let { graphid } = data;
      if (graphid !== this.graphid) return;
      let selection = this.myDiagram.selection;
      let nodeCount = 0;
      let firstObj = null;
      let lastObj = null;
      let it = selection.iterator;
      while (it.next()) {
        if (it.value instanceof go.Node) {
          nodeCount++;
          if (!firstObj) firstObj = it.value;
          lastObj = it.value;
        }
      }
      if (nodeCount === 2) {
        let path = Tools.findShortestPath(firstObj, lastObj, false);
        if (path.count <= 1) {
          this.$message({
            message: "选取的两个节点没有连接路径。",
          });
          return;
        }
        this.highlightPath(path);
        this.$message({
          type: "success",
          message: "最短路径获取成功，并以标记。",
        });
      } else {
        this.$message({
          message: "选择的节点不合法，仅当选择两点方可计算路径。",
        });
      }
    },
    // Highlight a particular path, a List of Nodes.
    highlightPath(path) {
      this.myDiagram.clearHighlighteds();
      for (var i = 0; i < path.count - 1; i++) {
        var f = path.get(i);
        let fromNode = this.myDiagram.findNodeForKey(f.data.key);
        fromNode.isSelected = true;
        var t = path.get(i + 1);
        let toNode = this.myDiagram.findNodeForKey(t.data.key);
        toNode.isSelected = true;
        f.findLinksTo(t).each(function (l) {
          l.isSelected = true;
        });
      }
    },
    dagreLayout() {
      this.myDiagram.layout = $(go.LayeredDigraphLayout, {
        direction: 90,
        layerSpacing: 60,
      });
    },
    onSwitchLayout(data) {
      let { graphid, layout } = data;
      if (graphid !== this.graphid) return;
      switch (layout) {
        case "random": // 随机
          this.randomLayout();
          break;
        case "dagre": //层次
          this.dagreLayout();
          break;
        case "circular": // 圆形
          this.CircularLayout();
          break;
        case "grid": // 网格
          this.GridLayout();
          break;
        case "fruchterman":
          this.ForceDirectedLayout();
          break;
        case "force":
          // 组织结构布局
          this.func1();
          break;
      }
      this.updateEntityList();
      this.accordingXianKuanRefreshEdges(this.tableData.xianKuanSetting);
      this.myDiagram.commandHandler.zoomToFit();
      this.$store.commit("ShowTable/SWITCH_GRAPH_LAYOUT_TYPE", layout);
    },
    init() {
      this.tempgraphicMoneySectionStrMd5 = md5(
        JSON.stringify(this.tableData.graphicMoneySectionList)
      );
      this.initDiagram();
      this.initOverView();
      this.initNodeTemplate();
      if (this.tableData.hasOwnProperty("relationGraphData")) {
        this.myDiagram.model = go.Model.fromJson(
          this.tableData.relationGraphData
        );
      } else {
        let { nodes, links } = this.makeData();
        console.log({ nodes, links });
        let gm = new go.GraphLinksModel(nodes, links);
        gm.linkKeyProperty = "panda";
        // gm.linkKeyProperty = function (a, b) {
        //   return uuid.v1();
        // };
        // gm.makeUniqueLinkKeyFunction = function (a, b) {
        //   return uuid.v1();
        // };
        this.myDiagram.model = gm;
        this.onSwitchLayout({ graphid: this.graphid, layout: "grid" });
        // this.ForceDirectedLayout();
      }
      this.initLinkTemplate();
      this.initGroupTemplate();
      this.accordingSpreadNodeSwitchRefreshNodes();
      this.updateEntityList();
      this.switchAllowScroll();
      this.myDiagram.commandHandler.zoomToFit();
      this.allNodesToFront();
      console.log("init completed...");
    },

    makeDataVisible() {
      switch (this.tableData.tid) {
        case 202:
          return this.makeDataVisible202();
          break;
        case 203:
          return this.makeDataVisible203();
          break;
        case 204:
          return this.makeDataVisible204();
          break;
        default:
          return { nodes: [], links: [] };
      }
    },
    makeDataVisible204() {
      let nodes = [];
      let links = [];
      this.tableData.allrows.forEach((row) => {
        let jymc = row["jymc"];
        let jydfmc = row["jydfmc"];
        let jyzjhm = row["jyzjhm"];
        let jydfzjhm = row["jydfzjhm"];
        let czje = parseFloat(row["czje"]);
        let czbs = parseInt(row["czbs"]);
        let jzje = parseFloat(row["jzje"]);
        let jzbs = parseInt(row["jzbs"]);
        let jyzje = parseInt(row["jyzje"]);
        let jyzbs = parseInt(row["jyzbs"]);
        let jczce = parseFloat(row["jczce"]);
        let data1 = {
          key: jymc + "\n" + jyzjhm,
          name: jymc,
          text: jymc + "\n" + jyzjhm,
          tid: this.tableData.tid, //tableid
        };
        let data2 = {
          key: jydfmc + "\n" + jydfzjhm,
          name: jydfmc,
          text: jydfmc + "\n" + jydfzjhm,
          tid: this.tableData.tid,
        };
        let bFindData1 = false;
        let bFindData2 = false;
        for (let item of nodes) {
          if (item.key === data1.key) {
            bFindData1 = true;
            break;
          }
        }
        if (!bFindData1) nodes.push(data1);
        for (let item of nodes) {
          if (item.key === data2.key) {
            bFindData2 = true;
            break;
          }
        }
        if (!bFindData2) nodes.push(data2);

        // 画线
        let tempEdges = [];
        if (this.tableData.selectShowTypeValue === "1") {
          if (czje > 0) {
            let lineColor = this.calculateLineColorByJinE(czje);
            let link1 = {
              tid: this.tableData.tid,
              from: jymc + "\n" + jyzjhm,
              to: jydfmc + "\n" + jydfzjhm,
              je: czje,
              bs: czbs,
              text: `${czje}元（${czbs}笔）`,
              stroke: lineColor,
            };
            if (lineColor !== "") tempEdges.push(link1);
          }
          if (jzje > 0) {
            let lineColor = this.calculateLineColorByJinE(jzje);
            let link2 = {
              tid: this.tableData.tid,
              from: jydfmc + "\n" + jydfzjhm,
              to: jymc + "\n" + jyzjhm,
              je: jzje,
              bs: jzbs,
              text: `${jzje}元（${jzbs}笔）`,
              stroke: lineColor,
            };
            if (lineColor !== "") tempEdges.push(link2);
          }
        } else {
          if (jczce !== 0) {
            let lineColor = this.calculateLineColorByJinE(jczce);
            let link2 = {
              tid: this.tableData.tid,
              from: jydfmc + "\n" + jydfzjhm,
              to: jymc + "\n" + jyzjhm,
              je: jczce,
              bs: jyzbs,
              text: `净${jczce}元（${jyzbs}笔）`,
              stroke: lineColor,
            };
            if (lineColor !== "") tempEdges.push(link2);
          }
        }

        if (tempEdges.length > 0) {
          links.push(...tempEdges);
        }
      });
      nodes.forEach((node) => {
        node.loc = "0 0";
        node.img = this.tableData.imgSrc;
        node.bkColor = this.defaultNodeFillColor;
        node.strokeColor = this.defaultNodeStrokeColor;
        node.nodeTextColor = this.defaultNodeTextColor;
      });
      links.forEach((link) => {
        link.strokeWidth = this.defaultLineStrokeWidth;
      });
      return { nodes, links };
    },
    makeDataVisible203() {
      let nodes = [];
      let links = [];
      this.tableData.allrows.forEach((row) => {
        let jymc = row["jymc"];
        let jydfmc = row["jydfmc"];
        let czje = parseFloat(row["czje"]);
        let czbs = parseInt(row["czbs"]);
        let jzje = parseFloat(row["jzje"]);
        let jzbs = parseInt(row["jzbs"]);
        let jyzje = parseInt(row["jyzje"]);
        let jyzbs = parseInt(row["jyzbs"]);
        let jczce = parseFloat(row["jczce"]); // 进出帐差额
        let data1 = {
          key: jymc,
          kh: jymc,
          name: jymc,
          text: jymc,
          tid: this.tableData.tid, //tableid
        };
        let data2 = {
          key: jydfmc,
          kh: jydfmc,
          name: jydfmc,
          text: jydfmc,
          tid: this.tableData.tid,
        };
        let bFindData1 = false;
        let bFindData2 = false;
        for (let item of nodes) {
          if (item.key === data1.key) {
            bFindData1 = true;
            break;
          }
        }
        if (!bFindData1) nodes.push(data1);
        for (let item of nodes) {
          if (item.key === data2.key) {
            bFindData2 = true;
            break;
          }
        }
        if (!bFindData2) nodes.push(data2);

        // 画线
        let tempEdges = [];
        if (this.tableData.selectShowTypeValue === "1") {
          if (czje > 0) {
            let lineColor = this.calculateLineColorByJinE(czje);
            let link1 = {
              tid: this.tableData.tid,
              from: jymc,
              to: jydfmc,
              je: czje,
              bs: czbs,
              text: `${czje}元（${czbs}笔）`,
              stroke: lineColor,
            };
            if (lineColor !== "") tempEdges.push(link1);
          }
          if (jzje > 0) {
            let lineColor = this.calculateLineColorByJinE(jzje);
            let link2 = {
              tid: this.tableData.tid,
              from: jydfmc,
              to: jymc,
              je: jzje,
              bs: jzbs,
              text: `${jzje}元（${jzbs}笔）`,
              stroke: lineColor,
            };
            if (lineColor !== "") tempEdges.push(link2);
          }
        } else {
          if (jczce !== 0) {
            let lineColor = this.calculateLineColorByJinE(jczce);
            let link2 = {
              tid: this.tableData.tid,
              from: jydfmc,
              to: jymc,
              je: jczce,
              bs: jyzbs,
              label: `净${jczce}元（${jyzbs}笔）`,
              stroke: lineColor,
            };
            if (lineColor !== "") tempEdges.push(link2);
          }
        }

        if (tempEdges.length > 0) {
          links.push(...tempEdges);
        }
      });
      nodes.forEach((node) => {
        node.loc = "0 0";
        node.img = this.tableData.imgSrc;
        node.bkColor = this.defaultNodeFillColor;
        node.strokeColor = this.defaultNodeStrokeColor;
        node.nodeTextColor = this.defaultNodeTextColor;
      });
      links.forEach((link) => {
        link.strokeWidth = this.defaultLineStrokeWidth;
      });
      return { nodes, links };
    },
    makeDataVisible202() {
      let nodes = [];
      let links = [];
      // 汇总
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
        let jczce = parseFloat(row["jczce"]); // 进出帐差额
        let data1 = {
          tid: this.tableData.tid,
          key: cxkh + "\n" + jymc,
          kh: cxkh,
          name: jymc,
          text: cxkh + "\n" + jymc,
        };
        let data2 = {
          tid: this.tableData.tid,
          key: jydfzkh + "\n" + jydfmc,
          kh: jydfzkh,
          name: jydfmc,
          text: jydfzkh + "\n" + jydfmc,
        };
        let bFindData1 = false;
        let bFindData2 = false;
        for (let item of nodes) {
          if (item.key === data1.key) {
            bFindData1 = true;
            break;
          }
        }
        if (!bFindData1) nodes.push(data1);

        for (let item of nodes) {
          if (item.key === data2.key) {
            bFindData2 = true;
            break;
          }
        }
        if (!bFindData2) nodes.push(data2);

        // 画线
        // 汇总
        let tempEdges = [];

        if (this.tableData.selectShowTypeValue === "1") {
          if (czje > 0) {
            let lineColor = this.calculateLineColorByJinE(czje);
            let link1 = {
              tid: this.tableData.tid,
              from: cxkh + "\n" + jymc,
              to: jydfzkh + "\n" + jydfmc,
              je: czje,
              bs: czbs,
              text: `${czje}元（${czbs}笔）`,
              stroke: lineColor,
            };
            if (lineColor !== "") tempEdges.push(link1);
          }
          if (jzje > 0) {
            let lineColor = this.calculateLineColorByJinE(jzje);
            let link2 = {
              tid: this.tableData.tid,
              from: jydfzkh + "\n" + jydfmc,
              to: cxkh + "\n" + jymc,
              je: jzje,
              bs: jzbs,
              text: `${jzje}元（${jzbs}笔）`,
              stroke: lineColor,
            };
            if (lineColor !== "") tempEdges.push(link2);
          }
        } else {
          if (jczce !== 0) {
            let lineColor = this.calculateLineColorByJinE(jczce);
            let link1 = {
              tid: this.tableData.tid,
              from: cxkh + "\n" + jymc,
              to: jydfzkh + "\n" + jydfmc,
              je: jczce,
              bs: jyzbs,
              text: `净${jczce}元（${jyzbs}笔）`,
              stroke: lineColor,
            };
            if (lineColor !== "") tempEdges.push(link1);
          }
        }
        links.push(...tempEdges);
      });
      nodes.forEach((node) => {
        node.loc = "0 0";
        node.img = this.tableData.imgSrc;
        node.bkColor = this.defaultNodeFillColor;
        node.strokeColor = this.defaultNodeStrokeColor;
        node.nodeTextColor = this.defaultNodeTextColor;
      });
      links.forEach((link) => {
        link.strokeWidth = this.defaultLineStrokeWidth;
      });
      return { nodes, links };
    },
    normalOperation(data) {
      let { graphid, opt } = data;
      if (graphid !== this.graphid) return;
      let diagram = this.myDiagram;
      diagram.focus();
      switch (opt) {
        case "cut":
          diagram.commandHandler.cutSelection();
          break;
        case "copy":
          diagram.commandHandler.copySelection();
          break;
        case "paste":
          diagram.commandHandler.pasteSelection(
            diagram.toolManager.contextMenuTool.mouseDownPoint
          );
          break;
        case "delete":
          diagram.commandHandler.deleteSelection();
          break;
        case "undo":
          diagram.commandHandler.undo();
          break;
        case "redo":
          diagram.commandHandler.redo();
          break;
      }
      diagram.currentTool.stopTool();
    },
    addNodeData(key, text) {
      var node = {};
      node["key"] = key;
      node["text"] = text;
      node.loc = "0 0";
      node.img = this.defaultImg;
      node.bkColor = this.defaultNodeFillColor;
      node.strokeColor = this.defaultNodeStrokeColor;
      node.nodeTextColor = this.defaultNodeTextColor;
      this.myDiagram.model.addNodeData(node);
    },
    addLinkData(from, to, je, bs) {
      var link = {};
      link["from"] = from;
      link["to"] = to;
      link["stroke"] = this.calculateLineColorByJinE(je);
      link.strokeWidth = this.defaultLineStrokeWidth;
      link["je"] = je;
      link["bs"] = bs;
      link["text"] = `${je}元（${bs}笔）`;
      this.myDiagram.model.addLinkData(link);
    },
    onLinkInfoSetting(data) {
      let { graphid, linkEntity } = data;
      if (graphid !== this.graphid) return;
      let link = this.myDiagram.findLinkForKey(linkEntity.linkid);
      link.isSelected = false;
      let je = parseFloat(
        linkEntity.linkData.find((el) => el.ename === "je").describe
      );
      this.myDiagram.startTransaction("Modify link");
      this.myDiagram.model.setDataProperty(link.data, "je", je);
      this.myDiagram.model.setDataProperty(
        link.data,
        "stroke",
        this.calculateLineColorByJinE(je)
      );
      if (linkEntity.hasOwnProperty("dataType") && linkEntity.dataType === 0) {
        let rq = linkEntity.linkData.find((el) => el.ename === "rq").describe;
        this.myDiagram.model.setDataProperty(link.data, "rq", rq);
        this.myDiagram.model.setDataProperty(
          link.data,
          "text",
          `${je}元（${rq}）`
        );
      } else {
        let bs = parseInt(
          linkEntity.linkData.find((el) => el.ename === "bs").describe
        );
        this.myDiagram.model.setDataProperty(link.data, "bs", bs);
        this.myDiagram.model.setDataProperty(
          link.data,
          "text",
          `${je}元（${bs}笔）`
        );
      }

      this.myDiagram.commitTransaction("Modify link");
      link.isSelected = true;
      this.$message({
        type: "success",
        message: "修改成功",
      });
    },
    onNewBuildObject(data) {
      let { graphid, type } = data;
      if (graphid !== this.graphid) return;
      switch (type) {
        case "graph":
          {
            // 新建一个空白视图
            let obj = {
              title: "空白视图",
              componentName: "table-data-view",
              dispatchName: "ShowTable/showDataVisibleTable",
              tableType: "emptyGraph",
              showType: 2, // 数据可视化不显示table数据
              rightTabs: [],
              allrows: [],
              rows: [],
            };
            this.$store.commit("ShowTable/ADD_TABLE_DATA_TO_LIST", obj);
          }
          break;
        case "entity":
          this.addNodeData(uuid.v1(), "新建节点");
          break;
        case "link":
          let selection = this.myDiagram.selection;
          let nodeCount = 0;
          let firstObj = null;
          let lastObj = null;
          let it = selection.iterator;
          while (it.next()) {
            if (it.value instanceof go.Node) {
              nodeCount++;
              if (!firstObj) firstObj = it.value;
              lastObj = it.value;
            }
          }
          if (nodeCount === 2) {
            this.sourceNodeData = firstObj.data;
            this.desNodeData = lastObj.data;
            this.showLinkNodeDialog = true;
          } else {
            this.$message({
              message: "请选择两个节点进行操作。",
            });
          }
          break;
      }
    },
  },
  mounted() {
    this.init();
    const erd = elementResizeDetectorMaker();
    erd.listenTo(document.getElementById(this.graphid), (element) => {
      if (this.myDiagram) {
        setTimeout(() => {
          this.myDiagram.commandHandler.zoomToFit();
        }, 100);
      }
    });
    // node节点状态更新监听, 针对entitylist组件中鼠标移动进行图表中node的状态更新
    this.$bus.$on("updateNodeState", this.onUpdateNodesState);
    // 监听右侧菜单中点击table中的每个实体消息
    this.$bus.$on("clickEntityRow", this.onClickNode);
    // 设置链接信息
    this.$bus.$on("linkInfoSetting", this.onLinkInfoSetting);
    this.$bus.$on("nodeStyleSetting", this.onNodeStyleSetting);
    // 图表导出到图片
    this.$bus.$on("exportPicture", this.OnSavePicture);
    //保存当前图表数据
    this.$bus.$on("saveGraphData", this.onSaveGraphData);
    this.$bus.$on("findShortLink", this.onFindShortLink);
    // 基本操作
    this.$bus.$on("normalOperation", this.normalOperation);
    // 新建操作
    this.$bus.$on("newBuildObject", this.onNewBuildObject);

    // 布局切换监听
    this.$bus.$on("swichNormalLayout", this.onSwitchLayout);
    this.myDiagram.addDiagramListener("ClipboardChanged", function (e) {
      console.log(e);
    });
  },
};
</script>

<style  scoped>
.ctxmenu {
  display: none;
  position: fixed;
  color: #202124;
  width: 200px;
  border-radius: 4px;
  background-color: #ffffff;
  z-index: 999;
  border: 1px solid #b6b6bb;
  box-shadow: 5px 5px 10px 5px #b6b6bb,
    -5px 5px 5px 5px rgba(255, 255, 255, 0.5);
}
.menu-item {
  display: block;
  position: relative;
  min-width: 60px;
  margin: 0;
  padding: 6px 16px;
  font: bold 12px sans-serif;
  color: rgba(0, 0, 0, 0.87);
}
.menu-item::before {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  pointer-events: none;
  content: "";
  width: 100%;
  height: 100%;
  background-color: #000000;
}
.menu-item:hover::before {
  opacity: 0.04;
}
.menu .menu {
  top: -8px;
  left: 100%;
}
.show-menu,
.menu-item:hover .ctxmenu {
  display: block;
  opacity: 1;
}
.tips {
  font-size: 10px;
  margin-top: 7px;
}
</style>