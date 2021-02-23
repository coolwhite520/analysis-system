<template>
  <div
    style="margin-top: 20px; padding-bottom: 40px"
    v-loading.fullscreen.lock="loading"
    :element-loading-text="loadingText"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
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
            round
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
            round
            >&#xe652; 清空所有案件</el-button
          >
          <el-button
            v-if="false"
            class="iconfont"
            type="danger"
            size="mini"
            @click="handleClickModifydatarules"
            round
            >&#xe652; 修改datarules加密字段中包含gas前缀</el-button
          >
          <el-button
            v-if="false"
            class="iconfont"
            type="danger"
            size="mini"
            @click="handleClickModifyTemplate"
            round
            >&#xe652; 修改Template加密字段中包含gas前缀</el-button
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
</template>

<script>
const shell = require("shelljs");
const path = require("path");
const fs = require("fs");
const uuid = require("uuid");
import { mapState } from "vuex";

import cases from "@/db/Cases";
import base from "@/db/Base";
const log = require("@/utils/log");
import aes from "@/utils/aes";
export default {
  data() {
    return {
      loading: false,
      inputAnjianName: "",
      loadingText: "数据导入中，请稍后...",
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
  components: {},
  async mounted() {
    shell.config.execPath = shell.which("node").toString();
  },
  methods: {
    async handleClickModifydatarules() {
      try {
        let sql = `SELECT tid, gpsqltemplate_select, gpsqltemplate_update from mz_datarules;`;
        let ret = await base.QueryCustom(sql);
        for (let row of ret.rows) {
          if (row.gpsqltemplate_select) {
            let dec = aes.decrypt(row.gpsqltemplate_select);
            dec = dec.replace(/gas_/gi, "mz_");
            let newValue = aes.encrypt(dec);
            let update = `update mz_datarules set gpsqltemplate_select='${newValue}' where tid=${row.tid}`;
            await base.QueryCustom(update);
          }
          if (row.gpsqltemplate_update) {
            let dec = aes.decrypt(row.gpsqltemplate_update);
            dec = dec.replace(/gas_/gi, "mz_");
            let newValue = aes.encrypt(dec);
            let update = `update mz_datarules set gpsqltemplate_update='${newValue}' where tid=${row.tid}`;
            await base.QueryCustom(update);
          }
        }
        console.log("ok");
      } catch (e) {
        console.log(e);
      }
    },
    async handleClickModifyTemplate() {
      try {
        let sql = `SELECT mid, gpsqltemplate from layout_model_info;`;
        let ret = await base.QueryCustom(sql);
        console.log("sum:", ret.rows.length);
        let count = 0;
        for (let row of ret.rows) {
          if (row.gpsqltemplate) {
            let dec = aes.decrypt(row.gpsqltemplate);
            if (/gas_/i.test(dec)) {
              count++;
              dec = dec.replace(/gas_/gi, "mz_");
              let newValue = aes.encrypt(dec);
              let update = `update layout_model_info set gpsqltemplate='${newValue}' where mid=${row.mid}`;
              await base.QueryCustom(update);
            }
          }
        }
        console.log("ok count:", count);
      } catch (e) {
        console.log(e);
      }
    },
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
          this.$store.commit(
            "HomePageSwitch/SET_VIEW_NAME",
            "show-exist-case-view"
          );
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
      if (!global.pool) {
        this.$store.commit("DialogPopWnd/SET_DBCONFIGVISIBLE", true);
      } else {
        this.$store.commit("HomePageSwitch/SET_VIEW_NAME", "new-case-view");
      }
    },

    async handleClickImportCase() {
      if (!global.pool) {
        this.$store.commit("DialogPopWnd/SET_DBCONFIGVISIBLE", true);
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

      let dumpFilePath = "";
      let vendorPath = this.$electron.remote.getGlobal("vendorPath");
      let { user, database, password, port } = this.$electron.remote.getGlobal(
        "dbCon"
      );
      console.log({ user, database, password, port });
      let tempPath = this.$electron.remote.app.getPath("temp");
      let tempPathFile = path.join(tempPath, uuid.v1());
      let fileName = "psql";
      let envParam = "";
      if (process.platform === "win32") {
        fileName += ".exe";
        envParam = `set PGPASSWORD=${password}`;
        dumpFilePath = path.join(vendorPath, process.platform, fileName);
      } else if (process.platform === "darwin") {
        dumpFilePath = path.join(vendorPath, process.platform, "bin", fileName);
        envParam = `export PGPASSWORD=${password}`;
      } else if (process.platform === "linux") {
        dumpFilePath = fileName;
        envParam = `export PGPASSWORD=${password}`;
      }
      // 判断文件是否存在
      if (process.platform !== "linux") {
        if (!fs.existsSync(dumpFilePath)) {
          this.$message({
            message: "执行文件不存在",
          });
          return;
        }
      }
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
          .pipe(writeableStream)
          .on("finish", async () => {
            //解压后的回调
            console.log("done");
            let cmd =
              password.trim().length > 0
                ? `${envParam}&&"${dumpFilePath}" -d ${database} -U ${user} -p ${port} -f "${tempPathFile}"`
                : `"${dumpFilePath}" -d ${database} -U ${user} -p ${port} -f "${tempPathFile}"`;
            this.loading = true;
            if (process.platform === "win32") {
              let batFilePath = path.join(tempPath, uuid.v1() + ".bat");
              cmd = cmd.replace("&&", "\r\n");
              fs.writeFileSync(batFilePath, cmd);
              cmd = batFilePath;
            }
            console.log(cmd);
            shell.exec(
              cmd,
              { silent: true, async: true },
              async (code, stdout, stderr) => {
                if (stderr) {
                  this.$message({
                    message: "载入失败:" + stderr,
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
                  if (process.platform === "win32") {
                    fs.unlinkSync(cmd);
                  }
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
