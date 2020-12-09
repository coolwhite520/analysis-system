<template>
  <div class="tab-bar">
    <el-row>
      <el-tabs v-model="ActiveName" type="border-card" @tab-click="handleClick">
        <el-tab-pane label="数据" name="first">
          <tab-data></tab-data>
        </el-tab-pane>
        <el-tab-pane label="可视化" name="second">
          <tab-visible></tab-visible>
        </el-tab-pane>
        <el-tab-pane label="分析报告" name="third">
          <tab-report></tab-report>
        </el-tab-pane>
        <el-tab-pane label="工具" name="fourth">
          <tab-tool></tab-tool>
        </el-tab-pane>
        <el-tab-pane label="关于" name="five">
          <tab-about></tab-about>
        </el-tab-pane>
      </el-tabs>
    </el-row>
  </div>
</template>

<script >
import TabData from "./child/TabData";
import TabReport from "./child/TabReport";
import TabVisible from "./child/TabVisible";
import TabAbout from "./child/TabAbout";
import TabTools from "./child/TabTools";
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState("MainPageSwitch", ["tabBarActiveName"]),
    ActiveName: {
      get: function () {
        return this.tabBarActiveName;
      },
      set: function (newValue) {
        this.$store.commit("MainPageSwitch/SET_TABBARACTIVENAME", newValue);
      },
    },
  },
  data() {
    return {};
  },
  components: {
    "tab-data": TabData,
    "tab-visible": TabVisible,
    "tab-report": TabReport,
    "tab-about": TabAbout,
    "tab-tool": TabTools,
  },
  methods: {
    handleClick(tab, event) {},
  },
};
</script>

<style scoped>
.tab-bar {
  height: 100px;
  box-sizing: border-box;
}
</style>