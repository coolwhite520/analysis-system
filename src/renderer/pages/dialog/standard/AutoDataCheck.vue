<template>
  <div>
    <el-row style="margin-bottom: 10px" v-if="showOperationButton">
      <el-col :span="18">
        <div>
          <span style="font-size: 13px"><b>错误信息汇总：</b></span>
          <el-button-group>
            <el-button
              type="danger"
              v-for="item in allErrorFields"
              :key="item.title"
              round
              size="mini"
              @click="handleClickBtnGroupAll(item)"
              :disabled="loadingDelete"
              >{{ item.title }}({{ item.count }})条</el-button
            >
          </el-button-group>
          <span style="font-size: 12px">点击按钮可进行批量修改</span>
        </div>
      </el-col>
      <el-col :span="6" style="text-align: right">
        <el-button
          type="success"
          size="mini"
          @click="handleClearAllError"
          :loading="loadingDelete"
          >错误数据一键清理</el-button
        >
      </el-col>
    </el-row>
    <el-table
      :data="exampleDataList"
      border
      style="width: 100%"
      size="mini"
      max-height="400"
      ref="myImportTable"
    >
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column
        prop="id"
        label="序号"
        width="60"
        type="index"
      ></el-table-column>
      <el-table-column label="文件类型" width="70" align="center">
        <template slot-scope="scope">
          <div
            v-if="
              scope.row.fileName.endsWith('.xls') ||
              scope.row.fileName.endsWith('.xlsx')
            "
          >
            <svg
              class="icon"
              aria-hidden="true"
              style="height: 32px; width: 32px"
            >
              <use xlink:href="#icon-xls"></use>
            </svg>
          </div>
          <div v-else-if="scope.row.fileName.endsWith('.csv')">
            <svg
              class="icon"
              aria-hidden="true"
              style="height: 32px; width: 32px"
            >
              <use xlink:href="#icon-CSV"></use>
            </svg>
          </div>
          <div v-if="scope.row.fileName.endsWith('.txt')">
            <svg
              class="icon"
              aria-hidden="true"
              style="height: 32px; width: 32px"
            >
              <use xlink:href="#icon-txt"></use>
            </svg>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="fileName" label="文件名称"></el-table-column>

      <el-table-column prop="sheetName" label="文件内部sheet名称"
        ><template slot-scope="scope">
          <div
            v-if="
              scope.row.fileName.endsWith('.csv') ||
              scope.row.fileName.endsWith('.txt')
            "
          >
            无
          </div>
          <div v-else>
            {{ scope.row.sheetName }}
          </div>
        </template></el-table-column
      >
      <el-table-column label="匹配目标表" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-select
            filterable
            :value="scope.row.matchedMbdm"
            placeholder="请选择"
            size="mini"
            :disabled="true"
          >
            <el-option
              v-for="item in scope.row.matchedMbdmList"
              :key="item.id"
              :label="item.mbmc"
              :value="item.mbdm"
            ></el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column
        label="检测结果"
        v-if="clickedCheckBtn && !loadingTable"
        header-align="center"
        align="center"
      >
        <template slot-scope="scope">
          <!-- 判断是否检测 -->
          <div
            v-if="scope.row.hasOwnProperty('isChecked') && scope.row.isChecked"
          >
            <div v-if="scope.row.errorFields.length > 0">
              <el-button-group>
                <el-button
                  type="danger"
                  v-for="item in scope.row.errorFields"
                  :key="item.fieldename"
                  round
                  size="mini"
                  @click="handleClickBtnGroup(scope.row, item)"
                  >{{ item.fieldcname }}({{ item.rownums.length }})条</el-button
                >
              </el-button-group>
            </div>
            <div
              v-else
              class="iconfont"
              style="text-align: center; color: #377645; font-size: 20px"
            >
              &#xe659;
            </div>
          </div>
        </template>
      </el-table-column>
      <!-- <el-table-column
        prop="progress"
        label="数据导入进度"
        v-if="isImportLoading"
      >
        <template slot-scope="scope">
          <el-progress
            type="line"
            :text-inside="true"
            :percentage="scope.row.progress"
            :color="scope.row.progressColor"
            :stroke-width="30"
          ></el-progress>
        </template>
      </el-table-column> -->
    </el-table>
    <el-progress
      style="margin-top: 10px"
      v-if="isImportLoading && percentage > 0"
      type="line"
      :text-inside="true"
      :percentage="percentage"
      :stroke-width="20"
    ></el-progress>
    <el-row style="margin-top: 20px; text-align: center">
      <el-button
        style="width: 30%"
        type="primary"
        size="small"
        @click="handleClickCheckData"
        :loading="isCheckingLoading"
        >错误数据检测</el-button
      >
      <el-button
        style="width: 30%"
        type="primary"
        size="small"
        @click="handleClickImportData"
        :loading="isImportLoading"
        :disabled="!clickedCheckBtn"
      >
        数据导入
      </el-button>
    </el-row>
    <div v-if="showUpdateErrorDialogVisible">
      <update-view :errorData="errorData"></update-view>
    </div>
  </div>
