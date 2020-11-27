<template>
  <div v-loading="loading" :element-loading-text="loadingText">
    <!-- <el-row>
      <span style="font-size:12px;">标准导入：</span>
    </el-row>-->
    <div style="text-align: center">
      导入数据方式：

      <el-radio v-model="radioImportType" label="openFile">文件</el-radio>
      <el-radio v-model="radioImportType" label="openDirectory">目录</el-radio>
    </div>
    <el-row style="text-align: center; margin-top: 10px">
      <el-button-group>
        <el-button
          size="mini"
          v-for="item of buttonGroupList"
          :key="item.id"
          @click="handleClickImportData(item.pdm)"
        >
          <span class="mybutton iconfont" v-html="item.icon"></span>
          <span>{{ item.mc }}</span>
        </el-button>
      </el-button-group>
    </el-row>

    <el-row style="margin-top: 20px"></el-row>
    <el-row>
      <!-- <span style="font-size:12px;">自动导入：</span> -->
      <!-- <el-tooltip effect="dark" content="可以自动分析文件字段并进行自动匹配" placement="top"> -->
      <el-button size="mini" @click="handleClickImportData('')">
        <span class="mybutton iconfont">&#xe620;</span>
        <span>智能文件导入</span>
      </el-button>
      <span style="font-size: 10px; color: gray"
        >可自动分析文件字段并进行自动匹配</span
      >
      <!-- </el-tooltip> -->
    </el-row>
    <div style="margin-top: 20px" v-show="exampleDataList.length > 0">
      <span style="font-size: 16px">
        <b>数据文件表</b>
      </span>
      <el-table
        ref="multipleTable"
        :data="exampleDataList"
        height="200"
        border
        style="width: 100%"
        size="mini"
        @selection-change="handleSelectionChange"
        highlight-current-row
        @current-change="handleCurrentChange"
        :row-class-name="rowClassName"
      >
        >
        <el-table-column type="selection"></el-table-column>
        <!-- <el-table-column
          label="序号"
          width="60"
          fixed
          type="index"
        ></el-table-column> -->
        <el-table-column
          prop="rowIndex"
          label="序号"
          width="60"
          header-align="center"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="fileName"
          label="工作簿（文件名）"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <div>
              <span
                v-if="
                  scope.row.fileName.endsWith('.xls') ||
                  scope.row.fileName.endsWith('.xlsx')
                "
              >
                <svg class="icon" aria-hidden="true">
                  <use xlink:href="#icon-xls"></use>
                </svg>
              </span>
              <span v-else-if="scope.row.fileName.endsWith('.csv')">
                <svg class="icon" aria-hidden="true">
                  <use xlink:href="#icon-CSV"></use>
                </svg>
              </span>
              <span v-if="scope.row.fileName.endsWith('.txt')">
                <svg class="icon" aria-hidden="true">
                  <use xlink:href="#icon-txt"></use>
                </svg>
              </span>
              {{ scope.row.fileName }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="sheetName"
          label="工作表（sheet）"
          show-overflow-tooltip
        >
          <!-- <template slot-scope="scope">
            <el-input
              :value="scope.row.sheetName"
              size="mini"
              disabled
            ></el-input>
          </template> -->
        </el-table-column>
        <el-table-column prop="mc" label="数据类型" show-overflow-tooltip>
          <template slot-scope="scope">
            <el-select
              :value="scope.row.mc"
              placeholder="请选择"
              size="mini"
              :disabled="!scope.row.enableModify"
              @change="
                (val) => {
                  handleChangeDataType(val, scope.$index);
                }
              "
            >
              <el-option
                v-for="item in scope.row.DataTypeList"
                :key="item.pdm"
                :label="item.mc"
                :value="item.pdm"
              ></el-option>
            </el-select>
            <el-button
              size="mini"
              class="iconfont"
              style="font-size: 15px"
              type="text"
              @click="handleModify(scope.$index, scope.row)"
              >{{
                !scope.row.enableModify ? "&#xe60d;" : "&#xe60e;"
              }}</el-button
            >
          </template>
        </el-table-column>
        <el-table-column label="匹配目标表" show-overflow-tooltip>
          <template slot-scope="scope">
            <el-select
              filterable
              :value="scope.row.matchedMbdm"
              placeholder="请选择"
              size="mini"
              @change="
                (val) => {
                  handleChangeMatchTemplate(val, scope.$index);
                }
              "
            >
              <el-option
                v-for="item in scope.row.matchedMbdmList"
                :key="item.id"
                :label="item.mbmc"
                :value="item.mbdm"
                :disabled="item.disabled"
              ></el-option>
            </el-select>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 20px" v-if="currentRow">
        <div>
          <span style="font-size: 16px">
            <b>数据文件实例表</b>
          </span>
          <el-tooltip
            effect="dark"
            content="点击查看文件"
            placement="top-start"
          >
            <el-button
              size="mini"
              type="text"
              @click="handleClickLookFile(currentRow.filePathName)"
            >
              {{ currentRow.fileName }}</el-button
            >
          </el-tooltip>
          <span style="color: #f29c38; font-size: 10px"
            >首次进行某类文件导入时，建议手动对字段进行精确匹配，系统会记录以便后续自动匹配。</span
          >
        </div>
        <el-table
          stripe
          :data="currentRow ? currentRow.dataList : []"
          height="200"
          border
          style="width: 100%"
          size="mini"
        >
          <el-table-column
            label="序号"
            width="60"
            type="index"
            fixed
          ></el-table-column>
          <el-table-column
            prop="fileColName"
            label="文件字段"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            prop="ins1"
            label="文件表数据实例1"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            prop="ins2"
            label="文件表数据实例2"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column label="数据库字段" show-overflow-tooltip>
            <template slot-scope="scope">
              <el-select
                :value="scope.row.matchedFieldName"
                placeholder
                size="mini"
                filterable
                @change="
                  (val) => {
                    handleChangeMatchColName(val, scope.$index, scope.row);
                  }
                "
              >
                <el-option
                  v-for="item in currentRow.templateToFieldObjList"
                  :key="item.id"
                  :label="item.fieldcname"
                  :value="item.fieldename"
                  :disabled="item.disabled"
                ></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column
            prop="operation"
            label="操作/提示"
            show-overflow-tooltip
            header-align="center"
            align="center"
          >
            <template slot-scope="scope">
              <div v-show="scope.row.matchedFieldName.toLowerCase() === 'jdbz'">
                <el-button
                  size="mini"
                  type="success"
                  @click="handleClickJdbz(scope.row)"
                  >收付标志设置</el-button
                >
              </div>
              <div v-show="scope.row.sameMatchedRow" style="color: #d07d76">
                重复的字段选取
              </div>
            </template>
          </el-table-column>
        </el-table>
        <el-row style="margin-top: 20px">
          <el-col :span="8">&nbsp;</el-col>
          <el-col :span="8"
            ><div style="text-align: center">
              <el-button
                @click="handleClickSubmit"
                type="primary"
                size="small"
                style="width: 100%"
                >导入到临时数据表</el-button
              >
            </div></el-col
          >
          <el-col :span="8">
            <div
              v-if="errorRowNumArr.length > 0 && checkOver"
              style="text-align: right"
            >
              <el-button
                type="text"
                @click="handleClickCancelErrorRow"
                size="mini"
                >取消勾选错误的行?</el-button
              >
            </div></el-col
          >
        </el-row>
      </div>
    </div>
    <div v-if="showJdbzDialogVisible">
      <jdbz-dialog :formData="formData"></jdbz-dialog>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import path from "path";
import fs from "fs";
import { BrowserWindow } from "electron";
import JdbzDialog from "./child/jdbzDialog";
export default {
  mounted() {
    let _this = this;
    this.$electron.ipcRenderer.on(
      "parse-one-example-sheet-over",
      (event, data) => {
        if (!data.success) {
          let tip;
          if (data.errormsg.includes("invalid signature")) {
            tip = "为老版本（2003）之前的格式，请使用工具进行批量转换！";
          }
          const h = _this.$createElement;
          let message = `文件：[${data.filePathName}] ${tip}`;
          _this.$message({
            title: "解析文件出错",
            message: h("i", { style: "color: teal" }, `${message}`),
          });
        } else {
          _this.$store.commit("DataCollection/ADD_CSV_DATA_TO_LIST", data);
          if (data.matchedMbdm.length > 0) {
            _this.$refs.multipleTable.toggleRowSelection(data, true);
          }
        }
      }
    );
    this.$electron.ipcRenderer.on(
      "parse-all-example-file-over",
      (event, data) => {
        _this.loading = false;
        _this.currentRow =
          _this.exampleDataList[_this.exampleDataList.length - 1];
      }
    );
  },
  destroyed() {
    this.$electron.ipcRenderer.removeAllListeners(
      "parse-one-example-sheet-over"
    );
    this.$electron.ipcRenderer.removeAllListeners(
      "parse-all-example-file-over"
    );
  },
  computed: {
    ...mapState("DataCollection", ["buttonGroupList", "exampleDataList"]),
    ...mapState("CaseDetail", ["caseBase", "batchCount"]),
    ...mapState("DialogPopWnd", ["showJdbzDialogVisible"]),
  },
  data() {
    return {
      radioImportType: "openFile",
      checkOver: false,
      formData: null,
      loadingText: "拼命加载中，请耐心等待...",
      loading: false,
      value: "",
      currentRow: null, // 其实是一个指针，指向了exampleDataList中的某条数据
      parseFileCount: 0,
      multipleSelection: [],
      errorRowNumArr: [], // 记录不符合规矩的文件行号
    };
  },
  components: { JdbzDialog },
  methods: {
    rowClassName({ row, rowIndex }) {
      row.rowIndex = rowIndex + 1;
    },
    async handleClickCancelErrorRow() {
      for (let row of this.$refs.multipleTable.selection) {
        if (this.errorRowNumArr.includes(row.rowIndex)) {
          //console.log(row.rowIndex);
          await this.$refs.multipleTable.toggleRowSelection(row, false);
        }
      }
      this.$message({
        type: "success",
        message: "取消勾选成功",
      });
    },
    async sleep(ms) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve("done");
        }, ms);
      });
    },

    async checkFileRowError(data) {
      if (data.matchedMbdm === "") {
        this.$message.error({
          title: "错误",
          message: `[${data.fileName}]的[${data.sheetName}]没有匹配的目标表, 请修改后继续！错误行号：${data.rowIndex}`,
        });
        this.errorRowNumArr.push(data.rowIndex);
        return;
      }
      let allFieldList = [];
      for (let item of data.dataList) {
        if (item.sameMatchedRow) {
          this.$message.error({
            title: "错误",
            message: `[${data.fileName}]的[${data.sheetName}]存在重复字段, 请修改后继续！错误行号：${data.rowIndex}`,
          });
          this.errorRowNumArr.push(data.rowIndex);
          return;
        }
        allFieldList.push(item.matchedFieldName);
      }
      let matchedTemplateObj = data.matchedMbdmList.filter((el) => {
        return el.mbdm === data.matchedMbdm;
      });
      switch (matchedTemplateObj[0].tablecname) {
        case "gas_account_info":
          {
            let filterTemp = allFieldList.filter((el) => {
              return el.toUpperCase() === "ZH" || el.toUpperCase() === "KH";
            });
            if (filterTemp.length === 0) {
              this.$message.error({
                title: "错误",
                message: `[${data.fileName}]的[${data.sheetName}]中账号和卡号至少需要匹配一项，错误行号：${data.rowIndex}`,
              });
              this.errorRowNumArr.push(data.rowIndex);
              return;
            }
          }
          break;
        case "gas_tax_records":
          {
            // let filterTemp = allFieldList.filter((el) => {
            //   return el === "ZH" || el === "KH";
            // });
            // if (filterTemp.length === 0) {
            //   this.$message.error({
            //     title: "错误",
            //     message: `[${data.fileName}]的[${data.sheetName}]中账号和卡号至少需要匹配一项`,
            //   });
            //   return;
            // }
          }
          break;
        case "gas_bank_records_source":
          {
            for (let item of data.dataList) {
              if (item.matchedFieldName.toLowerCase() === "jdbz") {
                if (
                  !["进", "出", ""].includes(item.ins1) &&
                  !["进", "出", ""].includes(item.ins2)
                ) {
                  this.$message.error({
                    title: "错误",
                    message: `[${data.fileName}]的[${data.sheetName}]收付标志错误, 请进行收付设置后继续！`,
                  });
                  this.errorRowNumArr.push(data.rowIndex);
                  return;
                } else {
                  this.$store.commit("DataCollection/SET_INOUT_FLAG_BY_ID", {
                    id: data.id,
                    inFlag: "进",
                    outFlag: "出",
                  });
                }
              }
            }
          }
          break;
      }
    },

    async handleClickSubmit() {
      if (this.multipleSelection.length > 0) {
        this.errorRowNumArr = [];
        this.checkOver = false;
        for (let data of this.multipleSelection) {
          await this.sleep(5);
          await this.checkFileRowError(data);
        }
        this.checkOver = true;
        if (this.errorRowNumArr.length > 0) {
          return;
        }
        this.$store.commit("DialogPopWnd/SET_STANDARDVIEW", "process-import");
        // 数据加工和处理，给每个sheet生成headers、matchedFields
        let newExampleList = [];
        for (let sheetData of this.multipleSelection) {
          let headers = []; // 表头，选中的字段列表,
          // 把行号添加进来，进行展示便于操作数据
          headers.push({
            fieldcname: "行号",
          });
          let matchedFields = [];
          for (let item of sheetData.dataList) {
            if (item.matchedFieldName !== "") {
              let temp = sheetData.templateToFieldObjList.filter((e) => {
                return (
                  item.matchedFieldName.toLowerCase() ===
                  e.fieldename.toLowerCase()
                );
              });
              if (temp.length > 0) {
                headers.push(temp[0]);
                matchedFields.push(item.matchedFieldName);
              }
            }
          }
          sheetData.headers = headers;
          sheetData.matchedFields = matchedFields;
          newExampleList.push(sheetData);
        }
        // 以被选择的数据作为新的vuex数据
        this.$store.commit(
          "DataCollection/RET_SET_EXAMPLEDATALIST",
          newExampleList
        );
        this.$electron.ipcRenderer.send("read-all-file", newExampleList);
      } else {
        this.$message.error({
          title: "错误",
          message: `当前没有选择任何需要导入的数据, 请勾选后继续进行！`,
        });
      }
    },
    //
    handleChangeDataType(value, rowIndex) {
      this.$store.dispatch("DataCollection/modifyDataType", {
        value,
        rowIndex,
      });
    },
    //修改enableModify
    handleModify(index, row) {
      let enableModify = row.enableModify ? false : true;
      this.$store.commit("DataCollection/MODIFY_DATATYPE_ENABLEMODIFY", {
        row,
        enableModify,
      });
    },
    async handleClickLookFile(filePathName) {
      await this.$electron.shell.openPath(filePathName);
    },
    // 选择模版下拉框
    handleChangeMatchTemplate(selValue, index, row) {
      this.$store.dispatch("DataCollection/changeMatchList", {
        index,
        matchedMbdm: selValue,
      });
      this.$refs.multipleTable.setCurrentRow(this.exampleDataList[index]);
    },
    // 选择模版对应的列名称下拉框
    handleChangeMatchColName(selValue, index) {
      this.$store.commit("DataCollection/MODIFY_CSV_MATCHEDFIELD_NAME_DATA", {
        index,
        matchedFieldName: selValue,
        currentRow: this.currentRow,
      });
    },
    handleClickJdbz(rowData) {
      //console.log(rowData, this.currentRow);
      let { ins1, ins2 } = rowData;
      this.formData = {
        id: this.currentRow.id,
        tips: `系统检测的两行数据中对应列内容分别为'${ins1}', '${ins2}'`,
        inFlag: "",
        outFlag: "",
        filePathName: this.currentRow.filePathName,
      };
      this.$store.commit("DialogPopWnd/SET_SHOWJDBZDIALOGVISIBLE", true);
    },
    // table表点击事件
    handleCurrentChange(currentRow) {
      this.currentRow = currentRow;
    },
    // multipleSelection 代表当前选中的行数据
    handleSelectionChange(multipleSelection) {
      this.multipleSelection = multipleSelection;
    },
    readFileList(dir, filesList = []) {
      const stat = fs.statSync(dir);
      if (!stat.isDirectory()) {
        if ([".xls", ".txt", ".csv", ".xlsx"].includes(path.extname(dir))) {
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
          if (
            [".xls", ".txt", ".csv", ".xlsx"].includes(path.extname(fullPath))
          ) {
            filesList.push(fullPath);
          }
        }
      });
      return filesList;
    },
    // 导入数据
    async handleClickImportData(pdm) {
      let _this = this;
      let mainWindow = this.$electron.remote.getGlobal("mainWindow");
      let filePathList = await this.$electron.remote.dialog.showOpenDialogSync(
        mainWindow,
        {
          title: "数据导入",
          buttonLabel: "打开",
          filters: [
            {
              name: "Support Files",
              extensions: ["xls", "xlsx", "txt", "csv"],
            },
          ],
          properties: ["multiSelections"].concat(this.radioImportType),
        }
      );
      if (typeof filePathList !== "undefined") {
        //console.log(filePathList);
        let allFileList = [];
        filePathList.forEach((item) => {
          this.readFileList(item, allFileList);
        });
        allFileList = this.$lodash.uniq(allFileList);
        this.parseFileCount = allFileList.length;
        this.loading = true;
        this.$electron.ipcRenderer.send("parse-all-example-file", {
          caseBase: this.caseBase,
          batchCount: this.batchCount,
          filePathList: allFileList,
          pdm,
        });
        setTimeout(function () {
          if (_this.loading) {
            _this.loadingText = "文件较大，拼命加载中，请耐心等待...";
          }
        }, 5 * 1000);
      }
    },
  },
};
</script>

<style>
</style>

