<template>
  <div
    style="-webkit-user-select: none; margin-top: 0px"
    ref="wrapper"
    v-loading.fullscreen.lock="loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
    <el-row>
      <el-col :span="3">
        <div
          style="
            margin-top: 10px;
            padding: 10px;
            text-align: center;
            color: #3c4e6b;
            box-shadow: 15px 0px 10px -15px #404e69;
          "
        >
          <div class="iconfont" style="font-size: 20px; color: white">
            &#xe60b;&nbsp;&nbsp;<b>时间轴</b>
          </div>
          <div style="font-size: 10px; margin-top: 20px">
            时间轴会在每次用户按下ctrl+s(保存的快捷键)时，记录下当前的操作数据以便后续进行下一步的分析。
          </div>
          <time-line-view></time-line-view>
        </div>
      </el-col>
      <el-col :span="21">
        <div style="margin-top: 20px">
          <div
            class="iconfont"
            style="font-size: 20px; text-align: center; color: white"
          >
            &#xe6ad;&nbsp;&nbsp;<b>案件面板</b>
          </div>
          <el-row style="margin-top: 20px">
            <el-col :span="6"> &nbsp; </el-col>
            <el-col :span="12" style="text-align: center">
              <el-button-group>
                <el-button
                  class="iconfont"
                  type="primary"
                  size="mini"
                  @click="handleClickNewCase"
                >
                  &#xe6a3; 新增案件
                </el-button>
                <el-button
                  class="iconfont"
                  type="primary"
                  size="mini"
                  @click="handleClickImportCase"
                  >&#xe61a; 导入案件</el-button
                >
                <el-button
                  class="iconfont"
                  type="danger"
                  size="mini"
                  @click="handleClickDeleteAllCase"
                  >&#xe652; 清空所有案件</el-button
                >
              </el-button-group>
            </el-col>
            <el-col :span="1">&nbsp;</el-col>
            <el-col :span="4">
              <el-input
                size="mini"
                placeholder="输入案件名称进行检索"
                prefix-icon="el-icon-search"
                v-model="inputAnjianName"
              ></el-input>
            </el-col>
            <el-col :span="1">&nbsp;</el-col>
          </el-row>
        </div>
        <div>
          <el-row>
            <el-col :span="1">&nbsp;</el-col>
            <el-col :span="22">
              <div style="height: 40px">&nbsp;</div>
              <component :is="currentViewName"></component>
            </el-col>
            <el-col :span="1">&nbsp;</el-col>
          </el-row>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapState } from "vuex";
