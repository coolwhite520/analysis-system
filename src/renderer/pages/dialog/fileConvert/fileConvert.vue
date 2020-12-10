<template>
  <el-dialog
    v-dialogDrag
    :close-on-click-modal="false"
    class="standard-data-dialog"
    :append-to-body="true"
    :visible="showConvertDialog"
    width="40%"
    @close="handleClose"
    :modal="true"
  >
    <div slot="title" class="dialog-title">
      <i class="iconfont" style="color: white; font-size: 30px">&#xe631;</i>
      <span class="title-text" style="color: white">{{ title }}</span>
      <div class="button-right">
        <span class="title-close" @click="handleClose"></span>
      </div>
    </div>
    <div
      class="mainContent"
      v-loading="loading"
      :element-loading-text="loadingContent"
    >
      <!-- <div style="font-size: 10px">
        主要解决无法导入2007之前版本xls文件的问题
      </div> -->
      <div>
        <svg
          class="icon"
          aria-hidden="true"
          style="height: 64px; width: 64px; margin-right: 20px"
        >
          <use xlink:href="#icon-xls"></use>
        </svg>
        <i class="iconfont" style="font-size: 80px">&#xe632;</i>
        <svg
          class="icon"
          aria-hidden="true"
          style="height: 64px; width: 64px; margin-left: 20px"
        >
          <use xlink:href="#icon-CSV"></use>
        </svg>
      </div>

      <div>
        <span>输入路径：</span>
        <el-input
          :disabled="true"
          v-model="importDir"
          size="mini"
          placeholder="请选择xls、xlsx文件路径"
          style="width: 70%"
        ></el-input>
        <el-button
          size="mini"
          type="primary"
          @click="handleClickBrowserImport"
          :disabled="iniImportDir !== ''"
          >浏览</el-button
        >
      </div>
      <div style="margin-top: 10px">
        <span>输出路径：</span>
        <el-input
          :disabled="true"
          v-model="exportDir"
          size="mini"
          placeholder="请选择输出csv文件路径"
          style="width: 70%"
        ></el-input>
        <el-button size="mini" type="primary" @click="handleClickBrowserExport"
          >浏览</el-button
        >
      </div>
      <div>
        <el-button
          size="medium"
          style="width: 99%; margin-top: 20px"
          type="primary"
          @click="handleClickConvert"
          >一键转换</el-button
        >
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from "vuex";
const path = require("path");
const fs = require("fs");
const XLSX = require("xlsx");

export default {
  props: ["iniImportDir"],
  computed: {
    ...mapState("DialogPopWnd", ["showConvertDialog"]),
  },
  mounted() {
    this.importDir = this.iniImportDir;
  },
  data() {
    return {
      title: "文件格式转换",
      importDir: "",
      exportDir: "",
      loading: false,
      loadingContent: "",
    };
  },
  methods: {
    async handleClickBrowserImport() {
      let mainWindow = this.$electron.remote.getGlobal("mainWindow");
      let filePathDir = await this.$electron.remote.dialog.showOpenDialogSync(
        mainWindow,
        {
          title: "数据",
          buttonLabel: "打开",
          properties: ["openDirectory"],
        }
      );
      console.log(filePathDir);
      if (typeof filePathDir !== "undefined") {
        this.importDir = filePathDir[0];
      }
    },
    readFileList(dir, filesList = []) {
      const stat = fs.statSync(dir);
      if (!stat.isDirectory()) {
        if ([".xls", ".xlsx"].includes(path.extname(dir))) {
          filesList.push(dir);
        }
        return;
      }
      const files = fs.readdirSync(dir);
      files.forEach((item, index) => {
        var fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          this.readFileList(path.join(dir, item), filesList); //递归读取文件
        } else {
          if ([".xls", ".xlsx"].includes(path.extname(fullPath))) {
            filesList.push(fullPath);
          }
        }
      });
      return filesList;
    },
    async handleClickBrowserExport() {
      let mainWindow = this.$electron.remote.getGlobal("mainWindow");
      let filePathDir = await this.$electron.remote.dialog.showOpenDialogSync(
        mainWindow,
        {
          title: "数据",
          buttonLabel: "打开",
          properties: ["openDirectory"],
        }
      );
      if (typeof filePathDir !== "undefined") {
        this.exportDir = path.join(filePathDir[0], "output");
      }
    },
    async handleClickConvert() {
      try {
        if (this.importDir === "") {
          this.$message({
            message: `输入路径为空，请点击浏览按钮。`,
          });
          return;
        }
        if (this.exportDir === "") {
          this.$message({
            message: `输出路径为空，请点击浏览按钮。`,
          });
          return;
        }
        let inputFileList = [];
        this.readFileList(this.importDir, inputFileList);
        if (inputFileList.length === 0) {
          this.$message({
            message: `输入路径${this.importDir}不存在xls文件`,
          });
          return;
        }
        inputFileList = this.$lodash.uniq(inputFileList);
        this.loading = true;
        this.loadingContent = `转换开始，请稍后...`;
        if (!fs.existsSync(this.exportDir)) {
          fs.mkdirSync(this.exportDir, { recursive: true });
        }
        for (let filePathName of inputFileList) {
          let fileName = path.basename(filePathName);
          this.loadingContent = `正在转换${fileName}，请稍后...`;
          await this.convertXls2Csv(filePathName, fileName, this.exportDir);
        }
        this.loading = false;
        this.loadingContent = "";
        this.$message({
          type: "success",
          message: "转换完成！",
        });
        await this.$electron.shell.openPath(this.exportDir);
        this.handleClose();
      } catch (e) {
        console.log(e);
        this.loading = false;
        this.loadingContent = "";
        this.$message.error({
          message: e.message,
        });
      }
    },
    async convertXls2Csv(srcFilePath, fileName, desDir) {
      var workbook = XLSX.readFile(srcFilePath);
      let promiseArr = [];
      for (let sheetName of workbook.SheetNames) {
        promiseArr.push(
          (async () => {
            await new Promise((resolve, reject) => {
              let worksheet = workbook.Sheets[sheetName];
              let stream = XLSX.stream.to_csv(worksheet);
              let outputFile = path.join(
                desDir,
                fileName + "-" + sheetName + ".csv"
              );
              stream
                .pipe(fs.createWriteStream(outputFile))
                .on("error", (err) => {
                  console.log(err);
                  reject(err);
                })
                .on("finish", () => {
                  resolve("done");
                });
            });
          })()
        );
      }
      await Promise.all(promiseArr);
    },
    handleClose() {
      this.$store.commit("DialogPopWnd/SET_SHOWCONVERTDIALOG", false);
    },
  },
};
</script>

<style scoped>
.mainContent {
  text-align: center;
}
</style>
  
  