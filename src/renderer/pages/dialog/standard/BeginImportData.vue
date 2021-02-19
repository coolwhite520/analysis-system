<template>
  <div v-loading="loading" :element-loading-text="loadingText">
    <!-- <el-row>
      <span style="font-size:12px;">标准导入：</span>
    </el-row>-->
    <div class="fileImport" v-show="exampleDataList.length === 0">
      <div style="text-align: center">
        导入数据方式：
        <el-radio v-model="radioImportType" label="openFile">文件</el-radio>
        <el-radio v-model="radioImportType" label="openDirectory"
          >目录</el-radio
        >
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
      <el-row style="text-align: center">
        <!-- <span style="font-size:12px;">自动导入：</span> -->
        <el-tooltip
          :hide-after="1000 * 5"
          effect="dark"
          content="可以自动分析文件字段并进行自动匹配"
          placement="top"
        >
          <el-button size="mini" @click="handleClickImportData('')">
            <span class="mybutton iconfont">&#xe620;</span>
            <span>智能文件导入</span>
          </el-button>
        </el-tooltip>
      </el-row>
    </div>
    <!-- <span style="font-size: 10px; color: gray"
      >可自动分析文件字段并进行自动匹配</span
    > -->
    <el-row
      v-if="oldVersionXlsFileList.length > 0"
      style="margin-top: 10px; margin-bottom: 10px"
    >
      <span style="font-size: 10px; color: red">
        检测到不兼容的数据文件：Office 2007 之前的excel文件
        <b>{{ oldVersionXlsFileList.length }}</b> 个
      </span>
      <el-button size="mini" @click="handleClickShowOldVersionFile">
        <span class="mybutton iconfont">&#xe678;</span>
        <span>点击进行查看</span>
      </el-button>
      <el-button size="mini" @click="handleClickOpenConvert" type="success">
        <span class="mybutton iconfont">&#xe631;</span>
        <span>打开文件格式转换工具</span>
      </el-button>
    </el-row>
    <div v-show="exampleDataList.length > 0">
      <div
        class="mainTable"
        v-show="!isExpandDetailTable"
        style="margin-bottom: 10px"
      >
        <el-row>
          <el-col :span="5">
            <span style="font-size: 16px; color: black">
              <b>文件匹配表:</b>
            </span>
            <el-button-group>
              <el-tooltip
                class="item"
                effect="dark"
                content="智能文件导入"
                placement="top"
                :hide-after="1000 * 5"
              >
                <el-button
                  size="mini"
                  type="primary"
                  @click="handleClickImportData('')"
                  class="iconfont"
                  style="font-size: 10px"
                >
                  &#xe620;</el-button
                >
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="dark"
                content="重新采集数据"
                placement="top"
                :hide-after="1000 * 5"
              >
                <el-button
                  type="success"
                  size="mini"
                  class="iconfont"
                  style="font-size: 10px"
                  @click="handleClickReImportData"
                  >&#xe652;</el-button
                >
              </el-tooltip>
            </el-button-group>
            <!-- <span v-for="(item, index) of groupCheckBoxList" :key="index"
              >{{ item.label }},</span
            > -->
          </el-col>
          <el-col :span="18" style="text-align: right">
            <el-checkbox-group v-model="selectedCheckBoxList" size="mini">
              <el-checkbox-button
                v-for="(item, index) of groupCheckBoxList"
                :label="
                  item.ids.length > 0
                    ? item.label + '(' + item.ids.length + ')'
                    : item.label
                "
                :key="index"
                border
                @change="
                  (checked) => handleChangeCheckBox(item.matchedMbdm, checked)
                "
              >
              </el-checkbox-button>
            </el-checkbox-group>
          </el-col>
          <el-col :span="1" style="text-align: right">
            <el-button size="mini" type="text" @click="handleClickExpandMain">
              <span class="iconfont">{{
                isExpandMainTable ? "&#xe6db;" : "&#xe6cc;"
              }}</span>
            </el-button>
          </el-col>
        </el-row>
        <el-table
          :ref="multipleTableId"
          :data="exampleDataList"
          :height="isExpandMainTable ? 400 : 200"
          border
          style="width: 100%"
          size="mini"
          highlight-current-row
          @current-change="handleCurrentChange"
          :row-class-name="rowClassName"
          @select="handleSelectRow"
          @select-all="handleSelectAll"
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
      </div>
      <div class="detailTable" v-if="currentRow" v-show="!isExpandMainTable">
        <el-row>
          <el-col :span="22"
            ><span style="font-size: 16px; color: black">
              <b>字段匹配表:</b>
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
            ></el-col
          >
          <el-col :span="2" style="text-align: right">
            <el-button size="mini" type="text" @click="handleClickExpandDetail">
              <span class="iconfont">{{
                isExpandDetailTable ? "&#xe6db;" : "&#xe6cc;"
              }}</span>
            </el-button>
          </el-col>
        </el-row>
        <el-table
          :ref="detailTableId"
          stripe
          :data="currentRow ? currentRow.dataList : []"
          :height="isExpandDetailTable ? 400 : 200"
          border
          style="width: 100%"
          size="mini"
        >
          <el-table-column
            label="序号"
            width="60"
            type="index"
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
      </div>

      <el-row style="margin-top: 20px">
        <el-col :span="8"> &nbsp; </el-col>
        <el-col :span="8"
          ><div style="text-align: center">
            <el-button
              @click="handleClickSubmit"
              type="primary"
              size="small"
              style="width: 100%"
              :loading="btnLoading"
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
              style="font-size: 11px"
              size="mini"
              >取消勾选错误的行?</el-button
            >
          </div></el-col
        >
      </el-row>
    </div>
    <div v-if="showJdbzDialogVisible">
      <jdbz-dialog :formData="formData"></jdbz-dialog>
    </div>
    <file-convert
      v-if="showConvertDialog"
      :iniImportDir="oldVersionTempPath"
    ></file-convert>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import path from "path";
