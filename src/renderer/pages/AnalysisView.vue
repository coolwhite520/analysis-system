<template>
  <div v-loading="loading" :element-loading-text="loadingText">
    <title-bar></title-bar>
    <!-- <el-image v-if="imgPath" class="table-td-thumb" :src="imgPath"></el-image> -->
    <save-dialog
      v-if="showSaveProjectVisible"
      v-on:confirmSaveProject="confirmSaveProject"
      :screenShotTmpFilePathName="screenShotTmpFilePathName"
    ></save-dialog>
    <div style="height: 100px"></div>
    <component :is="currentViewName"></component>
    <div style="height: 20px"></div>
    <div class="state-bar" :style="{ top: stateBarTop - 20 + 'px' }">
      <el-row v-if="exportProcessVisible">
        <el-progress
          :percentage="percentage"
          :color="customColor"
        ></el-progress>
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
import SaveProjectView from "@/pages/dialog/save/SaveCurrentProject.vue";
import levelDb from "../../level/leveldb";
import { Pool, Client } from "pg";
import base from "@/db/Base.js";
import { promises, resolve } from "dns";
const log = require("electron-log");
const fs = require("fs");
const path = require("path");
const uuid = require("uuid");
const screenshot = require("screenshot-desktop");
export default {
  async mounted() {
    let _this = this;

    this.$electron.ipcRenderer.on("save-state", async (event, data) => {
      let tempPath = this.$electron.remote.app.getPath("temp");
      console.log(tempPath);
      tempPath = path.join(tempPath, uuid.v1());
      fs.mkdirSync(tempPath);
      let { filePathName } = await this.makeScreenShot(tempPath);
      this.screenShotTmpPath = tempPath;
      this.screenShotTmpFilePathName = filePathName;
      this.$store.commit("DialogPopWnd/SET_SHOWSAVEPROJECTVISIBLE", true);
    });

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
      // 创建聚合函数
      await base.CreateAggregateFunction();
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
      // imgPath: "",
      loading: false,
      loadingText: "",
      screenShotTmpFilePathName: "",
      screenShotTmpPath: "",
    };
  },
  name: "App",
  components: {
    "title-bar": TitleBar,
    "home-page": HomePage,
    "main-page": MainPage,
    "save-dialog": SaveProjectView,
  },
  computed: {
    ...mapState("AppPageSwitch", ["currentViewName"]),
    ...mapState("MainPageSwitch", ["exportProcessVisible"]),
    ...mapState("ShowTable", ["tableDataList"]),
    ...mapState("DialogPopWnd", ["showSaveProjectVisible"]),
  },
  methods: {
    delDir(path) {
      let files = [];
      if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach((file, index) => {
          let curPath = path + "/" + file;
          if (fs.statSync(curPath).isDirectory()) {
            delDir(curPath); //递归删除文件夹
          } else {
            fs.unlinkSync(curPath); //删除文件
          }
        });
        fs.rmdirSync(path); // 删除文件夹自身
      }
    },
    async confirmSaveProject(obj) {
      let { confirm, title, des } = obj;
      if (confirm) {
        await this.saveCurrentAppState({ title, des });
        this.$bus.$emit("FreshTimeLineView");
      } else {
        this.delDir(this.screenShotTmpPath);
        this.screenShotTmpFilePathName = "";
        this.screenShotTmpPath = "";
      }
    },
    async makeScreenShot(shotPath) {
      return new Promise((resolve, reject) => {
        let filePathName = path.join(shotPath, "screenShot.png");
        screenshot({
          format: "png",
          filename: filePathName,
        })
          .then((img) => {
            resolve({ success: true, filePathName });
          })
          .catch((err) => {
            reject({ success: false, err, filePathName });
          });
      });
    },
    async convertToBase64Image(fileUrl) {
      const imageData = fs.readFileSync(fileUrl); // 例：xxx/xx/xx.png
      const imageBase64 = imageData.toString("base64");
      const imagePrefix = "data:image/png;base64,";
      return imagePrefix + imageBase64;
    },
    async saveGraphData() {
      let _this = this;
      let graphCount = 0;
      for (let tableData of this.tableDataList) {
        if (tableData.hasOwnProperty("graphid")) {
          console.log(tableData.graphid);
          this.$bus.$emit("saveGraphData", { graphid: tableData.graphid });
          graphCount++;
        }
      }
      async function checkSaveOver() {
        let count = 0;
        for (let tableData of _this.tableDataList) {
          if (
            tableData.hasOwnProperty("saveRelationGraphDataOk") &&
            tableData.saveRelationGraphDataOk
          ) {
            count++;
          }
        }
        if (count !== graphCount) {
          await new Promise((resolve, reject) => {
            setTimeout(function () {
              resolve("done");
            }, 100);
          });
          return await checkSaveOver();
        }
        return true;
      }
    },
    async copyFile(filePathSrc, filePathDes) {
      return new Promise((resolve, reject) => {
        let file = fs.createReadStream(filePathSrc);
        let out = fs.createWriteStream(filePathDes);
        file
          .pipe(out)
          .on("finish", () => {
            resolve("done");
          })
          .on("error", (err) => {
            reject(err);
          });
      });
    },
    async saveCurrentAppState({ title, des }) {
      if (!this.loading) {
        try {
          this.loading = true;
          this.loadingText = "正在进行保存，请稍后...";
          let resoreDbPath = this.$electron.remote.getGlobal("resoreDbPath");
          let now = new Date();
          let nowStr = now.Format("yyyy-MM-dd_hh_mm_ss");
          let nowTimeStr = now.Format("yyyy-MM-dd hh:mm:ss");
          let newDbPath = path.join(resoreDbPath, nowStr);
          if (!fs.existsSync(newDbPath)) {
            fs.mkdirSync(newDbPath, { recursive: true });
          }
          let dbPathFile = path.join(newDbPath, "restore.db");
          await this.saveGraphData();
          await this.copyFile(
            path.join(resoreDbPath, "restore.db"),
            dbPathFile
          );
          let screenShotDesPath = path.join(newDbPath, "screenShot.png");
          await this.copyFile(
            this.screenShotTmpFilePathName,
            screenShotDesPath
          );
          let prefix = this.$electron.remote.getGlobal("levelPrefix");
          let key = prefix + nowStr;
          let valueObj = {
            dbPath: newDbPath,
            dbPathFile,
            screenShotPath: screenShotDesPath,
            time: nowTimeStr,
            timestamp: now.valueOf(),
            title,
            des,
          };
          this.delDir(this.screenShotTmpPath);
          await levelDb.set(key, valueObj);
          this.$notify({
            title: "成功",
            message: "分析记录保存成功，可返回首页进行查看",
            type: "success",
          });
          this.loading = false;
        } catch (e) {
          this.$notify.error({
            title: "失败",
            message: "分析记录保存失败，错误信息:" + e.message,
          });
          this.loading = false;
        }
      }
    },
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
