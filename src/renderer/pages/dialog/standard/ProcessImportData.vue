<template>
  <div>
    <div style="margin-bottom: 10px">
      <span>正在导入</span>
      <span style="font-size: 12px; color: #0c4b03">[{{ fileName }}]</span>
      <span>文件中的</span>
      <span style="font-size: 12px; color: #0c4b03">[{{ sheetName }}]</span>
      <span>表数据...</span>
    </div>
    <el-row>
      <div :style="{
        fontSize: 10 + 'px',
        textAlign: 'center',
        color: percentage !== 99 ? '#96d558' : '#b75438',
        marginBottom: 10 + 'px',
      }">
        {{ secondTitle }}
      </div>
    </el-row>
    <el-row>
      <el-col :span="12">
        <div style="
            font-size: 8px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          ">
          {{ tip }}
        </div>
      </el-col>
    </el-row>
    <el-progress :percentage="percentage" :color="customColor"></el-progress>
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
      secondTitle: "",
      customColor: "#f56c6c",
      rowCount: 0,
      tip: "",
    };
  },
  destroyed() {
    this.$electron.ipcRenderer.removeAllListeners("read-one-file-begin");
    this.$electron.ipcRenderer.removeAllListeners("read-one-file-proccess");
    this.$electron.ipcRenderer.removeAllListeners("read-one-file-over");
    this.$electron.ipcRenderer.removeAllListeners("read-all-file-over");
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
      const {
        fileName,
        sheetName,
        percentage,
        success,
        msg,
        secondTitle,
      } = data;
      if (!success) {
        _this.$message.error({
          title: "错误",
          message: msg,
        });
        return;
      }
      _this.secondTitle = secondTitle;
      _this.fileName = fileName;
      _this.sheetName = sheetName;
      this.rowCount++;
      if (this.rowCount % 10 === 0) {
        if (_this.percentage !== percentage) {
          _this.tip = msg;
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
        } else {
          _this.tip = msg;
        }
      }
    });

    this.$electron.ipcRenderer.on("read-one-file-over", (event, data) => {
      const { id, tableName, needInsertFields, sjlyid } = data;
      //console.log(needInsertFields);
      _this.$store.commit(
        "DataCollection/SET_TABLENAME_AND_INSERTFIELDS_AND_SJLYID",
        {
          id,
          tableName,
          needInsertFields,
          sjlyid,
        }
      );
    });
    // 监听到所有的文件都导入到temp完毕后，执行每个表的前30条数据查询
    this.$electron.ipcRenderer.on("read-all-file-over", async (e, data) => {
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