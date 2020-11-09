<template>
  <div class="TabVisible">
    <el-row style="text-align: center">
      <el-col :span="5" style="border-right: 1px solid #e5e7ec">
        <el-row>
          <el-col :span="6">
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
          <el-col :span="6">
            <el-button
              size="mini"
              type="text"
              style="padding: 4px; font-size: 12px"
              class="iconfont"
              @click="handleClickSwitchLayout('dagre')"
              :disabled="disabledButtons"
              >&#xe737;&nbsp;层次布局</el-button
            >
          </el-col>
          <el-col :span="6">
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

          <el-col :span="6">
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
        <el-row>
          <el-col :span="6">
            <el-button
              size="mini"
              type="text"
              style="padding: 4px; font-size: 12px"
              class="iconfont"
              @click="handleClickSwitchLayout('concentric')"
              :disabled="disabledButtons"
              >&#xe605;&nbsp;同心圆布局</el-button
            >
          </el-col>
          <el-col :span="6">
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
          <el-col :span="6">
            <el-button
              size="mini"
              type="text"
              style="padding: 4px; font-size: 12px"
              class="iconfont"
              @click="handleClickSwitchLayout('radial')"
              :disabled="disabledButtons"
              >&#xe7bb;&nbsp;辐射状布局</el-button
            >
          </el-col>
          <el-col :span="6">
            <el-button
              size="mini"
              type="text"
              style="padding: 4px; font-size: 12px"
              class="iconfont"
              @click="handleClickSwitchLayout('force')"
              :disabled="disabledButtons"
              >&#xe63f;&nbsp;力导向布局</el-button
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
              :disabled="disabledButtons"
              >&#xe601;&nbsp;实体列表</el-button
            >
          </el-col>
          <el-col :span="12">
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
          <el-col :span="12">
            <el-button
              size="mini"
              type="text"
              class="iconfont"
              style="padding: 4px; font-size: 12px"
              :disabled="true || disabledButtons"
              >&#xe6a3;&nbsp;新建视图</el-button
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
      <el-col :span="5" style="border-right: 1px solid #e5e7ec">
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
    disabledButtons() {
      return !(
        this.currentTableData && this.currentTableData.hasOwnProperty("graphid")
      );
    },
  },
  methods: {
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
            nodeSpacing: 50,
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
        case "fruchterman":
          layout = {
            type: "fruchterman",
            gravity: 1,
            speed: 5,
            clustering: true,
          };
          break;
        case "force":
          layout = {
            type: "force",
          };
          break;
      }
      this.$bus.$emit("swichNormalLayout", {
        graphid: this.currentTableData.graphid,
        layout,
      });
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