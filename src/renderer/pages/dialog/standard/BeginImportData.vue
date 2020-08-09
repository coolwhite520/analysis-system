<template>
  <div v-loading="loading">
    <el-row style="text-align:center;">
      <span style="font-size:13px;">标准导入：</span>
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
    <el-row style="text-align:center;margin-top:20px;">
      <span style="font-size:13px;">自动导入：</span>
      <el-tooltip effect="dark" content="可以自动分析文件字段并进行自动匹配" placement="top">
        <el-button size="mini" @click="handleClickImportData('')">
          <span class="mybutton iconfont">&#xe620;</span>
          <span>智能文件导入</span>
        </el-button>
      </el-tooltip>
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
          <el-button @click="handleClickSubmit" type="primary">数据临时导入</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import path from "path";
import { BrowserWindow } from "electron";
export default {
  mounted() {
    console.log("mounted....................");
    let _this = this;
    this.$electron.ipcRenderer.on(
      "read-one-example-sheet-over",
      (event, data) => {
        console.log("read-one-example-sheet-over******************");
        if (!data.success) {
          const h = _this.$createElement;
          let message = `文件：[${data.filePathName}] 解析错误信息：${data.errormsg}`;
          _this.$notify({
            title: "解析文件出错",
            message: h("i", { style: "color: teal" }, `${message}`),
          });
        } else {
          _this.$store.commit("DataCollection/ADD_CSV_DATA_TO_LIST", data);
        }
      }
    );
    this.$electron.ipcRenderer.on(
      "read-all-example-file-over",
      (event, data) => {
        _this.loading = false;
        _this.currentRow =
          _this.exampleDataList[_this.exampleDataList.length - 1];
        _this.$refs.multipleTable.toggleAllSelection();
      }
    );
  },
  destroyed() {
    console.log("destroyed..............");
    this.$electron.ipcRenderer.removeAllListeners(
      "read-one-example-sheet-over"
    );
    this.$electron.ipcRenderer.removeAllListeners("read-all-example-file-over");
  },
  computed: {
    ...mapState("DataCollection", ["buttonGroupList", "exampleDataList"]),
    ...mapState("CaseDetail", ["caseBase", "batchCount"]),
  },
  data() {
    return {
      loading: false,
      value: "",
      currentRow: null, // 其实是一个指针，指向了exampleDataList中的某条数据
      parseFileCount: 0,
      multipleSelection: [],
    };
  },
  components: {},
  methods: {
    handleClickSubmit() {
      if (this.multipleSelection.length > 0) {
        console.log("this.multipleSelection", this.multipleSelection.length);
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
              let temp = sheetData.templateToFieldNames.filter((e) => {
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
        this.$electron.ipcRenderer.send("read-all-example-file", {
          caseBase: this.caseBase,
          batchCount: this.batchCount,
          filePathList,
          pdm,
        });
      }
    },
  },
};
</script>

<style>
</style>

