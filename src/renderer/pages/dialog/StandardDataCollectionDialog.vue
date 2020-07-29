<template>
  <div>
    <el-dialog
      v-dialogDrag
      :close-on-click-modal="false"
      class="standard-data-dialog"
      :title="title"
      :visible.sync="standardDataVisible"
      width="80%"
      :before-close="handleClose"
      :modal="false"
    >
      <div v-loading="loading">
        <el-row style="text-align:center;">
          <el-button-group>
            <el-button
              size="mini"
              v-for="item of buttonGroupList"
              :key="item.id"
              @click="handleClickImportData(item.pdm)"
            >
              <span class="mybutton iconfont" v-html="item.icon"></span>
              <span>{{item.mc}}</span>
            </el-button>
          </el-button-group>
        </el-row>
        <div style="margin-top:20px;" v-show="exampleDataList.length > 0">
          <span style="font-size:16px;">
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
          >
            <el-table-column type="selection"></el-table-column>
            <el-table-column label="序号" width="60" fixed type="index"></el-table-column>
            <el-table-column prop="fileName" label="工作簿（文件名）" show-overflow-tooltip></el-table-column>
            <el-table-column prop="sheetName" label="工作表（sheet）" show-overflow-tooltip></el-table-column>
            <el-table-column prop="mc" label="数据类型" show-overflow-tooltip>
              <template slot-scope="scope">
                <el-select
                  :value="scope.row.mc"
                  placeholder="请选择"
                  size="mini"
                  :disabled="!scope.row.enableModify"
                  @change="((val)=>{handleChangeDataType(val, scope.$index)})"
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
                  style="font-size:15px;"
                  type="text"
                  @click="handleModify(scope.$index, scope.row)"
                >{{!scope.row.enableModify?"&#xe60d;":"&#xe60e;"}}</el-button>
              </template>
            </el-table-column>
            <el-table-column label="匹配目标表" show-overflow-tooltip>
              <template slot-scope="scope">
                <el-select
                  filterable
                  :value="scope.row.bestMatchTemplate"
                  placeholder="请选择"
                  size="mini"
                  @change="((val)=>{handleChangeMatchTemplate(val, scope.$index)})"
                >
                  <el-option
                    v-for="item in scope.row.matchTemplates"
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
        <div style="margin-top:20px;" v-if="currentRow">
          <div>
            <span style="font-size:16px;">
              <b>数据文件实例表</b>
            </span>
            <span style="font-size:12px;">{{currentRow.fileName}}\{{currentRow.sheetName}}</span>
          </div>
          <el-table
            stripe
            :data="currentRow ? currentRow.dataList : []"
            height="200"
            border
            style="width: 100%"
            size="mini"
          >
            <el-table-column label="序号" width="60" type="index" fixed></el-table-column>
            <el-table-column prop="fileColName" label="文件字段" show-overflow-tooltip></el-table-column>
            <el-table-column prop="ins1" label="文件表数据实例1" show-overflow-tooltip></el-table-column>
            <el-table-column prop="ins2" label="文件表数据实例2" show-overflow-tooltip></el-table-column>
            <el-table-column label="数据库字段" show-overflow-tooltip>
              <template slot-scope="scope">
                <el-select
                  :value="scope.row.matchedFieldName"
                  placeholder
                  size="mini"
                  filterable
                  @change=" ((val)=>{handleChangeMatchColName(val, scope.$index, scope.row)})"
                >
                  <el-option
                    v-for="item in currentRow.templateToFieldNames"
                    :key="item.id"
                    :label="item.fieldcname"
                    :value="item.fieldename"
                    :disabled="item.disabled"
                  ></el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="operation" label="操作/提示" show-overflow-tooltip>
              <template slot-scope="scope">
                <div v-show="scope.row.matchedFieldName.toLowerCase()==='jdbz'">
                  <el-button size="mini" type="text">进出设置</el-button>
                </div>
                <div v-show="scope.row.sameMatchedRow" style="color:#d07d76">重复的字段选取</div>
              </template>
            </el-table-column>
          </el-table>
          <div style="margin-top:20px;text-align: center;">
            <el-button @click="handleClickSubmit">数据导入</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import path from "path";
