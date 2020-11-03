<template>
  <div class="titleBar" @dblclick="handleDbClick">
    <el-row>
      <el-col :span="2">
        <div class="logo iconfont">&#xe66a;</div>
      </el-col>
      <el-col class="colum" :span="18">
        <div class="titleContent">
          <span style="font-size: 25px"><b>FanFu</b>-资金流分析系统</span>
        </div>
      </el-col>
      <el-col class="colum" :span="4">
        <div>
          <span class="opterationBtn iconfont">
            <el-tooltip content="数据库连接设置" placement="bottom">
              <span @click="handleClickDbConfig" class="dbconfig"
                >&#xe71a;</span
              >
            </el-tooltip>
            <el-tooltip content="返回首页" placement="bottom">
              <span @click="handleClickGotoHome" class="gohome">&#xe6fe;</span>
            </el-tooltip>
            <span @click="handleClickMin" class="min">&#xe60c;</span>
            <span @click="handleClickClose" class="close">&#xe634;</span>
          </span>
        </div>
        <div
          style="
            float: right;
            margin-top: 20px;
            font-size: 10px;
            margin-right: 10px;
          "
        >
          当前版本号：{{ softVersion }}
        </div>
        <div style="clear: both"></div>
        <div
          v-show="currentViewName === 'main-page'"
          style="float: right; margin-right: 10px"
        >
          <el-button
            style="color: white; padding: 0"
            type="text"
            @click="handleClickShowTabBar"
            class="iconfont"
            >{{ showTabBarView ? "&#xe6da;" : "&#xe6dd;" }}</el-button
          >
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
const log = require("@/utils/log");
const fs = require("fs");
const path = require("path");
import { mapState } from "vuex";
export default {
  components: {},
  data() {
    return {
      softVersion: this.$electron.remote.getGlobal("softVersion"),
    };
  },
  mounted() {},
  computed: {
    ...mapState("MainPageSwitch", ["showTabBarView"]),
    ...mapState("AppPageSwitch", ["currentViewName", "contentViewHeight"]),
    ...mapState("ShowTable", ["tableDataList"]),
  },
  methods: {
    handleClickShowTabBar() {
      if (this.showTabBarView) {
        let newContentViewHeight = this.contentViewHeight + 100; // titelbar tabbar footbar lineheight
        this.$store.commit(
          "AppPageSwitch/SET_CONTENT_VIEW_HEIGHT",
          newContentViewHeight
        );
        this.$store.commit("MainPageSwitch/SET_SHOWTABBARVIEW", false);
      } else {
        let newContentViewHeight = this.contentViewHeight - 100;
        this.$store.commit(
          "AppPageSwitch/SET_CONTENT_VIEW_HEIGHT",
          newContentViewHeight
        );
        this.$store.commit("MainPageSwitch/SET_SHOWTABBARVIEW", true);
      }
    },
    handleDbClick() {
      this.$electron.ipcRenderer.send("move-to-zero");
    },
    async handleClickGotoHome() {
      // 判断当前页面
      if (this.currentViewName === "main-page") {
        let result = await this.$electron.remote.dialog.showMessageBox(null, {
          type: "warning",
          title: "注意",
          message: `返回主页面将丢失当前的操作数据，您确定这样做吗？如有重要数据建议您先进行保存（ctrl+s)`,
          buttons: ["确定", "取消"],
          defaultId: 0,
        });
        if (result.response !== 0) {
          return;
        }
      }
      this.$store.commit(
        "HomePageSwitch/SET_VIEW_NAME",
        "show-exist-case-view"
      );
      this.$store.commit("ShowTable/CLEAR_TABLE_LIST");
      this.$store.commit("AppPageSwitch/SET_VIEW_NAME", "home-page");
    },
    handleClickMin() {
      this.$electron.ipcRenderer.send("window-min");
    },
    async handleClickClose() {
      let result = await this.$electron.remote.dialog.showMessageBox(null, {
        type: "warning",
        title: "关闭",
        message: `是否保存当前所有操作？`,
        buttons: ["保存", "不保存", "取消"],
        defaultId: 0,
        cancelId: 5,
      });
      console.log(result);
      let _this = this;
      if (result.response === 0) {
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
        await checkSaveOver();
        if (global.pool) {
          console.log(
            global.pool.totalCount,
            global.pool.idleCount,
            global.pool.waitingCount
          );
          global.pool.end();
        }
        this.$electron.ipcRenderer.send("window-close");
      } else if (result.response === 1) {
        // 删除本地的状态文件restore.db
        let resoreDbPath = this.$electron.remote.getGlobal("resoreDbPath");
        let pathFileName = path.join(resoreDbPath, "restore.db");

        fs.unlinkSync(pathFileName);
        if (global.pool) {
          console.log(
            global.pool.totalCount,
            global.pool.idleCount,
            global.pool.waitingCount
          );
          global.pool.end();
        }
        this.$electron.ipcRenderer.send("window-close");
      } else if (result.response === 2) {
      }
    },
    handleClickDbConfig() {
      this.$store.commit("DialogPopWnd/SET_DBCONFIGVISIBLE", true);
    },
  },
};
</script>

<style scoped>
.titleBar {
  /* 384e6e */
  /* #1b2735 这个是深色 */
  color: #fff;
  height: 100px;

  /* -webkit-app-region: drag; */
  -webkit-user-select: none;
  position: fixed;
  z-index: 999;
  width: 100%;
  left: 0px;
  top: 0px;
  /* background: #1b2735; */
  /* border-bottom: 1px solid #404e69; */
  box-shadow: 0px 15px 10px -15px #404e69;
  /* background: radial-gradient(ellipse at bottom, #384e6e 0%, #090a0f 100%); */

  /* box-shadow: 5px 5px 10px 1px gray, -5px 5px 5px 2px rgba(255, 255, 255, 0.5); */
}

.logo {
  font-size: 70px;
  text-align: center;
  margin-top: 15px;
}

.titleContent {
  margin-top: 25px;
  font-size: 20px;
  text-align: left;
}
.opterationBtn {
  display: block;
  font-size: 15px;
  text-align: right;
  margin-top: 10px;
  margin-right: 10px;
  color: white;
  -webkit-app-region: no-drag;
}
.dbconfig {
  font-size: 28px;
  margin-right: 10px;
  border-right: 1px solid gray;
  padding-right: 10px;
}
.dbconfig:hover {
  color: gray;
  cursor: pointer;
}
.gohome {
  font-size: 25px;
  margin-right: 10px;
  border-right: 1px solid gray;
  padding-right: 10px;
}
.min {
  margin-right: 5px;
}

.gohome:hover {
  cursor: pointer;
  color: gray;
}
.min:hover {
  color: green;
  cursor: pointer;
}
.close:hover {
  color: red;
  cursor: pointer;
}
</style>
