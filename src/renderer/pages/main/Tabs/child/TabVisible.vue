<template>
  <div class="TabVisible">
    <el-row style="text-align: center">
      <el-col :span="4" style="border-right: 1px solid #e5e7ec">
        <el-row>
          <el-col :span="8">
            <el-button
              size="mini"
              type="text"
              style="padding: 4px; font-size: 12px"
              class="iconfont"
              @click="handleClickSwitchLayout('random')"
              >&#xe6cd;&nbsp;随机布局</el-button
            >
          </el-col>
          <el-col :span="8">
            <el-button
              size="mini"
              type="text"
              style="padding: 4px; font-size: 12px"
              class="iconfont"
              @click="handleClickSwitchLayout('dagre')"
              >&#xe737;&nbsp;层次布局</el-button
            >
          </el-col>
          <el-col :span="8">
            <el-button
              size="mini"
              type="text"
              style="padding: 4px; font-size: 12px"
              class="iconfont"
              @click="handleClickSwitchLayout('circular')"
              >&#xe609;&nbsp;圆形布局</el-button
            >
          </el-col>
          <!-- <el-col :span="6">
            <el-button
              size="mini"
              type="text"
              style="padding:4px;font-size:12px;"
              class="iconfont"
              @click="handleClickSwitchLayout('circular2')"
            >&#xe609;&nbsp;螺旋布局</el-button>
          </el-col>-->
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-button
              size="mini"
              type="text"
              style="padding: 4px; font-size: 12px"
              class="iconfont"
              @click="handleClickSwitchLayout('concentric')"
              >&#xe605;&nbsp;同心圆布局</el-button
            >
          </el-col>
          <el-col :span="8">
            <el-button
              size="mini"
              type="text"
              style="padding: 4px; font-size: 12px"
              class="iconfont"
              @click="handleClickSwitchLayout('grid')"
              >&#xe667;&nbsp;网格布局</el-button
            >
          </el-col>
          <el-col :span="8">
            <el-button
              size="mini"
              type="text"
              style="padding: 4px; font-size: 12px"
              class="iconfont"
              @click="handleClickSwitchLayout('radial')"
              >&#xe7bb;&nbsp;辐射状布局</el-button
            >
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="3" style="border-right: 1px solid #e5e7ec">
        <el-row>
          <el-col :span="12">
            <el-button
              size="mini"
              type="text"
              class="iconfont"
              style="padding: 4px; font-size: 12px"
              @click="handleClickShowEntityListView"
              >&#xe601;&nbsp;显示实体列表</el-button
            >
          </el-col>
          <el-col :span="12">
            <el-button
              size="mini"
              type="text"
              class="iconfont"
              style="padding: 4px; font-size: 12px"
              @click="handleClickSaveGraphData"
              >&#xe603;&nbsp;保存当前表数据</el-button
            >
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-button
              size="mini"
              type="text"
              class="iconfont"
              style="padding: 4px; font-size: 12px"
              >&#xe60a;&nbsp;显示实体列表</el-button
            >
          </el-col>
          <el-col :span="12">
            <el-button
              size="mini"
              type="text"
              class="iconfont"
              style="padding: 4px; font-size: 12px"
              @click="handleClickExportPicture"
              >&#xe637;&nbsp;导出到图片</el-button
            >
          </el-col>
        </el-row>
      </el-col>
    </el-row>
    <el-row style="font-size: 8px; color: gray; text-align: center">
      <el-col :span="4" style="border-right: 1px solid #e5e7ec">
        <div>布局</div>
      </el-col>
      <el-col
        :span="3"
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
  },
  methods: {
    handleClickShowEntityListView() {
      this.$store.commit("ShowTable/ADD_OR_REMOVE_RIGHT_TAB", {
        componentName: "entity-list-view",
        action: "add",
      });
    },
    handleClickSaveGraphData() {
      this.$bus.$emit("saveGraphData", {
        graphid: this.currentTableData.graphid,
      });
    },
    handleClickExportPicture() {
      this.$bus.$emit("exportPicture", {
        graphid: this.currentTableData.graphid,
      });
    },
    handleClickSwitchLayout(layoutName) {
      let layout;
      switch (layoutName) {
        case "random": // 随机
          layout = {
            type: "random", // 指定为力导向布局
            preventOverlap: true, // 防止节点重叠
          };
          break;
        case "dagre": //层次
          layout = {
            type: "dagre",
            preventOverlap: true,
          };
          break;
        case "circular": // 圆形
          layout = {
            preventOverlap: true,
            ordering: "degree",
            type: "circular",
          };
          break;
        case "grid": // 网格
          layout = {
            type: "grid",
            preventOverlap: true,
            begin: [20, 20],
          };
          break;
        case "radial": // 辐射
          layout = {
            type: "radial",
            unitRadius: 50,
            preventOverlap: true,
            nodeSpacing: 20,
            strictRadial: true,
            maxPreventOverlapIteration: 100,
          };
          break;
        case "concentric": // 同心圆
          layout = {
            type: "concentric",
            maxLevelDiff: 0.5,
            sortBy: "degree",
            preventOverlap: true,
          };
          break;
      }
      this.$bus.$emit("swichNormalLayout", {
        graphid: this.currentTableData.graphid,
        layout,
      });
    },
  },
};
</script>
<style scoped>
.TabVisible {
  -webkit-user-select: none;
}
</style>