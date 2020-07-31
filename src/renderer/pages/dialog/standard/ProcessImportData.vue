<template>
  <div>
    <div style="margin-bottom:30px;">当前正在导入[{{fileName}}]文件中的[{{sheetName}}]表中的数据...</div>
    <el-progress
      :text-inside="true"
      :stroke-width="30"
      :percentage="percentage"
      :color="customColor"
    ></el-progress>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState("DataCollection", ["exampleDataList"]),
  },
  data() {
    return {
      fileName: "",
      sheetName: "",
      percentage: 0,
      customColor: "#f56c6c",
    };
  },
  mounted() {
    // 监听进度条的变化
    let _this = this;
    this.$electron.ipcRenderer.on("read-one-file-begin", (event, data) => {
      const { fileName, sheetName } = data;
      _this.fileName = fileName;
      _this.sheetName = sheetName;
    });
    this.$electron.ipcRenderer.on("read-one-file-proccess", (event, data) => {
      const { fileName, sheetName, percentage } = data;
      _this.fileName = fileName;
      _this.sheetName = sheetName;
      _this.percentage = percentage;
      if (percentage < 20) {
        _this.customColor = "#f56c6c";
      } else if (percentage > 20 && percentage < 40) {
        _this.customColor = "#e6a23c";
      } else if (percentage > 40 && percentage < 60) {
        _this.customColor = "#5cb87a";
      } else if (percentage > 60 && percentage < 80) {
        _this.customColor = "#1989fa";
      } else if (percentage > 80 && percentage <= 100) {
        _this.customColor = "#6f7ad3";
      }
    });

    this.$electron.ipcRenderer.on("read-one-file-over", (event, data) => {
      const { sheetIndex, tableName } = data;
      _this.$store.commit("DataCollection/SET_TABLENAME", {
        sheetIndex,
        tableName,
      });
    });
    // 监听到所有的文件都导入到temp完毕后，执行每个表的前30条数据查询
    this.$electron.ipcRenderer.on("read-all-file-over", async (e, data) => {
      for (let index = 0; index < _this.exampleDataList.length; index++) {
        let item = _this.exampleDataList[index];
        let tableName = item.tableName;
        let ajid = item.caseDetail.ajid;
        await this.$store.dispatch("DataCollection/QueryTableData", {
          ajid,
          sheetIndex: index,
          tableName,
          index: 0,
          limit: 30,
        });
      }
      await _this.$store.commit(
        "DialogPopWnd/SET_STANDARDVIEW",
        "explore-data"
      );
    });
  },
};
</script>

<style scoped>
</style>