</template>
<script>
import { mapState } from "vuex";
import updateErrorDialog from "./child/UpdateErrorData";
import dataImport from "@/db/DataImport";

export default {
  mounted() {
    //console.log("monted.....");
    this.isMounted = true;
    this.$electron.ipcRenderer.on(
      "import-one-table-process",
      this.onRecvImportMsg
    );
    this.$electron.ipcRenderer.on(
      "import-one-table-complete",
      this.onRecvImportCompleteMsg
    );
  },
  destroyed() {
    //console.log("destroyed.....");
    this.$electron.ipcRenderer.removeAllListeners("import-one-table-process");
    this.$electron.ipcRenderer.removeAllListeners("import-one-table-complete");
  },
  components: {
    "update-view": updateErrorDialog,
  },
  data() {
    return {
      percentage: 0,
      loadingDelete: false,
      filterList: ["exceedLen", "notNum", "notDate"],
      clickedCheckBtn: false,
      isCheckingLoading: false,
      isImportLoading: false,
      errorData: [],
      isMounted: false,
      loadingTable: false,
      currentImportRows: [],
      currentImportCount: 0,
      options: {
        text: {
          color: "#FFFFFF",
          shadowEnable: true,
          shadowColor: "#000000",
          fontSize: 14,
          fontFamily: "Helvetica",
          dynamicPosition: false,
          hideText: false,
        },
        progress: {
          color: "#2dbd2d",
          backgroundColor: "#333333",
        },
        layout: {
          height: 35,
          width: 140,
          verticalTextAlign: 61,
          horizontalTextAlign: 43,
          zeroOffset: 0,
          strokeWidth: 30,
          progressPadding: 0,
          type: "line",
        },
      },
    };
  },
  computed: {
    ...mapState("DataCollection", ["exampleDataList"]),
    ...mapState("CaseDetail", ["caseBase"]),
    ...mapState("DialogPopWnd", ["showUpdateErrorDialogVisible"]),
    ...mapState("ShowTable", ["tableDataList"]),
    showOperationButton() {
      if (this.isMounted) {
        let selectedRows = this.$refs[`myImportTable`].selection;
        for (let row of selectedRows) {
          if (
            row.hasOwnProperty("errorFields") &&
            row.errorFields.length > 0 &&
            this.clickedCheckBtn
          ) {
            return true;
          }
        }
      } else {
        return false;
      }
    },
    allErrorFields() {
      let errorList = [];
      if (this.isMounted) {
        let notDateObj = {
          count: 0,
          title: "非日期型数据",
          filterName: "notDate",
          errorList: [],
        };
        let notNumObj = {
          count: 0,
          title: "非数值型数据",
          filterName: "notNum",
          errorList: [],
        };
        let exceedLenObj = {
          count: 0,
          title: "超过限定长度数据",
          filterName: "exceedLen",
          errorList: [],
        };
        let selectedRows = this.$refs[`myImportTable`].selection;
        for (let sheetItem of selectedRows) {
          for (let errorFieldObj of sheetItem.errorFields) {
            switch (errorFieldObj.filterName) {
              case "notDate":
                notDateObj.count += errorFieldObj.rownums.length;
                notDateObj.errorList.push({ errorFieldObj, sheetItem });
                break;
              case "notNum":
                notNumObj.count += errorFieldObj.rownums.length;
                notNumObj.errorList.push({ errorFieldObj, sheetItem });
                break;
              case "exceedLen":
                exceedLenObj.count += errorFieldObj.rownums.length;
                exceedLenObj.errorList.push({ errorFieldObj, sheetItem });
                break;
            }
          }
        }
        if (notDateObj.count > 0) {
          errorList.push(notDateObj);
        }
        if (notNumObj.count > 0) {
          errorList.push(notNumObj);
        }
        if (exceedLenObj.count > 0) {
          errorList.push(exceedLenObj);
        }
        return errorList;
      } else {
        return errorList;
      }
    },
  },
  methods: {
    // 导入消息的回调
    async onRecvImportMsg(e, args) {
      let { percentage, id, success, msg } = args;
      //console.log(id, percentage);
      if (!success) {
        this.$message.error({
          title: "错误",
          message: msg,
        });
      } else {
        if (percentage >= 100) {
          percentage = 100;
        }
        // 频繁的调用commit影响程序性能
        // this.$store.commit("DataCollection/SET_IMPORT_DATA_PROCESS", {
        //   id,
        //   progress: percentage,
        // });
        // this.$nextTick(() => {
        //   this.$refs[`myImportTable`].doLayout();
        // });
      }
    },

    clearCurrentInportRow(id) {
      let index = 0;
      for (let row of this.currentImportRows) {
        if (row.id === id) {
          this.currentImportRows.splice(index, 1);
          break;
        }
        index++;
      }
    },

    async onRecvImportCompleteMsg(e, args) {
      let { id } = args;
      //console.log("import data over: ", id);
      await this.$store.commit("DataCollection/DELETE_DATA_LIST_BY_ID", id);
      this.clearCurrentInportRow(id);
      this.percentage = parseInt(
        100 -
          parseFloat(
            (this.currentImportRows.length / this.currentImportCount) * 100
          )
      );
      if (this.currentImportRows.length === 0) {
        this.$message({
          title: "成功",
          message: `数据插入成功`,
          type: "success",
        });
        // 清理temp表
        this.isImportLoading = false;
        this.isCheckingLoading = false;
        await this.$store.dispatch(
          "CaseDetail/queryCaseDataCenter",
          this.caseBase.ajid
        );
        // 更新当前的展示列表中的数据;
        for (let tableData of this.tableDataList) {
          // 根据tableName获取表的数据
          if (tableData.componentName !== "no-data-view") {
            this.$store.dispatch(tableData.dispatchName, {
              ...tableData,
              offset: 0,
              count: 30,
            });
          }
        }
      }
      if (this.exampleDataList.length === 0) {
        this.$store.commit("DialogPopWnd/SET_STANDARDDATAVISIBLE", false);
        this.$store.commit("DataCollection/CLEAR_CSV_DATA_LIST");
      }
    },
    async handleClearAllError() {
      try {
        this.loadingDelete = true;
        let selectedRows = this.$refs[`myImportTable`].selection;
        if (selectedRows.length === 0) {
          this.$message({
            message: "请勾选需要处理的数据源",
          });
          return;
        }
        for (let sheetItem of selectedRows) {
          const { ajid } = this.caseBase;
          const { headers, tableName, errorFields, id } = sheetItem;
          let findError = false;
          for (let errorField of errorFields) {
            await dataImport.deleteErrorRows(
              ajid,
              tableName,
              errorField.rownums
            );
          }
          await this.$store.dispatch("DataCollection/QueryErrorData", {
            id,
            ajid,
            tableName,
            matchedFields: sheetItem.matchedFields,
            index: 0,
            filterList: this.filterList,
            limit: 1,
            headers,
          });
        }
        this.$message({
          title: "成功",
          message: `数据删除成功！`,
          type: "success",
        });
        this.loadingDelete = false;
      } catch (e) {
        this.$message.error({
          message: `数据删除错误！${e.message}`,
        });
        this.loadingDelete = false;
      }
    },
    // 执行导入所有文件的操作
    execImportData(selectedRows) {
      this.currentImportRows = selectedRows;
      this.currentImportCount = this.currentImportRows.length;
      let list = [];
      for (let sheetItem of selectedRows) {
        const { ajid } = this.caseBase;
        let {
          id,
          tableName,
          tablecname,
          needInsertFields,
          sjlyid,
          matchedMbdm,
        } = sheetItem;
        // //console.log(sheetItem);
        if (tablecname.endsWith("_source")) {
          tablecname = tablecname.slice(0, tablecname.lastIndexOf("_source"));
        }
        list.push({
          id,
          ajid,
          tableName,
          tablecname,
          needInsertFields,
          sjlyid,
          matchedMbdm,
        });
      }
      this.$electron.ipcRenderer.send("import-one-table-begin", { list });
    },
    async handleClickImportData() {
      if (this.clickedCheckBtn) {
        let selectedRows = this.$refs[`myImportTable`].selection;
        let selectdCount = selectedRows.length;
        if (selectdCount > 0) {
          let i = 0;
          for (let row of selectedRows) {
            if (
              row.hasOwnProperty("isChecked") &&
              row.isChecked &&
              row.errorFields.length === 0
            ) {
              i++;
            }
          }
          if (i === selectedRows.length) {
            this.percentage = 0;
            this.isImportLoading = true;
            this.isCheckingLoading = true;
            this.execImportData(selectedRows);
          } else {
            this.$message({
              message: "存在未检测的数据源或未处理的错误数据",
            });
          }
        } else {
          this.$message({
            message: "您没有勾选任何需要导入的数据",
          });
        }
      } else {
        this.$message({
          message: "您没有进行错误数据检测无法进行导入操作。",
        });
      }
    },
    handleClickBtnGroupAll(item) {
      //console.log(item);
      this.errorData = {
        errorList: item.errorList,
        title: item.title,
        filterName: item.filterName,
      };
      this.$store.commit("DialogPopWnd/SET_SHOWUPDATEERRORDIALOGVISIBLE", true);
    },
    handleClickBtnGroup(sheetItem, errorFieldObj) {
      this.errorData = {
        errorList: [
          {
            errorFieldObj,
            sheetItem,
          },
        ],
        title: errorFieldObj.fieldcname,
        filterName: errorFieldObj.filterName,
      };
      this.$store.commit("DialogPopWnd/SET_SHOWUPDATEERRORDIALOGVISIBLE", true);
    },
    async handleClickCheckData() {
      try {
        let selectedRows = this.$refs[`myImportTable`].selection;
        if (selectedRows.length === 0) {
          this.$message({
            message: "请勾选需要检测的数据行！",
          });
          return;
        }
        this.isCheckingLoading = true;
        const { ajid } = this.caseBase;
        for (let sheetItem of selectedRows) {
          const { headers, tableName, id } = sheetItem;
          await this.$store.dispatch("DataCollection/QueryErrorData", {
            id,
            ajid,
            tableName,
            matchedFields: sheetItem.matchedFields,
            index: 0,
            filterList: this.filterList,
            limit: 1,
            headers,
          });
        }
        this.clickedCheckBtn = true;
        this.isCheckingLoading = false;
        if (this.showOperationButton) {
          this.$message({
            message: "数据检测完毕, 发现异常数据",
          });
        } else {
          this.$message({
            type: "success",
            message: "数据检测完毕, 没有发现异常数据",
          });
        }

        // this.allErrorNotNumberFields = [];
        // for (let row of selectedRows) {
        //   for (let errorField of row.errorFields) {
        //     switch (errorField.filterName) {
        //       case "notNum":
        //         this.allErrorNotNumberFields.push({
        //           id: row.id,
        //           errorField,
        //         });
        //         break;
        //     }
        //   }
        // }
      } catch (e) {
        this.$message.error({
          message: e.message,
        });
        this.isCheckingLoading = false;
      }
    },
  },
};
</script>