import { BrowserWindow } from "electron";
export default {
  mounted() {
    let _this = this;
    this.$electron.ipcRenderer.on("read-example-file-over", (event, data) => {
      _this.parseFileCount--;
      if (!data.success) {
        const h = this.$createElement;
        let message = `文件：[${data.filePathName}] 解析错误信息：${data.errormsg}`;
        _this.$notify({
          title: "解析文件出错",
          message: h("i", { style: "color: teal" }, `${message}`),
        });
      } else {
        _this.$store.commit("DataCollection/ADD_CSV_DATA_TO_LIST", data);
        _this.$refs.multipleTable.toggleRowSelection(data, true);
      }

      if (_this.parseFileCount === 0) {
        _this.loading = false;
        if (_this.exampleDataList.length > 0) {
          _this.currentRow =
            _this.exampleDataList[_this.exampleDataList.length - 1];
          _this.$refs.multipleTable.setCurrentRow(_this.currentRow);
        }
      }
    });
  },
  computed: {
    ...mapState("DialogPopWnd", ["standardDataVisible"]),
    ...mapState("DataCollection", ["buttonGroupList", "exampleDataList"]),
    ...mapState("CaseDetail", ["caseDetail", "batchCount"]),
  },
  data() {
    return {
      title: `标准数据采集`,
      loading: false,
      value: "",
      currentRow: null, // 其实是一个指针，指向了exampleDataList中的某条数据
      parseFileCount: 0,
    };
  },
  components: {},
  methods: {
    handleClickSubmit() {
      if (this.multipleSelection.length > 0) {
        for (let data of this.multipleSelection) {
          if (data.bestMatchTemplate === "") {
            this.$notify.error({
              title: "错误",
              message: `[${data.fileName}]的[${data.sheetName}]没有匹配的目标表, 请修改后继续！`,
            });
            return;
          }
          let allFieldList = [];
          for (let item of data.dataList) {
            if (item.sameMatchedRow) {
              this.$notify.error({
                title: "错误",
                message: `[${data.fileName}]的[${data.sheetName}]存在重复字段, 请修改后继续！`,
              });
              return;
            }
            allFieldList.push(item.matchedFieldName);
          }
          let matchedTemplateObj = data.matchTemplates.filter((el) => {
            return el.mbdm === data.bestMatchTemplate;
          });
          switch (matchedTemplateObj[0].tablecname) {
            case "gas_account_info":
              {
                let filterTemp = allFieldList.filter((el) => {
                  return el === "ZH" || el === "KH";
                });
                if (filterTemp.length === 0) {
                  this.$notify.error({
                    title: "错误",
                    message: `[${data.fileName}]的[${data.sheetName}]中账号和卡号至少需要匹配一项`,
                  });
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
                //   this.$notify.error({
                //     title: "错误",
                //     message: `[${data.fileName}]的[${data.sheetName}]中账号和卡号至少需要匹配一项`,
                //   });
                //   return;
                // }
              }
              break;
          }
        }
        this.$electron.ipcRenderer.send(
          "read-all-file",
          this.multipleSelection
        );
      } else {
        this.$notify.error({
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
    // 选择模版下拉框
    handleChangeMatchTemplate(selValue, index, row) {
      console.log(selValue, index, row);
      this.$store.dispatch("DataCollection/changeMatchList", {
        index,
        bestMatchTemplate: selValue,
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
    // table表点击事件
    handleCurrentChange(val) {
      console.log("handleCurrentChange:", val);
      this.currentRow = val;
    },
    handleClose() {
      this.currentStepIndex = 1;
      this.$store.commit("DialogPopWnd/SET_STANDARDDATAVISIBLE", false);
      this.$store.commit("DataCollection/CLEAR_CSV_DATA_LIST");
      // this.$electron.ipcRenderer.removeAllListeners("read-csv-file-over");
    },
    // multipleSelection 代表当前选中的行数据
    handleSelectionChange(val) {
      this.multipleSelection = val;
      console.log("handleSelectionChange:", this.multipleSelection);
    },

    async handleClickImportData(pdm) {
      console.log(pdm);
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
      console.log(filePathList);
      if (typeof filePathList === "undefined") return;
      this.parseFileCount = filePathList.length;
      if (typeof filePathList !== "undefined") {
        this.loading = true;

        for (let filePathName of filePathList) {
          console.log(filePathName);
          this.$electron.ipcRenderer.send("read-example-file", {
            caseDetail: this.caseDetail,
            batchCount: this.batchCount,
            filePathName,
            pdm,
          });
        }
        console.log("over");
      }
    },
  },
};
</script>

<style>
.standard-data-dialog .el-dialog {
  /* box-shadow: 5px 5px 10px 1px gray, -5px 5px 5px 2px rgba(255, 255, 255, 0.5); */
  border: 1px solid gray;
}
.standard-data-dialog .el-dialog__header {
  background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%);
}
.standard-data-dialog .el-dialog__title {
  color: white;
}
</style>

