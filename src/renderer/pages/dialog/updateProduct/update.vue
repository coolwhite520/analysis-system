<template>
  <el-dialog
    v-dialogDrag
    :close-on-click-modal="false"
    class="standard-data-dialog"
    :append-to-body="true"
    :visible="showUpdateVisible"
    width="25%"
    @close="handleClose"
    :modal="true"
  >
    <div slot="title" class="dialog-title">
      <i class="iconfont" style="color: white; font-size: 30px">&#xe62d;</i>
      <span class="title-text" style="color: white">{{ title }}</span>
      <div class="button-right">
        <span class="title-close" @click="handleClose"></span>
      </div>
    </div>
    <div
      style="text-align: center; margin-top: 10px; font-size: 10px"
      v-if="loading"
    >
      <div v-loading="loading" element-loading-spinner="el-icon-loading"></div>
    </div>
    <div style="text-align: center; font-size: 10px">
      {{ checkMsg }}
      <el-button
        v-if="stateCode === -1"
        size="mini"
        type="text"
        @click="handleClickShowFile"
        >查看错误信息</el-button
      >
    </div>
    <div style="text-align: center; margin-top: 10px; font-size: 10px">
      <el-button
        v-if="stateCode === -1"
        size="mini"
        type="primary"
        @click="handleClickReCheck"
        style="width: 90%"
        >重新检测</el-button
      >
    </div>
    <div style="text-align: center; margin-top: 10px" v-if="percentage > 0">
      <el-progress :percentage="percentage" type="circle"></el-progress>
    </div>
    <div v-if="downloadSuccess" style="text-align: center">
      <div style="font-size: 10px; margin-bottom: 5px">
        {{
          newVersion
        }}新版本的安装包下载完毕，请先选择授权文件的导出路径，以免授权丢失。
      </div>
      <div>
        <el-input
          :disabled="true"
          v-model="licenseExportFilePath"
          size="mini"
          placeholder="请输入授权导出路径"
          style="width: 70%"
        ></el-input>
        <el-button size="mini" type="primary" @click="handleClickBrowser"
          >浏览</el-button
        >
        <el-button
          size="mini"
          style="width: 90%; margin-top: 20px"
          type="primary"
          @click="handleClickInstallNew"
          >安装新版本</el-button
        >
      </div>
    </div>
  </el-dialog>
</template>
<script>
import { mapState } from "vuex";
const fs = require("fs");
const path = require("path");

export default {
  computed: {
    ...mapState("DialogPopWnd", ["showUpdateVisible"]),
  },
  data() {
    return {
      title: "升级检测",
      checkMsg: "",
      percentage: 0,
      loading: true,
      stateCode: -999,
      logPath: "",
      newVersion: "",
      downloadSuccess: false,
      releaseNotes: "",
      releaseName: "",
      releaseDate: "",
      updateUrl: "",
      licenseExportFilePath: "",
    };
  },
  mounted() {
    //更新进度
    this.$electron.ipcRenderer.on("downloadProgress", (event, data) => {
      this.percentage = data.percent.toFixed(2);
      if (this.percentage >= 100) {
        this.percentage = 100;
        this.loading = false;
      }
    });
    /**
     * 主进程返回的检测状态
     */
    this.$electron.ipcRenderer.on("message", (event, data) => {
      this.checkMsg = data.msg;
      this.stateCode = data.status;
      switch (data.status) {
        case -1: // 错误
          this.loading = false;
          this.logPath = data.logPath;
          break;
        case 0: // 正在检测
          break;
        case 1: // 存在新版本
          this.newVersion = data.version;
          break;
        case 2: // 已经是最新
          this.loading = false;
          break;
      }
    });
    this.$electron.ipcRenderer.on("isUpdateNow", (event, data) => {
      // ipcRenderer.send("isUpdateNow");
      let { releaseNotes, releaseName, releaseDate, updateUrl } = data;
      this.releaseDate = releaseDate;
      this.releaseNotes = releaseNotes;
      this.releaseName = releaseName;
      this.updateUrl = updateUrl;
      this.downloadSuccess = true;
    });
    this.$electron.ipcRenderer.send("checkForUpdate");
  },
  destroyed() {
    this.$electron.ipcRenderer.removeAllListeners("downloadProgress");
    this.$electron.ipcRenderer.removeAllListeners("message");
    this.$electron.ipcRenderer.removeAllListeners("isUpdateNow");
  },
  methods: {
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
    async handleClickBrowser() {
      let result = await this.$electron.remote.dialog.showSaveDialog({
        title: "请选择要保存的文件名",
        buttonLabel: "保存",
        defaultPath: `license`,
        filters: [{ name: "数据", extensions: ["dat"] }],
      });
      if (!result.canceled) {
        let installPath = path.join(
          path.dirname(this.$electron.remote.app.getPath("exe")),
          "license.dat"
        );
        if (!fs.existsSync(installPath)) {
          this.$message({
            message: `安装路径下没有找到${installPath}授权文件`,
          });
          return;
        }
        this.licenseExportFilePath = result.filePath;
        await this.copyFile(installPath, this.licenseExportFilePath);
      }
    },
    async handleClickInstallNew() {
      if (this.licenseExportFilePath === "") {
        this.$message.error({
          message: "没有选择授权导出路径",
        });
        return;
      }
      if (!fs.existsSync(this.licenseExportFilePath)) {
        this.$message.error({
          message: `${this.licenseExportFilePath}路径没有授权文件，请重新导出`,
        });
        return;
      }
      this.$electron.ipcRenderer.send("isUpdateNow");
    },
    async handleClickShowFile() {
      if (fs.existsSync(this.logPath)) {
        await this.$electron.shell.openPath(this.logPath);
      }
    },
    handleClickReCheck() {
      this.loading = true;
      if (fs.existsSync(this.logPath)) {
        fs.unlinkSync(this.logPath);
      }
      this.$electron.ipcRenderer.send("checkForUpdate");
    },
    handleClose() {
      if (fs.existsSync(this.logPath)) {
        fs.unlinkSync(this.logPath);
      }
      this.$store.commit("DialogPopWnd/SET_SHOWUPDATEVISIBLE", false);
    },
  },
};
</script>

<style scoped>
.logo {
  font-size: 100px;
  text-align: center;
  color: #313f57;
}
</style>