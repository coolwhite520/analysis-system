<template>
  <div>
    <title-bar></title-bar>
    <div style="height:100px;"></div>
    <component :is="currentViewName"></component>
    <div style="height:20px;"></div>
    <div class="state-bar" :style="{ top: stateBarTop - 20 + 'px'}">
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
import { DbConfig, OtherConfig } from "@/utils/config";
import { Pool, Client } from "pg";
import base from "@/db/Base.js";
const log = require("electron-log");
export default {
  async mounted() {
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
    this.$electron.ipcRenderer.on("reloadApp", function () {
      _this.$electron.remote.app.relaunch();
      _this.$electron.remote.app.exit(0);
    });
    // 设置主区域的height
    let height = this.$electron.remote.getGlobal("height");
    let MainViewHeight = height - 120; // titelbar footbar
    let ContentViewHeight = MainViewHeight - 100; // 减去 tabbars的高度
    this.$store.commit(
      "AppPageSwitch/SET_CONTENT_VIEW_HEIGHT",
      ContentViewHeight
    );
    this.$store.commit("AppPageSwitch/SET_MAIN_VIEW_HEIGHT", MainViewHeight);
    this.stateBarTop = height;
    try {
      let dbconfig = new DbConfig();
      let dbCon = dbconfig.readDbConfig();
      let pool = new Pool(dbCon);
      let connFlag = await new Promise(function (resolve, reject) {
        pool.connect((err) => {
          if (err) {
            log.info(err);
            reject(false);
          } else {
            console.log("connected");
            resolve(true);
          }
        });
      });
      // 判断是否连接到了Postgres
      if (!connFlag) {
        this.$electron.ipcRenderer.send("show-db-config");
        return;
      }
      // global.pool = pool;
      // 发送消息存储pool全局的pool
      let msg = await this.$electron.ipcRenderer.sendSync(
        "set-global-pool-config",
        {
          dbCon,
        }
      );
      log.info(msg);
      global.pool = new Pool(await this.$electron.remote.getGlobal("dbCon"));
      await this.$store.dispatch("PublicList/getAJLBList");
      await this.$store.dispatch("PublicList/getZCJDMClist");
      await this.$store.dispatch("PublicList/getProvincelist");
      await this.$store.dispatch("Cases/getExistCaseAsync");
    } catch (e) {
      global.pool = null;
      this.$electron.ipcRenderer.send("show-db-config");
      console.log(e);
    }
  },
  data() {
    return {
      stateBarTop: 0,
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
}
</style>
