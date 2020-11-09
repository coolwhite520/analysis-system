<template>
  <div>
    <el-dialog
      v-dialogDrag
      class="auto-data-dialog"
      :close-on-click-modal="false"
      title="智能数据采集"
      :visible="autoDataVisible"
      width="60%"
      @close="handleClose"
      :modal="true"
    >
      <div>
        <el-steps :active="currentStepIndex" finish-status="success">
          <el-step title="选择文件"></el-step>
          <el-step title="解析并校对文件内容"></el-step>
          <el-step title="导入文件"></el-step>
        </el-steps>
      </div>
      <el-row style="text-align: center; margin-top: 20px">
        <el-col :span="8">
          <div style="float: left">
            <el-button
              size="mini"
              type="primary"
              :disabled="currentStepIndex !== 1"
              @click="handleClickSelectFile"
              >选择文件</el-button
            >
            <span style="font-size: 10px">支持格式：txt、csv、xls、xlsx</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div>
            <el-button
              size="mini"
              type="primary"
              :disabled="currentStepIndex !== 2"
              @click="handleClickAnalysis"
              >解析文件</el-button
            >
          </div>
        </el-col>
        <el-col :span="8">
          <div style="float: right">
            <el-button
              size="mini"
              type="primary"
              :disabled="currentStepIndex !== 3"
              @click="handleClickImportFile"
              >导入文件</el-button
            >
          </div>
        </el-col>
      </el-row>

      <el-table
        :data="exampleDataList"
        height="100%"
        border
        style="width: 100%; margin-top: 20px"
        size="mini"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column
          prop="id"
          label="序号"
          width="60"
          type="index"
        ></el-table-column>
        <el-table-column prop="fileName" label="文件名称"></el-table-column>
        <el-table-column prop="sheetName" label="表格名称"></el-table-column>
        <el-table-column prop="mc" label="匹配状态"></el-table-column>
      </el-table>

      <el-progress
        style="margin-top: 20px"
        :stroke-width="26"
        :percentage="currentPercentage"
      ></el-progress>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  mounted() {
    let _this = this;
  },

  computed: {
    ...mapState("DialogPopWnd", ["autoDataVisible"]),
    ...mapState("DataCollection", ["exampleDataList"]),
  },
  data() {
    return {
      currentPercentage: 0,
      currentStepIndex: 1,
      value: 0,
      options: [],
      tableData: [],
    };
  },
  components: {},
  methods: {
    handleClose() {
      this.currentStepIndex = 1;
      this.$store.commit("DialogPopWnd/SET_AUTODATAVISIBAL", false);
    },
    async handleClickSelectFile() {
      let mainWindow = this.$electron.remote.getGlobal("mainWindow");
      let filePathList = await this.$electron.remote.dialog.showOpenDialogSync(
        mainWindow,
        {
          title: "数据导入",
          buttonLabel: "打开",
          filters: [
            { name: "Files", extensions: ["txt", "csv", "xls", "xlsx"] },
          ],
          properties: ["openFile", "multiSelections"],
        }
      );
      if (typeof filePathList === "undefined") return;
      this.parseFileCount = filePathList.length;
      if (typeof filePathList !== "undefined") {
        this.loading = true;
        this.$electron.ipcRenderer.send("parse-all-example-file", {
          caseBase: this.caseBase,
          batchCount: this.batchCount,
          filePathList,
          pdm: "",
        });
      }
      this.currentStepIndex++;
    },
    handleClickAnalysis() {
      this.currentStepIndex++;
    },
    handleClickImportFile() {
      this.currentStepIndex = 1;
    },
  },
};
</script>

<style>
</style>

