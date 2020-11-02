<template>
  <div class="main">
    <el-row class="dbConfigtitle">
      <el-col :span="23">
        <div
          class="iconfont"
          style="font-size: 30px; margin: 10px; float: left"
        >
          &#xe71a;
        </div>
        <div style="margin: 15px">数据库连接设置</div>
      </el-col>
      <el-col :span="1">
        <div style="float: right; margin: 15px">
          <span
            @click="handleClickClose"
            class="iconfont close"
            style="-webkit-app-region: no-drag; font-size: 12px"
            >&#xe634;</span
          >
        </div>
      </el-col>
    </el-row>
    <div v-if="showTestPage">
      <el-row style="margin-top: 30px">
        <el-form
          ref="form"
          v-loading="loading"
          :model="form"
          label-width="100px"
          label-position="right"
          size="mini"
        >
          <el-row>
            <el-col :span="4">&nbsp;</el-col>
            <el-col :span="14">
              <el-form-item label="数据库名称：">
                <el-input v-model="form.database" :disabled="true"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="4">&nbsp;</el-col>
            <el-col :span="14">
              <el-form-item label="ip地址：">
                <el-input v-model="form.host"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="4">&nbsp;</el-col>
            <el-col :span="14">
              <el-form-item label="端口号：">
                <el-input v-model="form.port"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="4">&nbsp;</el-col>
            <el-col :span="14">
              <el-form-item label="用户名：">
                <el-input v-model="form.user"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="4">&nbsp;</el-col>
            <el-col :span="14">
              <el-form-item label="密码：">
                <el-input v-model="form.password" show-password></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="6">&nbsp;</el-col>
            <el-col :span="18">
              <el-form-item size="mini">
                <el-button @click="handleClickTestConnOrSave" type="primary">
                  {{ !testConnSuccess ? "测试连接" : "保存设置" }}</el-button
                >
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <!-- <el-progress :percentage="100" status="success"></el-progress> -->
          </el-row>
        </el-form>
      </el-row>
    </div>
    <div v-else>
      <el-row style="text-align: center; margin-top: 40px">
        <div>
          <el-progress
            type="circle"
            :percentage="percentage"
            color="green"
          ></el-progress>
        </div>
        <div style="margin-top: 20px">
          <el-button
            type="primary"
            @click="handleClickInitDb"
            size="small"
            :loading="btnLoading"
            >一键初始化ff_db数据库</el-button
          >
        </div>
      </el-row>
    </div>
  </div>
