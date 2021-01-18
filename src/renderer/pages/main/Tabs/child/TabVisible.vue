<template>
  <div class="TabVisible">
    <el-row style="text-align: center">
      <el-col :span="3" style="border-right: 1px solid #e5e7ec">
        <el-row>
          <el-col :span="12">
            <el-button
              size="mini"
              type="text"
              style="padding: 4px; font-size: 12px"
              class="iconfont"
              @click="handleClickSwitchLayout('random')"
              :disabled="disabledButtons"
              >&#xe6cd;&nbsp;随机布局</el-button
            >
          </el-col>
          <el-col :span="12">
            <el-button
              size="mini"
              type="text"
              style="padding: 4px; font-size: 12px"
              class="iconfont"
              @click="handleClickSwitchLayout('grid')"
              :disabled="disabledButtons"
              >&#xe667;&nbsp;网格布局</el-button
            >
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-button
              size="mini"
              type="text"
              style="padding: 4px; font-size: 12px"
              class="iconfont"
              @click="handleClickSwitchLayout('circular')"
              :disabled="disabledButtons"
              >&#xe609;&nbsp;圆形布局</el-button
            >
          </el-col>
          <el-col :span="12">
            <el-button
              v-if="false"
              size="mini"
              type="text"
              style="padding: 4px; font-size: 12px"
              class="iconfont"
              @click="handleClickSwitchLayout('concentric')"
              :disabled="disabledButtons"
              >&#xe605;&nbsp;同心圆布局</el-button
            >
          </el-col>
          <el-col :span="12">
            <el-button
              v-if="false"
              size="mini"
              type="text"
              style="padding: 4px; font-size: 12px"
              class="iconfont"
              @click="handleClickSwitchLayout('dagre')"
              :disabled="disabledButtons"
              >&#xe737;&nbsp;层次布局</el-button
            >
          </el-col>

          <el-col :span="12">
            <el-button
              v-if="false"
              size="mini"
              type="text"
              style="padding: 4px; font-size: 12px"
              class="iconfont"
              @click="handleClickSwitchLayout('radial')"
              :disabled="disabledButtons"
              >&#xe7bb;&nbsp;辐射状布局</el-button
            >
          </el-col>
          <el-col :span="12">
            <el-button
              v-if="false"
              size="mini"
              type="text"
              style="padding: 4px; font-size: 12px"
              class="iconfont"
              @click="handleClickSwitchLayout('force')"
              :disabled="disabledButtons"
              >&#xe63f;&nbsp;结构布局</el-button
            >
          </el-col>
          <el-col :span="12">
            <el-button
              size="mini"
              type="text"
              style="padding: 4px; font-size: 12px"
              class="iconfont"
              @click="handleClickSwitchLayout('fruchterman')"
              :disabled="disabledButtons"
              >&#xe6b1;&nbsp;聚类布局</el-button
            >
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="5" style="border-right: 1px solid #e5e7ec">
        <el-row>
          <el-col :span="8">
            <el-button
              size="mini"
              type="text"
              class="iconfont"
              style="padding: 4px; font-size: 12px"
              @click="handleClickShowEntityListView"
              :disabled="disabledButtons"
              >&#xe601;&nbsp;实体列表</el-button
            >
          </el-col>
          <el-col :span="8">
            <el-button
              size="mini"
              type="text"
              class="iconfont"
              style="padding: 4px; font-size: 12px"
              @click="handleClickShowEntityListView"
              :disabled="disabledButtons"
              >&#xe601;&nbsp;实体列表</el-button
            >
          </el-col>
          <el-col :span="8">
            <el-button
              size="mini"
              type="text"
              class="iconfont"
              style="padding: 4px; font-size: 12px"
              @click="handleClickExportPicture"
              :disabled="disabledButtons"
              >&#xe637;&nbsp;导出到图片</el-button
            >
          </el-col>
          <!-- <el-col :span="12">
            <el-button
              size="mini"
              type="text"
              class="iconfont"
              style="padding: 4px; font-size: 12px"
              @click="handleClickMoveGraph"
              >&#xe603;&nbsp;移动</el-button
            >
          </el-col> -->
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-button
              size="mini"
              type="text"
              class="iconfont"
              style="padding: 4px; font-size: 12px"
              :disabled="disabledButtons"
              @click="handleClickNewView"
              >&#xe6a3;&nbsp;新建视图</el-button
            >
          </el-col>
          <el-col :span="8">
            <el-button
              size="mini"
              type="text"
              class="iconfont"
              style="padding: 4px; font-size: 12px"
              :disabled="disabledButtons"
              @click="handleClickNewView"
              >&#xe6a3;&nbsp;新建节点</el-button
            >
          </el-col>
          <el-col :span="8">
            <el-button
              size="mini"
              type="text"
              class="iconfont"
              style="padding: 4px; font-size: 12px"
              :disabled="disabledButtons"
              @click="handleClickNewView"
              >&#xe6a3;&nbsp;新建链接</el-button
            >
          </el-col>
        </el-row>
      </el-col>
    </el-row>
    <el-row
      style="
        font-size: 8px;
        color: gray;
        text-align: center;
        padding-bottom: 4px;
      "
    >
      <el-col :span="3" style="border-right: 1px solid #e5e7ec">
        <div>布局</div>
      </el-col>
      <el-col
        :span="5"
        style="text-align: center; border-right: 1px solid #e5e7ec"
      >
        <div>操作</div>
      </el-col>
    </el-row>
  </div>
</template>
<script >
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState("ShowTable", ["currentTableData"]),
    disabledButtons() {
      return !(
        this.currentTableData && this.currentTableData.hasOwnProperty("graphid")
      );
    },
  },
  methods: {
    handleClickNewView() {
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
    },
    handleClickShowEntityListView() {
      this.$store.commit("ShowTable/ADD_OR_REMOVE_RIGHT_TAB", {
        componentName: "entity-list-view",
        action: "add",
      });
    },

    handleClickExportPicture() {
      this.$bus.$emit("exportPicture", {
        graphid: this.currentTableData.graphid,
      });
    },
    handleClickSwitchLayout(layoutName) {
      let layout;
      let isNormalLayout = false;
      switch (layoutName) {
        case "random": // 随机
          layout = "random"; // 指定为力导向布局
          break;
        case "dagre": //层次
          layout = "dagre";
          break;
        case "circular": // 圆形
          layout = "circular";
          break;
        case "grid": // 网格
          layout = "grid";

          break;
        case "radial": // 辐射
          layout = "radial";

          break;
        case "concentric": // 同心圆
          layout = "concentric";
          break;
        case "fruchterman":
          layout = "fruchterman";
          break;
        case "force":
          layout = "force";
          break;
      }
      if (this.currentTableData.hasOwnProperty("graphid")) {
        this.$bus.$emit("swichNormalLayout", {
          graphid: this.currentTableData.graphid,
          layout,
        });
      } else {
        this.$message({
          message: "当前视图不支持布局切换",
        });
      }

      // if (isNormalLayout) {

      // } else {
      //   this.$bus.$emit("switchSpecialLayout", {
      //     graphid: this.currentTableData.graphid,
      //   });
      // }
    },
  },
};
</script>
<style scoped>
.TabVisible {
  -webkit-user-select: none;
}
</style>