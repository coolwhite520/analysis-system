<template>
  <div class="titleBar" @dblclick="handleDbClick">
    <!-- 非定制logo，使用默认logo -->
    <div v-if="oemname === 'ff'">
      <el-row>
        <el-col :span="2">
          <el-tooltip placement="bottom">
            <div slot="content">
              <!-- <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-kaixin1"></use>
              </svg> -->
              <span style="font-size: 10px">放松一下眼睛</span>
            </div>

            <div class="logo iconfont" @click="handleClickStar">&#xe66a;</div>
          </el-tooltip>
        </el-col>
        <el-col class="colum" :span="18">
          <div class="titleContent">
            <span style="font-size: 25px">{{ defaultTitle }}</span>
          </div>
          <div v-if="currentViewName === 'main-page'" style="font-size: 10px; margin-top: 5px; color: white">
            <b>当前案件：</b>{{ caseBase.ajmc }}
          </div>
        </el-col>
        <el-col class="colum" :span="4">
          <div>
            <span class="opterationBtn iconfont">
              <el-tooltip content="待调单任务" placement="bottom">
                <span @click="handleClickNewAwaitTask" class="dbconfig"
                  v-if="currentViewName === 'main-page'">&#xe748;</span>
              </el-tooltip>
              <el-tooltip content="数据库设置" placement="bottom">
                <span @click="handleClickDbConfig" class="dbconfig">&#xe64f;</span>
              </el-tooltip>
              <el-tooltip content="返回首页" placement="bottom">
                <span @click="handleClickGotoHome" class="gohome">&#xe6fe;</span>
              </el-tooltip>
              <span @click="handleClickMin" class="min">&#xe60c;</span>
              <span @click="handleClickClose" class="close">&#xe634;</span>
            </span>
          </div>
          <div style="
              float: right;
              margin-top: 20px;
              font-size: 10px;
              margin-right: 10px;
            ">
            当前版本号：{{ softVersion }}
          </div>
          <div style="clear: both"></div>
          <div v-show="currentViewName === 'main-page'" style="float: right; margin-right: 10px">
            <el-button style="color: white; padding: 0" type="text" @click="handleClickShowTabBar" class="iconfont">{{
            showTabBarView ? "&#xe6da;" : "&#xe6dd;"
            }}</el-button>
          </div>
        </el-col>
      </el-row>
    </div>
    <!-- 定制logo -->
    <div v-else-if="oemname === 'JD'">
      <el-row>
        <el-col :span="2">
          <div style="margin-left: 10px">
            <el-tooltip placement="bottom">
              <div slot="content">
                <svg class="icon" aria-hidden="true">
                  <use xlink:href="#icon-kaixin1"></use>
                </svg>
                <span style="font-size: 10px">放松一下眼睛</span>
              </div>
              <div>
                <img class="logo" src="/static/logo/JD.png" alt="" height="50" @click="handleClickStar" />
              </div>
            </el-tooltip>
            <div v-if="currentViewName === 'main-page'" style="font-size: 10px; margin-top: 5px; color: #225ca6">
              <b>当前案件：</b>{{ caseBase.ajmc }}
            </div>
          </div>
        </el-col>
        <el-col class="colum" :span="18">&nbsp; </el-col>
        <el-col class="colum" :span="4">
          <div>
            <span class="opterationBtn iconfont">
              <el-tooltip content="待调单任务" placement="bottom">
                <span @click="handleClickNewAwaitTask" class="dbconfig"
                  v-if="currentViewName === 'main-page'">&#xe748;</span>
              </el-tooltip>
              <el-tooltip content="数据库设置" placement="bottom">
                <span @click="handleClickDbConfig" class="dbconfig">&#xe64f;</span>
              </el-tooltip>
              <el-tooltip content="返回首页" placement="bottom">
                <span @click="handleClickGotoHome" class="gohome">&#xe6fe;</span>
              </el-tooltip>
              <span @click="handleClickMin" class="min">&#xe60c;</span>
              <span @click="handleClickClose" class="close">&#xe634;</span>
            </span>
          </div>
          <div style="
              float: right;
              margin-top: 20px;
              font-size: 10px;
              margin-right: 10px;
            ">
            当前版本号：{{ softVersion }}
          </div>
          <div style="clear: both"></div>
          <div v-show="currentViewName === 'main-page'" style="float: right; margin-right: 10px">
            <el-button style="color: white; padding: 0" type="text" @click="handleClickShowTabBar" class="iconfont">{{
            showTabBarView ? "&#xe6da;" : "&#xe6dd;"
            }}</el-button>
          </div>
        </el-col>
      </el-row>
    </div>

    <div v-if="showStar">
      <div id="stars"></div>
      <div id="stars2"></div>
      <div id="stars3"></div>
    </div>
  </div>
</template>

<script>
const log = require("@/utils/log");
const fs = require("fs");
const path = require("path");
import awaitTask from "@/db/AwaitTask";
import { mapState } from "vuex";

export default {
  components: {},
  data() {
    return {
      oemname: require("../../../../package.json").oemname, // 是否是fanfu产品
      // oemname: "JD", // 是否是fanfu产品
      defaultTitle: require("../../../../package.json").description,
      showStar: false,
      softVersion: this.$electron.remote.getGlobal("softVersion"),
    };
  },
  mounted() { },
  computed: {
    ...mapState("MainPageSwitch", ["showTabBarView"]),
    ...mapState("AppPageSwitch", ["currentViewName", "contentViewHeight"]),
    ...mapState("ShowTable", ["tableDataList"]),
    ...mapState("CaseDetail", ["caseBase"]),
  },
  methods: {
    async handleClickNewAwaitTask() {
      try {
        console.log(this.caseBase.ajid);
        let { success, rows } = await awaitTask.QueryAwaitTaskInfo(
          this.caseBase.ajid
        );
        this.$store.commit("CaseDetail/SET_AWAITTASKLIST", rows);
        this.$store.commit("DialogPopWnd/SET_SHOWAWAITTASKDIALOGVISIBLE", true);
      } catch (e) {
        this.$message({
          message: e.message,
        });
      }
    },
    handleClickStar() {
      this.showStar = !this.showStar;
    },
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
      this.$store.commit("DataCollection/RESET_DATA_LIST");
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
  border-bottom: 1px solid #232b3b;
  /* box-shadow: 0px 1px 2px -1px #404e69; */
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
  font-size: 16px;
  margin-right: 10px;
  border-right: 1px solid gray;
  padding-right: 10px;
}

.dbconfig:hover {
  color: gray;
}

.gohome {
  font-size: 16px;
  margin-right: 10px;
  border-right: 1px solid gray;
  padding-right: 10px;
}

.min {
  margin-right: 5px;
}

.gohome:hover {
  color: gray;
}

.min:hover {
  color: green;
}

.close:hover {
  color: red;
}
</style>