</template>
<script>
const log = require("electron-log");
import { Pool } from "pg";
import { DbConfig } from "@/utils/config";
import { finished } from "stream";
import { resolve } from "dns";
import { rejects } from "assert";
const path = require("path");
const fs = require("fs");
const uuid = require("uuid");
const crypto = require("crypto"); //用来加密
const zlib = require("zlib"); //用来压缩
const shell = require("shelljs");
export default {
  beforeMount() {
    let config = new DbConfig();
    this.form = config.readDbConfig();
  },
  data() {
    return {
      btnLoading: false,
      percentage: 0,
      showTestPage: true,
      testConnSuccess: false,
      loading: false,
      form: {},
      enableSaveBtn: true,
    };
  },
  methods: {
    async existPostgresServer() {
      return new Promise((resolve, reject) => {
        let pool = new Pool(this.form);
        pool.connect((err) => {
          if (err) {
            log.info(err);
            resolve({ success: false, msg: err.message });
          } else {
            console.log("connected");
            resolve({ success: true, msg: "" });
          }
        });
      });
    },
    async setEnvParam(password) {
      try {
        const shell = require("shelljs");
        await shell.exec(`export PGPASSWORD="${password}"`, {
          silent: true,
        });
      } catch (e) {
        log.info(e.message);
      }
    },

    async execImportInitDb(vendorpath, tempPathFile) {
      return new Promise((resolve, reject) => {
        let cmd = "";
        let dumpFilePath = "";
        let { user, password, port } = this.form;
        if (process.platform === "win32") {
          dumpFilePath = path.join(vendorpath, process.platform, "psql.exe");
          if (!fs.existsSync(dumpFilePath)) {
            reject(`${dumpFilePath} not exist`);
          }
        } else if (process.platform === "darwin") {
          dumpFilePath = path.join(vendorpath, process.platform, "psql");
          if (!fs.existsSync(dumpFilePath)) {
            reject(`${dumpFilePath} not exist`);
          }
        } else {
          dumpFilePath = "psql";
        }
        if (user !== "")
          cmd = `"${dumpFilePath}"  -U ${user} -p ${port} -f "${tempPathFile}"`;
        else cmd = `"${dumpFilePath}"  -p ${port} -f "${tempPathFile}"`;
        console.log(cmd);
        shell.exec(
          cmd,
          { silent: true, async: true },
          (code, stdout, stderr) => {
            if (stderr) {
              reject(stderr);
            } else {
              resolve({ success: true });
            }
          }
        );
      });
    },
    async doDecryptFile(srcFilePath, desFilePath) {
      console.log(srcFilePath, desFilePath);
      return new Promise((resolve, reject) => {
        let writeableStream = fs.createWriteStream(desFilePath);
        let passwordEn = new Buffer(process.env.PASS || "password");
        let decryptStream = crypto.createDecipher("aes-256-cbc", passwordEn);
        let gzip = zlib.createGunzip(); //解压
        let readStream = fs.createReadStream(srcFilePath);
        readStream //读取
          .pipe(gzip) //解压
          .on("error", (err) => {
            reject(err);
          })
          .pipe(decryptStream) //解密
          .on("error", (err) => {
            reject(err);
          })
          .pipe(writeableStream)
          .on("finish", () => {
            //解压后的回调
            resolve({ success: true });
          })
          .on("error", (err) => {
            reject(err);
          });
      });
    },
    async createBaseDb(vendorPath, dbName) {
      return new Promise((resolve, reject) => {
        let cmd = "";
        let dumpFilePath = "";
        let { user, password, port } = this.form;
        if (process.platform === "win32") {
          dumpFilePath = path.join(
            vendorPath,
            process.platform,
            "createdb.exe"
          );
          if (!fs.existsSync(dumpFilePath)) {
            reject(`${dumpFilePath} not exist`);
          }
        } else if (process.platform === "darwin") {
          dumpFilePath = path.join(vendorPath, process.platform, "createdb");
          if (!fs.existsSync(dumpFilePath)) {
            reject(`${dumpFilePath} not exist`);
          }
        } else {
          dumpFilePath = "createdb";
        }
        if (user !== "")
          cmd = `"${dumpFilePath}" -h localhost -U ${user} -p ${port} ${dbName}`;
        else cmd = `"${dumpFilePath}" -h localhost -p ${port} ${dbName}`;
        console.log(cmd);
        shell.exec(
          cmd,
          { silent: true, async: true },
          (code, stdout, stderr) => {
            if (stderr) {
              reject(stderr);
            } else {
              resolve({ success: true });
            }
          }
        );
      });
    },
    async handleClickInitDb() {
      this.btnLoading = true;
      let loopSpan = 2000;
      let loop = setInterval((loopSpan) => {
        this.percentage++;
        if (this.percentage === 99) {
          clearInterval(loop);
        }
      }, loopSpan);
      //
      let vendorpath = this.$electron.remote.getGlobal("vendorPath");
      console.log(vendorpath);
      let tempPath = this.$electron.remote.app.getPath("temp");
      console.log(tempPath);
      let baseDbFilePath = path.join(vendorpath, "base", "base.dat");
      let tempPathFile = path.join(tempPath, uuid.v1());
      console.log(baseDbFilePath);
      if (!fs.existsSync(baseDbFilePath)) {
        clearInterval(loop);
        this.btnLoading = false;
        this.$message({
          message: `基本库文件-${baseDbFilePath}不存在！`,
        });
        return;
      } else {
        console.log("hahhahah");
      }
      try {
        await this.doDecryptFile(baseDbFilePath, tempPathFile);
        await this.createBaseDb(vendorpath, "ff_db");
        await this.execImportInitDb(vendorpath, tempPathFile);
        clearInterval(loop);
        this.percentage = 100;
        this.btnLoading = false;
      } catch (e) {
        this.$message({
          message: "发生错误",
        });
        clearInterval(loop);
        this.btnLoading = false;
        log.info(e);
      }
    },
    handleClickClose() {
      this.$electron.ipcRenderer.send("hide-db-config");
    },
    async handleClickTestConnOrSave() {
      this.loading = true;
      if (this.testConnSuccess) {
        let wnd = this.$electron.remote.getGlobal("dbConfigWindow");
        let result = await this.$electron.remote.dialog.showMessageBox(wnd, {
          type: "warning",
          title: "提示",
          message: `保存设置将会重新启动应用程序，您确定这样做吗？`,
          buttons: ["确定", "取消"],
          defaultId: 0,
        });
        if (result.response === 0) {
          let { user, password, database, port, host } = this.form;
          let config = new DbConfig();
          try {
            config.writeDbConfig({ user, host, database, password, port });
            this.$electron.ipcRenderer.send("hide-db-config");
            this.$electron.ipcRenderer.send("reloadApp");
          } catch (e) {
            log.error(e);
            this.$message.error({
              title: "错误",
              message: `数据保存错误：${e.message}`,
            });
          }
        }
      } else {
        let { success, msg } = await this.existPostgresServer();
        if (success) {
          this.$message({
            title: "成功",
            message: "数据库测试连接成功!请保存当前设置！",
            type: "success",
          });
          this.testConnSuccess = true;
        } else {
          if (msg.indexOf("ff_db") > 0 && msg.indexOf("does not exist") > 0) {
            this.$message.error({
              title: "错误",
              message:
                "数据库测试连接失败:" +
                msg +
                ",请进行基库初始化操作,即将为您跳转页面...",
              showClose: false,
            });
            setTimeout(() => {
              this.showTestPage = false;
            }, 1000);
          } else {
            this.$message.error({
              title: "错误",
              message: "数据库测试连接失败:" + msg,
              showClose: false,
            });
            log.info(msg);
          }
        }
      }

      // let db = new Pool(this.form);
      // try {
      //   await db.query("SET search_path TO icap_base");
      //   await db.query(
      //     "SELECT ID::int, PARENT_ID::int,NAME FROM st_location WHERE PARENT_ID = 0;"
      //   );
      //   // this.enableSaveBtn = true;
      //   this.$message({
      //     title: "成功",
      //     message: "数据库测试连接成功",
      //     type: "success",
      //   });
      // } catch (e) {
      //   // this.enableSaveBtn = false;
      //   this.$message.error({
      //     title: "错误",
      //     message: "数据库测试连接失败," + e.message,
      //     showClose: false,
      //   });
      // }
      this.loading = false;
    },
  },
};
</script>
<style scoped>
.dbConfigtitle {
  height: 50px;
  -webkit-user-select: none;
  -webkit-app-region: drag;
  background-color: beige;
  color: white;
  background: radial-gradient(
    ellipse at bottom,
    #384e6e 0%,
    hsl(231, 26%, 29%) 100%
  );
}
.main {
  background-color: white;
}
.close:hover {
  color: red;
  cursor: pointer;
}
</style>
