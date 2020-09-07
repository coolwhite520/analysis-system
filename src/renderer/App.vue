<template>
  <div id="app">
    <keep-alive>
      <router-view />
    </keep-alive>
  </div>
</template>

<script>
import { DbConfig } from "@/utils/config";
import { Pool } from "pg";

export default {
  name: "App",
  data() {
    return {
      update: true,
    };
  },
  methods: {
    reload() {
      // 移除组件
      this.update = false;
      this.$nextTick(() => {
        this.update = true;
      });
    },
  },
  async mounted() {
    let _this = this;
    this.$electron.ipcRenderer.on("reloadApp", function () {
      // _this.$router.go(0); //界面会变白，并且闪烁
      _this.$electron.remote.app.relaunch();
      _this.$electron.remote.app.exit(0);
    });
    // 设置主区域的height
    let height = this.$electron.remote.getGlobal("height");
    let MainViewHeight = height - 100 - 20; // titelbar footbar
    let ContentViewHeight = MainViewHeight - 120; // 减去 tabbars的高度
    this.$store.commit("AppPageSwitch/SET_MAIN_VIEW_HEIGHT", MainViewHeight);
    this.$store.commit(
      "AppPageSwitch/SET_CONTENT_VIEW_HEIGHT",
      ContentViewHeight
    );
    let config = new DbConfig();
    let dbCon = config.readDbConfig();
    try {
      global.db = new Pool(dbCon);
      await this.$store.dispatch("PublicList/getAJLBList");
      await this.$store.dispatch("PublicList/getZCJDMClist");
      await this.$store.dispatch("PublicList/getProvincelist");
    } catch (e) {
      global.db = null;
      this.$electron.ipcRenderer.send("show-db-config");
    }
  },
};
</script>

<style>
/* CSS */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
/* ::-webkit-scrollbar {
  display: none;
} */
:focus {
  outline: 0;
}
</style>
