<template>
  <div class="tab-bar">
    <el-row>
      <el-tabs v-model="activeName" type="border-card" @tab-click="handleClick">
        <el-tab-pane label="数据" name="first">
          <tab-data></tab-data>
        </el-tab-pane>
        <el-tab-pane label="可视化" name="second">
          <!-- <tab-visible></tab-visible> -->
        </el-tab-pane>
        <el-tab-pane label="分析报告" name="third">角色管理</el-tab-pane>
        <el-tab-pane label="关于" name="fourth">定时任务补偿</el-tab-pane>
      </el-tabs>
    </el-row>
  </div>
</template>

<script >
import TabData from "./child/TabData";
import TabVisible from "./child/TabVisible";
export default {
  data() {
    return {
      activeName: "first",
    };
  },
  components: {
    "tab-data": TabData,
    "tab-visible": TabVisible,
  },
  methods: {
    handleClick(tab, event) {
      console.log(tab, event);
    },
  },
};
</script>

<style scoped>
.tab-bar {
  height: 120px;
  box-sizing: border-box;
}
</style>