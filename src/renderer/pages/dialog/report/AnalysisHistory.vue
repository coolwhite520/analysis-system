<template>
  <el-dialog
    v-dialogDrag
    :close-on-click-modal="false"
    class="standard-data-dialog"
    :append-to-body="true"
    :visible="showReportHisVisible"
    width="60%"
    @close="handleClose"
    :modal="true"
  >
    <div slot="title" class="dialog-title">
      <i class="iconfont" style="color: white; font-size: 30px">&#xe63d;</i>
      <span class="title-text" style="color: white">{{ title }}</span>
      <div class="button-right">
        <span class="title-close" @click="handleClose"></span>
      </div>
    </div>
    <el-table
      ref="multipleTable"
      style="width: 100%"
      :data="reportCollection"
      size="mini"
      :max-height="400"
      :height="400"
      stripe
      border
      :row-class-name="rowClassName"
      @row-contextmenu="handleRightClickRow"
    >
      <el-table-column
        prop="rowIndex"
        label="序号"
        width="60"
        header-align="center"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="reportname"
        label="报告名称"
        header-align="center"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="casename"
        label="所属案件"
        header-align="center"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="createtime"
        label="生成时间"
        header-align="center"
        align="center"
      ></el-table-column>
      <el-table-column label="操作" header-align="center" align="center">
        <template slot-scope="scope">
          <el-button-group>
            <el-button
              type="success"
              size="mini"
              @click="handleClickReView(scope.row)"
              >报告预览</el-button
            >
            <el-button
              type="danger"
              size="mini"
              @click="handleClickDelete(scope.row)"
              >报告删除</el-button
            >
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>
</template>
<script>
import { mapState } from "vuex";
const { clipboard } = require("electron");
import fs from "fs";
import Report from "@/db/Report";
export default {
  props: ["reportCollection"],
  data() {
    return {
      title: "分析报告历史记录",
    };
  },
  computed: {
    ...mapState("DialogPopWnd", ["showReportHisVisible"]),
  },
  methods: {
    async handleRightClickRow(row, column, event) {
      let value = row[column.property];
      console.log(row);
      if (value) {
        clipboard.writeText(value + "");
        this.$message({
          type: "success",
          message: "已经将数据'" + value + "'放入到了剪贴板",
        });
      }
    },
    async handleClickReView(row) {
      let dirPath = row.filecontent.toString();
      console.log(dirPath);
      if (fs.existsSync(dirPath)) {
        await this.$electron.shell.openPath(dirPath);
      } else {
        this.$message({
          message: `文件路径[${dirPath}]不存在。`,
        });
      }
    },
    delDir(path) {
      let files = [];
      if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach((file, index) => {
          let curPath = path + "/" + file;
          if (fs.statSync(curPath).isDirectory()) {
            delDir(curPath); //递归删除文件夹
          } else {
            fs.unlinkSync(curPath); //删除文件
          }
        });
        fs.rmdirSync(path); // 删除文件夹自身
      }
    },
    async handleClickDelete(row) {
      console.log(row);
      let dirPath = row.filecontent.toString();
      console.log(dirPath);
      if (fs.existsSync(dirPath)) {
        try {
          await Report.DelReportRecordById(row.id);
          await this.delDir(dirPath);
          for (let index = 0; index < this.reportCollection.length; index++) {
            if (this.reportCollection[index].id === row.id) {
              this.reportCollection.splice(index, 1);
              break;
            }
          }
          this.$message({
            type: "success",
            message: "记录删除成功！",
          });
        } catch (e) {
          this.$message({
            message: `删除信息错误：${e.message}`,
          });
        }
      } else {
        await Report.DelReportRecordById(row.id);
        for (let index = 0; index < this.reportCollection.length; index++) {
          if (this.reportCollection[index].id === row.id) {
            this.reportCollection.splice(index, 1);
            break;
          }
        }
        this.$message({
          type: "success",
          message: "记录删除成功！",
        });
      }
    },
    rowClassName({ row, rowIndex }) {
      row.rowIndex = rowIndex + 1;
    },
    handleClose() {
      this.$store.commit("DialogPopWnd/SET_SHOWREPORTHISVISIBLE", false);
    },
  },
};
</script>