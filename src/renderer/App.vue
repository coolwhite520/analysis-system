<template>
  <div id="app">
    <keep-alive>
      <router-view />
    </keep-alive>
  </div>
</template>

<script>
import { DbConfig, OtherConfig } from "@/utils/config";
import { Pool, Client } from "pg";
import base from "@/db/Base.js";
import log from "electron-log";
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
    let MainViewHeight = height - 120; // titelbar footbar
    let ContentViewHeight = MainViewHeight - 100; // 减去 tabbars的高度
    this.$store.commit(
      "AppPageSwitch/SET_CONTENT_VIEW_HEIGHT",
      ContentViewHeight
    );
    this.$store.commit("AppPageSwitch/SET_MAIN_VIEW_HEIGHT", MainViewHeight);
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
      global.pool = pool;
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
};
</script>

<style>
/* CSS */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
::-webkit-scrollbar {
  display: none;
}
:focus {
  outline: 0;
}
</style>