import fs from "fs";
const uuid = require("uuid");
import JdbzDialog from "./child/jdbzDialog";
import FileConvert from "@/pages/dialog/fileConvert/fileConvert";
export default {
  mounted() {
    let _this = this;
    this.$electron.ipcRenderer.on(
      "parse-one-example-sheet-over",
      (event, data) => {
        if (!data.success) {
          let tip;
          if (data.errormsg.includes("invalid signature")) {
            tip = "为2007之前的版本xls格式，请切换到[工具]菜单进行批量转换！";
            let fileName = path.basename(data.filePathName);
            this.oldVersionXlsFileList.push(fileName);
            console.log(fileName);
            if (!fs.existsSync(this.oldVersionTempPath)) {
              fs.mkdirSync(this.oldVersionTempPath, { recursive: true });
            }
            this.copyFile(
              data.filePathName,
              path.join(this.oldVersionTempPath, fileName)
            );
          }
          console.log(data);
          const h = _this.$createElement;
          let message = `文件：[${data.filePathName}] ${tip}`;
          _this.$message({
            title: "解析文件出错",
            message: h("i", { style: "color: teal" }, `${message}`),
          });
        } else {
          _this.$store.commit("DataCollection/ADD_CSV_DATA_TO_LIST", data);
          if (data.matchedMbdm.length > 0) {
            _this.$refs[`${this.multipleTableId}`].toggleRowSelection(
              data,
              true
            );
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
        this.calculateCheckBoxBySelection(
          this.$refs[`${this.multipleTableId}`].selection
        );
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
    ...mapState("DialogPopWnd", ["showJdbzDialogVisible", "showConvertDialog"]),
  },
  data() {
    return {
      groupCheckBoxList: [],
      selectedCheckBoxList: [],
      isExpandMainTable: false,
      isExpandDetailTable: false,
      multipleTableId: uuid.v1(),
      detailTableId: uuid.v1(),
      btnLoading: false,
      oldVersionXlsFileList: [],
      radioImportType: "openFile",
      checkOver: false,
      formData: null,
      loadingText: "拼命加载中，请耐心等待...",
      loading: false,
      value: "",
      currentRow: null, // 其实是一个指针，指向了exampleDataList中的某条数据
      parseFileCount: 0,
      errorRowNumArr: [], // 记录不符合规矩的文件行号
      oldVersionTempPath: "",
    };
  },
  components: { JdbzDialog, "file-convert": FileConvert },
  methods: {
    handleChangeCheckBox(matchedMbdm, val) {
      let ids = [];
      for (let row of this.exampleDataList) {
        if (row.matchedMbdm === matchedMbdm) {
          this.$refs[`${this.multipleTableId}`].toggleRowSelection(row, val);
          if (val) ids.push(row.id);
        }
      }
      console.log(this.selectedCheckBoxList);
      this.selectedCheckBoxList = [];
      for (let item of this.groupCheckBoxList) {
        if (item.matchedMbdm === matchedMbdm) {
          item.ids = ids;
        }
        if (item.ids.length > 0) {
          this.selectedCheckBoxList.push(
            item.label + "(" + item.ids.length + ")"
          );
        }
      }
    },
    handleClickExpandMain() {
      this.isExpandMainTable = !this.isExpandMainTable;
      this.$nextTick(() => {
        this.$refs[`${this.detailTableId}`].doLayout();
        this.$refs[`${this.multipleTableId}`].doLayout();
      });
    },
    handleClickExpandDetail() {
      this.isExpandDetailTable = !this.isExpandDetailTable;
      this.$nextTick(() => {
        this.$refs[`${this.detailTableId}`].doLayout();
        this.$refs[`${this.multipleTableId}`].doLayout();
      });
    },
    async handleClickShowOldVersionFile() {
      await this.$electron.shell.openPath(this.oldVersionTempPath);
    },
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
    rowClassName({ row, rowIndex }) {
      row.rowIndex = rowIndex + 1;
    },
    async handleClickCancelErrorRow() {
      for (let row of this.$refs[`${this.multipleTableId}`].selection) {
        if (this.errorRowNumArr.includes(row.rowIndex)) {
          this.$refs[`${this.multipleTableId}`].toggleRowSelection(row, false);
        }
      }
      this.calculateCheckBoxBySelection(
        this.$refs[`${this.multipleTableId}`].selection
      );
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
    calculateCheckBoxBySelection(selection) {
      // 先构造整体按钮组，然后赋值
      let list = this.exampleDataList.map((item) => {
        return {
          id: item.id,
          matchedMbdm: item.matchedMbdm,
          label: item.mbmc ? item.mbmc : "未匹配",
        };
      });
      let retArr = [];
      for (let item of list) {
        let { id, label, matchedMbdm } = item;
        let obj = retArr.find((obj) => obj.matchedMbdm === matchedMbdm);
        if (!obj) {
          retArr.push({
            label,
            matchedMbdm,
            ids: [],
          });
        }
      }
      this.groupCheckBoxList = retArr;

      if (selection.length > 0) {
        let list = selection.map((item) => {
          return {
            id: item.id,
            matchedMbdm: item.matchedMbdm,
            label: item.mbmc ? item.mbmc : "未匹配",
          };
        });
        // let retArr = [];
        for (let item of list) {
          let { matchedMbdm } = item;
          let obj = this.groupCheckBoxList.find(
            (obj) => obj.matchedMbdm === matchedMbdm
          );
          if (obj) {
            obj.ids.push(item.id);
          }
        }
        this.groupCheckBoxList.sort(function (a, b) {
          return b.label - a.label;
        });
        // 重新赋值选中
        this.selectedCheckBoxList = [];
        for (let item of this.groupCheckBoxList) {
          if (item.ids.length > 0) {
            this.selectedCheckBoxList.push(
              item.label + "(" + item.ids.length + ")"
            );
          }
        }
      }
    },
    handleSelectAll(selection) {
      this.calculateCheckBoxBySelection(selection);
    },
    handleSelectRow(selection, row) {
      this.$refs[`${this.multipleTableId}`].setCurrentRow(row);
      this.calculateCheckBoxBySelection(selection);
    },
    async checkFileRowError(data) {
      if (data.matchedMbdm === "") {
        this.$message.error({
          title: "错误",
          message: `[${data.fileName}]的[${data.sheetName}]没有匹配的目标表, 请修改后继续！序号：${data.rowIndex}`,
        });
        this.errorRowNumArr.push(data.rowIndex);
        return;
      }
      let allFieldList = [];
      for (let item of data.dataList) {
        if (item.sameMatchedRow) {
          let sameFieldName = data.templateToFieldObjList.find(
            (obj) =>
              obj.fieldename.toLowerCase() ===
              item.matchedFieldName.toLowerCase()
          ).fieldcname;
          this.$message.error({
            title: "错误",
            message: `序号：${data.rowIndex}：[${data.fileName}]的[${data.sheetName}]存在重复字段[${sameFieldName}], 请修改后继续。`,
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
        case "mz_account_info":
          {
            let filterTemp = allFieldList.filter((el) => {
              return el.toUpperCase() === "ZH" || el.toUpperCase() === "KH";
            });
            if (filterTemp.length === 0) {
              this.$message.error({
                title: "错误",
                message: `序号：${data.rowIndex}：[${data.fileName}]的[${data.sheetName}]中账号和卡号至少需要匹配一项。`,
              });
              this.errorRowNumArr.push(data.rowIndex);
              return;
            }
          }
          break;
        case "mz_tax_records":
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
        case "mz_bank_records_source":
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
    async handleClickOpenConvert() {
      this.$store.commit("DialogPopWnd/SET_SHOWCONVERTDIALOG", true);
    },
    async handleClickSubmit() {
      let selection = this.$refs[`${this.multipleTableId}`].selection;
      if (selection.length > 0) {
        this.errorRowNumArr = [];
        this.checkOver = false;
        this.btnLoading = true;
        for (let dataRow of selection) {
          await this.sleep(5);
          await this.checkFileRowError(dataRow);
        }
        this.checkOver = true;
        if (this.errorRowNumArr.length > 0) {
          this.btnLoading = false;
          return;
        }
        this.$store.commit("DialogPopWnd/SET_STANDARDVIEW", "process-import");
        // 数据加工和处理，给每个sheet生成headers、matchedFields
        let newExampleList = [];
        for (let sheetData of selection) {
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
        this.btnLoading = false;
      } else {
        this.$message.error({
          title: "错误",
          message: `当前没有选择任何需要导入的数据, 请勾选后继续进行！`,
        });
        this.btnLoading = false;
      }
    },
    //
    handleChangeDataType(value, rowIndex) {
      this.$store.dispatch("DataCollection/modifyDataType", {
        value,
        rowIndex,
      });
      this.calculateCheckBoxBySelection(
        this.$refs[`${this.multipleTableId}`].selection
      );
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
    handleChangeMatchTemplate(selValue, index) {
      this.$store.dispatch("DataCollection/changeMatchList", {
        index,
        matchedMbdm: selValue,
      });
      this.$refs[`${this.multipleTableId}`].setCurrentRow(
        this.exampleDataList[index]
      );
      this.calculateCheckBoxBySelection(
        this.$refs[`${this.multipleTableId}`].selection
      );
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
    async handleClickReImportData() {
      let result = await this.$electron.remote.dialog.showMessageBox(null, {
        type: "warning",
        title: "关闭",
        message: `确定要重新采集数据吗？`,
        buttons: ["确定", "取消"],
        defaultId: 0,
      });
      if (result.response === 0) {
        this.$store.commit("DataCollection/RET_SET_EXAMPLEDATALIST", []);
      } else {
        return;
      }
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
        this.oldVersionXlsFileList = [];
        let tempPath = this.$electron.remote.app.getPath("temp");
        this.oldVersionTempPath = path.join(tempPath, uuid.v1());
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
.el-dropdown-link {
  cursor: pointer;
  color: #409eff;
}
.el-icon-arrow-down {
  font-size: 12px;
}
</style>

