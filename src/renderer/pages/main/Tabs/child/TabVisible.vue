<template>
  <div class="TabVisible">
    <el-row style="text-align: center">
      <el-col :span="4" style="border-right: 1px solid #e5e7ec">
        <el-row>
          <el-col :span="8">
            <el-button
              size="mini"
              type="text"
              style="padding: 4px; font-size: 13px"
              class="iconfont"
              @click="handleClickSwitchLayout('random')"
              :disabled="disabledButtons"
              >&#xe6cd;&nbsp;随机布局</el-button
            >
          </el-col>
          <el-col :span="8">
            <el-button
              size="mini"
              type="text"
              style="padding: 4px; font-size: 13px"
              class="iconfont"
              @click="handleClickSwitchLayout('grid')"
              :disabled="disabledButtons"
              >&#xe667;&nbsp;网格布局</el-button
            >
          </el-col>
          <el-col :span="8">
            <el-button
              size="mini"
              type="text"
              style="padding: 4px; font-size: 13px"
              class="iconfont"
              @click="handleClickSwitchLayout('circular')"
              :disabled="disabledButtons"
              >&#xe609;&nbsp;圆形布局</el-button
            >
          </el-col>
        </el-row>
        <el-row>
          <!-- <el-col :span="12">
            <el-button
              v-if="false"
              size="mini"
              type="text"
              style="padding: 4px; font-size: 12px"
              class="iconfont"
              @click="handleClickSwitchLayout('radialLayout')"
              :disabled="disabledButtons"
              >&#xe605;&nbsp;径向布局</el-button
            >
          </el-col> -->
          <el-col :span="8">
            <el-button
              size="mini"
              type="text"
              style="padding: 4px; font-size: 13px"
              class="iconfont"
              @click="handleClickSwitchLayout('dagre')"
              :disabled="disabledButtons"
              >&#xe737;&nbsp;层次布局</el-button
            >
          </el-col>

          <!-- <el-col :span="12">
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
          </el-col> -->
          <el-col :span="8">
            <el-button
              size="mini"
              type="text"
              style="padding: 4px; font-size: 13px"
              class="iconfont"
              @click="handleClickSwitchLayout('tree')"
              :disabled="disabledButtons"
              >&#xe6b1;&nbsp;树形布局</el-button
            >
          </el-col>
          <el-col :span="8">
            <el-button
              size="mini"
              type="text"
              style="padding: 4px; font-size: 13px"
              class="iconfont"
              @click="handleClickSwitchLayout('fruchterman')"
              :disabled="disabledButtons"
              >&#xe63f;&nbsp;聚类布局</el-button
            >
          </el-col>
        </el-row>
      </el-col>
      <el-col
        :span="4"
        style="
          border-right: 1px solid #e5e7ec;
          padding-top: 15px;
          padding-bottom: 10px;
        "
      >
        <el-row>
          <el-col :span="8">
            <el-button
              size="mini"
              type="text"
              class="iconfont"
              style="padding: 4px; font-size: 13px"
              :disabled="disabledButtons"
              @click="handleClickNew('graph')"
              >&#xe6a3;&nbsp;新建视图</el-button
            >
          </el-col>
          <el-col :span="8">
            <el-button
              size="mini"
              type="text"
              class="iconfont"
              style="padding: 4px; font-size: 13px"
              :disabled="disabledButtons"
              @click="handleClickNew('entity')"
              >&#xe64a;&nbsp;新建实体</el-button
            >
          </el-col>
          <el-col :span="8">
            <el-button
              size="mini"
              type="text"
              class="iconfont"
              style="padding: 4px; font-size: 13px"
              :disabled="disabledButtons"
              @click="handleClickNew('link')"
              >&#xe752;&nbsp;新建链接</el-button
            >
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="3" style="border-right: 1px solid #e5e7ec">
        <el-row>
          <el-col :span="8">
            <el-tooltip
              class="item"
              effect="dark"
              content="Ctrl-X & Shift-Del"
              placement="top"
              :enterable="false"
            >
              <el-button
                size="mini"
                type="text"
                class="iconfont"
                style="padding: 4px; font-size: 12px"
                @click="handleClickNoramOperation('cut')"
                :disabled="disabledButtons"
                >&#xe647;&nbsp;剪切</el-button
              >
            </el-tooltip>
          </el-col>
          <el-col :span="8">
            <el-tooltip
              class="item"
              effect="dark"
              content="Ctrl-C & Ctrl-Insert"
              placement="top"
              :enterable="false"
            >
              <el-button
                size="mini"
                type="text"
                class="iconfont"
                style="padding: 4px; font-size: 12px"
                :disabled="disabledButtons"
                @click="handleClickNoramOperation('copy')"
                >&#xe720;&nbsp;复制</el-button
              >
            </el-tooltip>
          </el-col>
          <el-col :span="8">
            <el-tooltip
              class="item"
              effect="dark"
              content="Ctrl-V & Shift-Insert"
              placement="top"
              :enterable="false"
            >
              <el-button
                size="mini"
                type="text"
                class="iconfont"
                style="padding: 4px; font-size: 12px"
                :disabled="disabledButtons"
                @click="handleClickNoramOperation('paste')"
                >&#xe701;&nbsp;粘贴</el-button
              >
            </el-tooltip>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-tooltip
              class="item"
              effect="dark"
              content="Del & Backspace"
              placement="top"
              :enterable="false"
            >
              <el-button
                size="mini"
                type="text"
                class="iconfont"
                style="padding: 4px; font-size: 12px"
                :disabled="disabledButtons"
                @click="handleClickNoramOperation('delete')"
                >&#xe644;&nbsp;删除</el-button
              >
            </el-tooltip>
          </el-col>
          <el-col :span="8">
            <el-tooltip
              class="item"
              effect="dark"
              content="Ctrl-Z & Alt-Backspace"
              placement="top"
              :enterable="false"
            >
              <el-button
                size="mini"
                type="text"
                class="iconfont"
                style="padding: 4px; font-size: 12px"
                @click="handleClickNoramOperation('undo')"
                :disabled="disabledButtons"
                >&#xe6e9;&nbsp;后退</el-button
              >
            </el-tooltip>
          </el-col>
          <el-col :span="8">
            <el-tooltip
              class="item"
              effect="dark"
              content="Ctrl-Y & Alt-Shift-Backspace"
              placement="top"
              :enterable="false"
            >
              <el-button
                size="mini"
                type="text"
                class="iconfont"
                style="padding: 4px; font-size: 12px"
                @click="handleClickNoramOperation('redo')"
                :disabled="disabledButtons"
                >&#xe6ed;&nbsp;前进</el-button
              >
            </el-tooltip>
          </el-col>
        </el-row>
      </el-col>

      <el-col
        :span="4"
        style="
          border-right: 1px solid #e5e7ec;
          padding-top: 15px;
          padding-bottom: 10px;
        "
      >
        <el-row>
          <el-col :span="8">
            <el-button
              size="mini"
              type="text"
              class="iconfont"
              style="padding: 4px; font-size: 13px"
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
              style="padding: 4px; font-size: 13px"
              @click="handleClickFindShortLink"
              :disabled="disabledButtons"
              >&#xe646;&nbsp;最短路径</el-button
            >
          </el-col>
          <el-col :span="8">
            <el-button
              size="mini"
              type="text"
              class="iconfont"
              style="padding: 4px; font-size: 13px"
              @click="handleClickExportPicture"
              :disabled="disabledButtons"
              >&#xe637;&nbsp;导出到图片</el-button
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
      <el-col :span="4" style="border-right: 1px solid #e5e7ec">
        <div>布局</div>
      </el-col>
      <el-col
        :span="4"
        style="text-align: center; border-right: 1px solid #e5e7ec"
      >
        <div>新建</div>
      </el-col>
      <el-col
        :span="3"
        style="text-align: center; border-right: 1px solid #e5e7ec"
      >
        <div>操作</div>
      </el-col>

      <el-col
        :span="4"
        style="text-align: center; border-right: 1px solid #e5e7ec"
      >
        <div>查看与导出</div>
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
    handleClickNoramOperation(opt) {
      this.$bus.$emit("normalOperation", {
        graphid: this.currentTableData.graphid,
        opt,
      });
    },
    handleClickFindShortLink() {
      this.$bus.$emit("findShortLink", {
        graphid: this.currentTableData.graphid,
      });
    },
    handleClickNew(type) {
      this.$bus.$emit("newBuildObject", {
        graphid: this.currentTableData.graphid,
        type,
      });
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
        case "radialLayout":
          layout = "radialLayout";
          break;
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
        case "tree":
          layout = "tree";
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