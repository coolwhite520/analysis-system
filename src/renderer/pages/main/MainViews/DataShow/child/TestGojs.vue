<template>
  <div>
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
        <el-input
          size="mini"
          v-model="inputValue"
          placeholder="输入关键字进行快捷定位"
        ></el-input>
      </el-col>
    </el-row>

    <!-- <div :id="miniMapID" style="width:100px;"></div> -->
    <div>
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
  </div>
</template>

<script>
import go from "gojs";
import insertCss from "insert-css";
import { mapState } from "vuex";
import { Decimal } from "decimal.js";
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
        if (
          node.data.name.indexOf(newValue) !== -1 ||
          node.data.kh.indexOf(newValue) !== -1
        ) {
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
          if (node.findLinksConnected().count === 0) {
            node.visible = false;
          } else node.visible = true;
        });
      }
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
      //if (option == undefined)
      //    option = {
      //        //layerSpacing: 150,
      //        //angle: 90,
      //        comparer: go.GridLayout.smartComparer
      //    };

      this.myDiagram.layout = $(go.GridLayout, {
        comparer: go.GridLayout.smartComparer,
      });

      this.myDiagram.startTransaction("change Layout");
      var lay = this.myDiagram.layout;

      var wrappingColumn = 10; // document.getElementById("wrappingColumn").value;
      lay.wrappingColumn = parseFloat(wrappingColumn, 10);

      var wrappingWidth = "NaN"; // document.getElementById("wrappingWidth").value;
      lay.wrappingWidth = parseFloat(wrappingWidth, 10);

      var cellSize = "NaN NaN"; // document.getElementById("cellSize").value;
      lay.cellSize = go.Size.parse(cellSize);

      var spacing = "50 50"; // document.getElementById("spacing").value;
      lay.spacing = go.Size.parse(spacing);

      var alignment = "Position"; // getRadioValue("alignment");
      if (alignment === "Position") {
        lay.alignment = go.GridLayout.Position;
      } else {
        lay.alignment = go.GridLayout.Location;
      }

      var arrangement = "LeftToRight"; // getRadioValue("arrangement");
      if (arrangement === "LeftToRight") {
        lay.arrangement = go.GridLayout.LeftToRight;
      } else {
        lay.arrangement = go.GridLayout.RightToLeft;
      }

      var sorting = "Forward"; // document.getElementById("sorting").value;
      switch (sorting) {
        default:
        case "Forward":
          lay.sorting = go.GridLayout.Forward;
          break;
        case "Reverse":
          lay.sorting = go.GridLayout.Reverse;
          break;
        case "Ascending":
          lay.sorting = go.GridLayout.Ascending;
          break;
        case "Descending":
          lay.sorting = go.GridLayout.Descending;
          break;
      }

      this.myDiagram.commitTransaction("change Layout");
      this.myDiagram.layout = $(go.Layout);
    },
    CircularLayout() {
      this.myDiagram.layout = $(go.CircularLayout);

      this.myDiagram.startTransaction("change Layout");
      var lay = this.myDiagram.layout;

      var radius = "NaN"; // document.getElementById("radius").value;
      if (radius !== "NaN") radius = parseFloat(radius, 10);
      else radius = NaN;
      lay.radius = radius;

      var aspectRatio = 1; // document.getElementById("aspectRatio").value;
      aspectRatio = parseFloat(aspectRatio, 10);
      lay.aspectRatio = aspectRatio;

      var startAngle = 0; // document.getElementById("startAngle").value;
      startAngle = parseFloat(startAngle, 10);
      lay.startAngle = startAngle;

      var sweepAngle = 360; // ocument.getElementById("sweepAngle").value;
      sweepAngle = parseFloat(sweepAngle, 10);
      lay.sweepAngle = sweepAngle;

      var spacing = 20; // document.getElementById("spacing").value;
      spacing = parseFloat(spacing, 10);
      lay.spacing = spacing;

      var arrangement = "ConstantDistance"; // document.getElementById("arrangement").value;
      if (arrangement === "ConstantDistance")
        lay.arrangement = go.CircularLayout.ConstantDistance;
      else if (arrangement === "ConstantAngle")
        lay.arrangement = go.CircularLayout.ConstantAngle;
      else if (arrangement === "ConstantSpacing")
        lay.arrangement = go.CircularLayout.ConstantSpacing;
      else if (arrangement === "Packed")
        lay.arrangement = go.CircularLayout.Packed;

      var diamFormula = "Pythagorean"; // getRadioValue("diamFormula");
      if (diamFormula === "Pythagorean")
        lay.nodeDiameterFormula = go.CircularLayout.Pythagorean;
      else if (diamFormula === "Circular")
        lay.nodeDiameterFormula = go.CircularLayout.Circular;

      var direction = "Clockwise"; // document.getElementById("direction").value;
      if (direction === "Clockwise")
        lay.direction = go.CircularLayout.Clockwise;
      else if (direction === "Counterclockwise")
        lay.direction = go.CircularLayout.Counterclockwise;
      else if (direction === "BidirectionalLeft")
        lay.direction = go.CircularLayout.BidirectionalLeft;
      else if (direction === "BidirectionalRight")
        lay.direction = go.CircularLayout.BidirectionalRight;

      var sorting = "Forwards"; // document.getElementById("sorting").value;
      if (sorting === "Forwards") lay.sorting = go.CircularLayout.Forwards;
      else if (sorting === "Reverse") lay.sorting = go.CircularLayout.Reverse;
      else if (sorting === "Ascending")
        lay.sorting = go.CircularLayout.Ascending;
      else if (sorting === "Descending")
        lay.sorting = go.CircularLayout.Descending;
      else if (sorting === "Optimized")
        lay.sorting = go.CircularLayout.Optimized;

      this.myDiagram.commitTransaction("change Layout");

      this.myDiagram.layout = $(go.Layout);
    },
    switchAllowScroll() {
      this.myDiagram.allowHorizontalScroll = this.enableDragCavans;
      this.myDiagram.allowVerticalScroll = this.enableDragCavans;
      this.myDiagram.allowDrop = this.enableDragCavans;
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
              console.log(it.value.data);
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
        let edges = node.findLinksConnected();
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
    },
    ForceDirectedLayout() {
      this.myDiagram.layout = $(go.ForceDirectedLayout);
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
          { margin: 8, name: "TEXT" },
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
              let group = diagram.findPartForKey(groupKey);
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
      this.myDiagram.linkTemplate = $(
        ParallelRouteLink,
        {
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
          { isPanelMain: true, strokeWidth: _this.defaultLineStrokeWidth },
          new go.Binding("strokeWidth", "strokeWidth", function (val) {
            return val * _this.defaultLineStrokeWidth;
          }),
          new go.Binding("stroke", "stroke")
        ),
        $(
          go.Shape,
          { toArrow: "Standard" },
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
            { margin: 3 },
            new go.Binding("text", "text"),
            new go.Binding("stroke", "stroke")
          )
        ),
        {
          mouseEnter: function (e, link) {},
          mouseLeave: function (e, link) {},
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
      }
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
          loc: "0 0",
          img: "/static/images/icons/银行卡.png",
          bkColor: this.defaultNodeFillColor,
          strokeColor: this.defaultNodeStrokeColor,
          nodeTextColor: this.defaultNodeTextColor,
        };
        let data2 = {
          key: jydfmc,
          name: jydfmc,
          text: jydfmc,
          tid: this.tableData.tid,
          loc: "0 0",
          img: "/static/images/icons/银行卡.png",
          bkColor: this.defaultNodeFillColor,
          strokeColor: this.defaultNodeStrokeColor,
          nodeTextColor: this.defaultNodeTextColor,
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
            strokeWidth: this.defaultLineStrokeWidth,
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
            strokeWidth: this.defaultLineStrokeWidth,
          };
          if (lineColor !== "") templinks.push(link2);
        }
        if (templinks.length > 0) {
          links.push(...templinks);
        }
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
          loc: "0 0",
          img: "/static/images/icons/银行卡.png",
          bkColor: this.defaultNodeFillColor,
          strokeColor: this.defaultNodeStrokeColor,
          nodeTextColor: this.defaultNodeTextColor,
        };
        let data2 = {
          key: jydfmc,
          kh: jydfmc,
          name: jydfmc,
          text: jydfmc,
          tid: this.tableData.tid,
          loc: "0 0",
          img: "/static/images/icons/银行卡.png",
          bkColor: this.defaultNodeFillColor,
          strokeColor: this.defaultNodeStrokeColor,
          nodeTextColor: this.defaultNodeTextColor,
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
            strokeWidth: this.defaultLineStrokeWidth,
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
            strokeWidth: this.defaultLineStrokeWidth,
          };
          if (lineColor !== "") templinks.push(link2);
        }
        if (templinks.length > 0) {
          links.push(...templinks);
        }
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
          loc: "0 0",
          img: "/static/images/icons/银行卡.png",
          bkColor: this.defaultNodeFillColor,
          strokeColor: this.defaultNodeStrokeColor,
          nodeTextColor: this.defaultNodeTextColor,
        };
        let data2 = {
          tid: this.tableData.tid,
          key: jydfzkh + "\n" + jydfmc,
          kh: jydfzkh,
          name: jydfmc,
          text: jydfzkh + "\n" + jydfmc,
          loc: "0 0",
          img: "/static/images/icons/银行卡.png",
          bkColor: this.defaultNodeFillColor,
          strokeColor: this.defaultNodeStrokeColor,
          nodeTextColor: this.defaultNodeTextColor,
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
            strokeWidth: this.defaultLineStrokeWidth,
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
            strokeWidth: this.defaultLineStrokeWidth,
          };
          if (lineColor !== "") templinks.push(link2);
        }
        links.push(...templinks);
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
          let node = this.myDiagram.findPartForKey(part.key);
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
          let combo = this.myDiagram.findPartForKey(part.key);
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
            let group = diagram.findPartForKey(groupKey);
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
            let group = diagram.findPartForKey(item.key);
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
            diagram.selectCollection(list);
            return;
          }
          break;
      }
      diagram.clearSelection();
      diagram.currentTool.stopTool();
    },
    allNodesToFront() {
      this.myDiagram.nodes.each((node) => {
        node.layerName = "Foreground";
      });
    },
    onUpdateNodesState({ graphid, nodeid, state }) {
      if (graphid === this.graphid) {
        let part = this.myDiagram.findPartForKey(nodeid);
        if (state === "clear") {
          this.myDiagram.clearSelection();
        } else {
          let set = new go.List();
          set.add(part);
          this.myDiagram.selectCollection(set);
        }
      }
    },
    calculateEntityInfo(node) {
      let nodeModel = node.data;
      console.log(nodeModel);
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
      let node = this.myDiagram.findPartForKey(nodeid);
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
      let node = this.myDiagram.findPartForKey(nodeid);
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
    saveGraphData(data) {
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
    switchLayout(data) {
      let { graphid, layout } = data;
      if (graphid !== this.graphid) return;
      this.CircularLayout();
      this.updateEntityList();
      this.accordingXianKuanRefreshEdges(this.tableData.xianKuanSetting);
      this.myDiagram.commandHandler.zoomToFit();
    },
    init() {
      this.tempgraphicMoneySectionStrMd5 = md5(
        JSON.stringify(this.tableData.graphicMoneySectionList)
      );
      this.initDiagram();
      this.initOverView();
      this.initNodeTemplate();
      this.initGroupTemplate();
      if (this.tableData.hasOwnProperty("relationGraphData")) {
        this.myDiagram.model = go.Model.fromJson(
          this.tableData.relationGraphData
        );
      } else {
        let { nodes, links } = this.makeData();
        this.myDiagram.model = new go.GraphLinksModel(nodes, links);
      }
      this.initLinkTemplate();
      // this.CircularLayout();
      // this.GridLayout();
      // this.layoutTree();
      this.ForceDirectedLayout();
      this.accordingXianKuanRefreshEdges(this.tableData.xianKuanSetting);
      this.accordingSpreadNodeSwitchRefreshNodes();
      this.updateEntityList();
      this.switchAllowScroll();
      this.allNodesToFront();
      this.myDiagram.commandHandler.zoomToFit();
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
    this.$bus.$on("nodeStyleSetting", this.onNodeStyleSetting);
    // 图表导出到图片
    this.$bus.$on("exportPicture", this.OnSavePicture);
    //保存当前图表数据
    this.$bus.$on("saveGraphData", this.saveGraphData);
    // 布局切换监听
    this.$bus.$on("swichNormalLayout", this.switchLayout);
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