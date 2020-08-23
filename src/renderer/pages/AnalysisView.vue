<template>
  <div>
    <title-bar></title-bar>
    <div style="height:100px;"></div>
    <component :is="currentViewName"></component>
    <div style="height:20px;"></div>
    <div class="state-bar">
      <el-row v-if="exportProcessVisible">
        <el-progress :percentage="percentage" :color="customColor"></el-progress>
      </el-row>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import TitleBar from "@/pages/title/TitleBar";
import HomePage from "@/pages/home/HomePage";
import MainPage from "@/pages/main/MainPage";
export default {
  mounted() {
    let _this = this;
    this.$electron.ipcRenderer.on("export-one-file-proccess", (event, data) => {
      const { success, errormsg, percentage } = data;
      if (success && percentage) {
        _this.$store.commit("MainPageSwitch/SET_EXPORTPROCESSVISIBLE", true);
        _this.percentage = percentage;
      }
    });
    this.$electron.ipcRenderer.on("export-one-file-over", (event, data) => {
      _this.$store.commit("MainPageSwitch/SET_EXPORTPROCESSVISIBLE", false);
      _this.percentage = 0;
      _this.$notify({
        title: "成功",
        message: `文件导出成功!`,
        type: "success",
      });
    });
  },
  data() {
    return {
      percentage: 0,
      customColor: "#75d083",
    };
  },
  name: "App",
  components: {
    "title-bar": TitleBar,
    "home-page": HomePage,
    "main-page": MainPage,
  },
  computed: {
    ...mapState("AppPageSwitch", ["currentViewName"]),
    ...mapState("MainPageSwitch", ["exportProcessVisible"]),
  },
};
</script>

<style>
.state-bar {
  height: 20px;
  background: #1b2735;
  /* box-shadow: 5px 5px 10px 1px gray, -5px 5px 5px 2px rgba(255, 255, 255, 0.5); */
  position: fixed;
  z-index: 999;
  width: 100%;
  left: 0px;
  bottom: 0px;
}
</style>