import AnalysisTimeLine from "./child/AnalysisTimeLine";
import ShowExistCaseView from "./child/ShowExistCaseView";
import NewCaseView from "./child/NewCaseView";
import CaseDetailView from "./child/CaseDetailView";
import EditCaseView from "./child/EditCaseView";
import levelDb from "../../../level/leveldb";
import cases from "@/db/Cases";
const log = require("@/utils/log");
export default {
  data() {
    return {
      loading: false,
      inputAnjianName: "",
    };
  },
  watch: {
    inputAnjianName(newValue, oldValue) {
      this.$store.commit("Cases/SET_INPUT_VALUE", newValue);
    },
  },
  computed: {
    ...mapState("HomePageSwitch", ["currentViewName"]),
    ...mapState("AppPageSwitch", ["mainViewHeight"]),
  },
  components: {
    "new-case-view": NewCaseView,
    "show-exist-case-view": ShowExistCaseView,
    "case-detail-view": CaseDetailView,
    "edit-case-view": EditCaseView,
    "time-line-view": AnalysisTimeLine,
  },
  async mounted() {
    // let prefix = this.$electron.remote.getGlobal("levelPrefix");
    // let { success, list, msg } = await levelDb.find(prefix);
  },
  methods: {
    async handleClickDeleteAllCase() {
      let parent = this.$electron.remote.getGlobal("mainWindow");
      let result = await this.$electron.remote.dialog.showMessageBox(parent, {
        type: "warning",
        title: "关闭",
        message: `真的这么确定要删除所有案件？你将丢失所有数据，请慎重！`,
        buttons: ["确定", "取消"],
        defaultId: 0,
      });
      if (result.response === 0) {
        try {
          this.loading = true;
          await this.$store.dispatch("Cases/deleteAllCase");
          await this.$store.commit("ShowTable/CLEAR_TABLE_LIST");
          await this.$store.dispatch("Cases/getExistCaseAsync");
          this.$message({
            type: "success",
            message: "删除成功！",
          });
          this.loading = false;
        } catch (e) {
          this.$message.error({
            message: "删除错误：" + e.message,
          });
          this.loading = false;
        }
      } else {
        this.$message({
          type: "info",
          message: "已取消删除",
        });
      }
    },

    handleClickNewCase() {
      //this.currentViewName = "new-case-view";
      if (!global.pool) {
        this.$electron.ipcRenderer.send("show-db-config");
      } else {
        this.$store.commit("HomePageSwitch/SET_VIEW_NAME", "new-case-view");
      }
    },
    async handleClickImportCase() {
      if (!global.pool) {
        this.$electron.ipcRenderer.send("show-db-config");
        return;
      }
      let mainWindow = this.$electron.remote.getGlobal("mainWindow");
      let filePathList = await this.$electron.remote.dialog.showOpenDialogSync(
        mainWindow,
        {
          title: "数据导入",
          buttonLabel: "打开",
          filters: [{ name: "Files", extensions: ["dat"] }],
          properties: ["openFile"],
        }
      );
      if (typeof filePathList === "undefined") return;
      const shell = require("shelljs");
      const path = require("path");
      const fs = require("fs");
      const uuid = require("uuid");
      let cmd = "";
      let dumpFilePath = "";
      let vendorpath = this.$electron.remote.getGlobal("vendorPath");
      let { user, database, password, port } = this.$electron.remote.getGlobal(
        "dbCon"
      );
      console.log({ user, database, password, port });

      let tempPath = this.$electron.remote.app.getPath("temp");
      let tempPathFile = path.join(tempPath, uuid.v1());
      console.log(tempPathFile);
      if (process.platform === "win32") {
        dumpFilePath = path.join(vendorpath, "psql.exe");
        if (!fs.existsSync(dumpFilePath)) {
          this.$message.error({
            message: "dump 文件不存在。",
          });
          return;
        }
        shell.exec(`set PGPASSWORD=${password}`, {
          silent: true,
          async: false,
        });
        cmd = `"${dumpFilePath}" -d ${database} -U ${user} -f "${tempPathFile}"`;
      } else if (process.platform === "darwin") {
        dumpFilePath = path.join(vendorpath, "psql");
        if (!fs.existsSync(dumpFilePath)) {
          this.$message.error({
            message: "dump 文件不存在。",
          });
          return;
        }
        cmd = `"${dumpFilePath}" -d ${database} -f "${tempPathFile}"`;
      } else {
        dumpFilePath = "psql";
        cmd = `"${dumpFilePath}" -d ${database} -f "${tempPathFile}"`;
      }
      this.loading = true;

      const crypto = require("crypto"); //用来加密
      const zlib = require("zlib"); //用来压缩

      // const iconv = require("iconv-lite");
      // const through2 = require("through2");
      let writeableStream = fs.createWriteStream(tempPathFile);
      let passwordEn = new Buffer(process.env.PASS || "password");
      let decryptStream = crypto.createDecipher("aes-256-cbc", passwordEn);
      let gzip = zlib.createGunzip(); //解压
      let readStream = fs.createReadStream(filePathList[0]);
      let importAjid = (await cases.QueryCaseMaxCount()) + 1;
      try {
        readStream //读取
          .pipe(gzip) //解压
          .on("error", (err) => {
            console.log(err);
            this.$message({
              message: "载入失败:" + err.message,
              type: "error",
            });
            this.loading = false;
          })
          .pipe(decryptStream) //解密
          .on("error", (err) => {
            console.log(err);
            this.$message({
              message: "载入失败:" + err.message,
              type: "error",
            });
            this.loading = false;
          })
          // .pipe(
          //   through2(function (chunk, enc, callback) {
          //     //每个表都有ajid的数据，怎么搞？先不搞了，没法全局替换每个导出表中的ajid
          //     chunk = iconv.decode(chunk, "UTF-8");
          //     chunk = chunk.replace(/icap_[0-9]+/gi, `icap_${importAjid}`);
          //     chunk = chunk.replace(/\$AJID_REPLACE\$/g, `${importAjid}`);
          //     this.push(Buffer.from(chunk));
          //     callback();
          //   })
          // )
          .pipe(writeableStream)
          .on("finish", async () => {
            //解压后的回调
            console.log("done");

            console.log(cmd);

            shell.exec(
              cmd,
              { silent: true, async: true },
              async (code, stdout, stderr) => {
                if (stderr) {
                  this.$message({
                    message: "载入失败, 存在相同的案件信息！",
                    type: "error",
                  });
                  this.loading = false;
                } else {
                  this.$message({
                    message: "载入成功",
                    type: "success",
                  });
                  // 写入到base库的st_case表中
                  await this.$store.dispatch("Cases/getExistCaseAsync");
                  fs.unlinkSync(tempPathFile);
                  this.loading = false;
                }
              }
            );
            // let ajid = (await cases.QueryCaseMaxCount()) + 1;
            // let scheamName = await cases.CreateNewCaseSchema(ajid, "panda");
          })
          .on("error", (err) => {
            console.log(err);
            this.$message({
              message: "载入失败",
              type: "error",
            });
            this.loading = false;
          });
      } catch (e) {
        this.$message({
          message: "载入失败" + e.message,
          type: "error",
        });
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.sysBtnStyle:hover {
  box-shadow: #1b2735 10px 10px 30px 5px;
}
.timeLineContainer {
  text-align: center;
  color: #3c4e6b;
  border-right: 1px solid #dddfe5;
}
</style>
