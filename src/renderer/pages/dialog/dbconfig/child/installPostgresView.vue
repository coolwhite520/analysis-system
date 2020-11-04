<template>
  <div style="text-align: center">
    <h3>如果您没有安装数据库服务，那么请点击下面的按钮进行安装。</h3>
    <div style="margin-top: 20px; text-align: center">
      <el-button
        @click="handleClickInstallPostgres"
        type="primary"
        :loading="loading"
        >启动数据库安装程序</el-button
      >
    </div>
  </div>
</template>

<script>
const path = require("path");
const fs = require("fs");
const uuid = require("uuid");
const crypto = require("crypto"); //用来加密
const zlib = require("zlib"); //用来压缩
const shell = require("shelljs");
const { spawn } = require("child_process");
export default {
  data() {
    return {
      loading: false,
    };
  },
  methods: {
    async handleClickInstallPostgres() {
      this.loading = true;

      let vendorPath = this.$electron.remote.getGlobal("vendorPath");
      let tempPath = this.$electron.remote.app.getPath("temp");
      let strFilePath = path.join(
        vendorPath,
        process.platform,
        "extend",
        "pg.dat"
      );

      if (process.platform === "win32") {
        if (fs.existsSync(strFilePath)) {
          try {
            let strDesFilePath = path.join(tempPath, uuid.v1() + ".exe");
            await this.doDecryptFile(strFilePath, strDesFilePath);
            this.loading = false;
            await this.$electron.shell.openPath(strDesFilePath);
          } catch (e) {
            this.$message({
              message: e.message,
            });
            this.loading = false;
          }
        } else {
          this.$message({
            message: "没有找到扩展程序路径",
          });
          this.loading = false;
        }
      } else if (process.platform === "darwin") {
        if (fs.existsSync(strFilePath)) {
          try {
            let strDesFilePath = path.join(tempPath, uuid.v1() + ".dmg");
            await this.doDecryptFile(strFilePath, strDesFilePath);
            this.loading = false;
            await this.$electron.shell.openPath(strDesFilePath);
          } catch (e) {
            this.$message({
              message: e.message,
            });
            this.loading = false;
          }
        } else {
          this.$message({
            message: "没有找到扩展程序路径",
          });
          this.loading = false;
        }
      } else {
        this.$message({
          message: "没有找到扩展程序路径",
        });
        this.loading = false;
      }
    },

    async doDecryptFile(srcFilePath, desFilePath) {
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
  },
};
</script>