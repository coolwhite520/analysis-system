<template>
  <div>
    <div
      v-loading="isDataLoading"
      :element-loading-text="loadingText"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.8)"
    >
      <el-row>
        <div
          style="float:left;"
          v-show="bClickBtnCheck&&!isDataLoading&&sheetItem.showRows.length > 0"
        >
          <h3>下表为错误数据示例：</h3>
        </div>
        <div style="float:right;">
          <el-button
            size="small"
            type="primary"
            @click="handleClickCheckData"
          >&nbsp;&nbsp;一键智能数据检查&nbsp;&nbsp;</el-button>
        </div>
      </el-row>
      <el-row style="margin-top:10px;">
        <el-col :span="24">
          <el-table
            :cell-style="{padding:'0px'}"
            style="width: 100%;"
            :data="sheetItem.showRows"
            size="mini"
            stripe
            border
            height="300"
          >
            <!-- <el-table-column type="index" width="50" fixed label="编号"></el-table-column> -->
            <el-table-column
              show-overflow-tooltip
              v-for="(header, index) in sheetItem.headers"
              :label="header.fieldcname"
              :key="index"
            >
              <template slot-scope="scope">
                <div
                  :style="{color: scope.row[index].error?'red': 'gray'}"
                >{{ scope.row[index].value}}</div>
              </template>
            </el-table-column>
          </el-table>
          <el-row>
            <div
              style="float:left;margin-top:10px;font-size:10px;"
            >每页显示{{pageSize}}条，当前页面条目数量：{{sheetItem.showRows.length}}条</div>
            <div style="float:right;margin-top:10px;">
              <el-pagination
                small
                layout="prev, pager, next"
                :page-size="pageSize"
                :total="sheetItem.rowSum"
                @current-change="handleCurrentChange"
              ></el-pagination>
            </div>
          </el-row>
        </el-col>
      </el-row>
      <el-row v-show="bClickBtnCheck&&!isDataLoading&&sheetItem.showRows.length > 0">
        <div style="font-size:12px;">
          <span style="color:red;">存在错误数据列：</span>
          <el-button-group>
            <el-button
              v-for="item in sheetItem.errorFields"
              :key="item.fieldename"
              round
              type="primary"
              size="mini"
              @click="handleClickBtnGroup(item)"
            >{{item.fieldcname}}({{item.rownums.length}})条</el-button>
          </el-button-group>&nbsp;&nbsp;请点击按钮进行批量数据处理，或点击
          <el-button type="danger" size="mini" @click="handleClickDeleteAllErrorRows">一键删除</el-button>&nbsp;&nbsp;清理所有的异常数据。
        </div>
      </el-row>
      <el-row
        v-show="bClickBtnCheck&&!isDataLoading&&sheetItem.showRows.length===0"
        style="text-align:center;"
      >
        <div style="font-size:10px;color: green;margin-bottom:5px;">当前数据已经没有错误，可以进行导入操作了，请点击下面的按钮。</div>
        <div>
          <el-button size="small" type="primary" @click="handleClickImportCurrentData">导入当前数据</el-button>
        </div>
      </el-row>
    </div>
    <el-row>
      <div v-show="currentPercentage > 0" style="margin-top:20px;">
        <el-progress :percentage="currentPercentage"></el-progress>
      </div>
    </el-row>
    <div>
      <el-dialog
        width="30%"
        :title="innerDlgTitle"
        :close-on-click-modal="false"
        class="standard-data-dialog"
        :visible.sync="innerVisible"
        v-dialogDrag
        top="30vh"
        append-to-body
        :modal="false"
      >
        <el-row v-loading="isUpdateDataLoading" :element-loading-text="updateloadingText">
          <el-col :span="1">&nbsp;</el-col>
          <el-col :span="22">
            <div v-if=" currentErrorField.filterName === 'exceedLen'">
              <div>
                <div style="margin-bottom:10px;">长度超过了{{item.fieldlength}}位的限制长度`</div>
                <div style="font-size: 10px;margin-bottom:5px;">请输入新的数据进行批量覆盖：</div>
                <el-input size="mini" v-model="input" placeholder="请输入内容"></el-input>
              </div>
            </div>
            <div v-else-if=" currentErrorField.filterName === 'notNum'">
              <div>
                <div style="margin-bottom:10px;">当前列的数据不是数字类型</div>
                <div style="font-size: 10px;margin-bottom:5px;">请输入新的数据进行批量覆盖：</div>
                <el-input size="mini" type="number" v-model="input" placeholder="请输入数字"></el-input>
              </div>
            </div>
            <div v-else-if=" currentErrorField.filterName === 'notDate'">
              <div>
                <div style="margin-bottom:10px;">当前列的数据不是日期类型</div>
                <div style="font-size: 10px;margin-bottom:5px;">请输入新的数据进行批量覆盖：</div>
                <!-- <el-input size="mini" type="datetime" v-model="input" placeholder="请输入内容"></el-input>
                -->
                <el-date-picker
                  :editable="false"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  type="date"
                  placeholder="选择立案日期"
                  v-model="input"
                  style="width: 100%;"
                ></el-date-picker>
              </div>
            </div>
            <el-row style="margin-top:20px;text-align:center;">
              <el-button type="primary" @click="handleClickSubmitModify">提交修改</el-button>
            </el-row>
          </el-col>
          <el-col :span="1">&nbsp;</el-col>
        </el-row>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import { mapState } from "vuex";
import dataImport from "../../../db/DataImport";
export default {
  props: ["sheetItem", "activeName"],
  data() {
    return {
      loadingText: "正在进行数据检测，请稍后...",
      isUpdateDataLoading: false,
      updateloadingText: "正在进行数据更新，请稍后...",
      currentPercentage: 0,
      isDataLoading: false,
      input: "",
      currentErrorField: {},
      innerVisible: false,
      innerDlgTitle: "",
      bClickBtnCheck: false,
      pageSize: 30,
      filterList: ["exceedLen", "notNum", "notDate"],
    };
  },
  computed: {
    ...mapState("CaseDetail", ["caseBase"]),
    ...mapState("DataCollection", ["exampleDataList"]),
    ...mapState("ShowTable", ["tableDataList"]),
  },
  mounted() {
    this.$electron.ipcRenderer.on(
      "import-one-table-process",
      this.recvImportMsg
    );
  },
  destroyed() {
    this.$electron.ipcRenderer.removeAllListeners("import-one-table-process");
  },
  methods: {
    async handleClickDeleteAllErrorRows() {
      const { ajid } = this.caseBase;
      const { headers, tableName, errorFields } = this.sheetItem;
      let findError = false;
      for (let errorField of errorFields) {
        let result = await dataImport.deleteErrorRows(
          ajid,
          tableName,
          errorField.rownums
        );
        if (!result.success) {
          findError = true;
          this.$notify.error({
            title: "错误",
            message: `数据删除错误, ${result.msg}`,
          });
          break;
        }
      }
      if (!findError) {
        await this.$store.dispatch("DataCollection/QueryTableData", {
          ajid,
          sheetIndex: this.activeName,
          tableName,
          matchedFields: this.sheetItem.matchedFields,
          index: 0,
          filterList: this.filterList,
          limit: this.pageSize,
          headers,
        });
        this.innerVisible = false;
        this.$notify({
          title: "成功",
          message: `数据删除成功！`,
          type: "success",
        });
      }
    },
    async handleClickSubmitModify() {
      if (this.input.length > 0) {
        this.isUpdateDataLoading = true;
        const { ajid } = this.caseBase;
        const { headers, tableName } = this.sheetItem;
        let result = await dataImport.updateErrorRows(
          ajid,
          tableName,
          this.currentErrorField.fieldename,
          this.input,
          this.currentErrorField.rownums
        );
        if (result.success) {
          this.$notify({
            title: "成功",
            message: `数据更新成功！`,
            type: "success",
          });
          await this.$store.dispatch("DataCollection/QueryTableData", {
            ajid,
            sheetIndex: this.activeName,
            tableName,
            matchedFields: this.sheetItem.matchedFields,
            index: 0,
            filterList: this.filterList,
            limit: this.pageSize,
            headers,
          });
          this.innerVisible = false;
        } else {
          this.$notify.error({
            title: "错误",
            message: `数据更新错误, ${result.msg}`,
          });
        }
      } else {
        this.$notify.error({
          title: "错误",
          message: `输入框为空，请输入。`,
        });
      }
      this.isUpdateDataLoading = false;
    },
    // 导入消息的回调
    async recvImportMsg(e, args) {
      let { sumRow, index } = args;
      console.log({ sumRow, index });
      this.currentPercentage = parseInt(parseFloat(index / sumRow) * 100);
      console.log(this.currentPercentage);

      if (this.currentPercentage >= 100) {
        this.bClickBtnCheck = false;
        this.currentPercentage = 0;
        this.isDataLoading = false;

        await this.$store.commit(
          "DataCollection/DELETE_DATA_LIST_BY_INDEX",
          this.activeName
        );
        await this.$store.dispatch(
          "CaseDetail/queryCaseDataCenter",
          this.caseBase.ajid
        );

        if (this.exampleDataList.length === 0) {
          await this.$store.commit(
            "DialogPopWnd/SET_STANDARDDATAVISIBLE",
            false
          );
          await this.$store.commit("DataCollection/CLEAR_CSV_DATA_LIST");
          await this.$store.commit(
            "DialogPopWnd/SET_STANDARDVIEW",
            "begin-import"
          );
        }
        // 更新当前的展示列表中的数据
        for (let tableData of this.tableDataList) {
          // 根据tableName获取表的数据
          await this.$store.dispatch(tableData.dispatchName, {
            ...tableData,
            offset: 0,
            count: 30,
          });
        }
        // 导入成功，清理examplelist
        this.$notify({
          title: "成功",
          message: `数据插入成功`,
          type: "success",
        });
      }
    },
    async handleClickImportCurrentData() {
      this.loadingText = "正在进行数据导入，请稍后...";
      this.isDataLoading = true;
      const { ajid } = this.caseBase;
      let {
        headers,
        tableName,
        tablecname,
        bestMatchTemplate,
        matchedFields,
        publicFields,
        externFields,
      } = this.sheetItem;
      if (tablecname.endsWith("_source")) {
        tablecname = tablecname.slice(0, tablecname.lastIndexOf("_source"));
      }
      this.$electron.ipcRenderer.send("import-one-table-begin", {
        ajid,
        tableName,
        tablecname,
        bestMatchTemplate,
        publicFields,
        matchedFields,
        externFields,
      });
    },
    handleCheckChange(node, Checked, childrenChecked) {
      console.log(node, Checked, childrenChecked);
    },
    handleNodeClick(data) {
      console.log(data);
    },
    // 数据检查 1,字符串,2,小数,3整数,,4,日期,5,通话时长(没有用)
    async handleClickCheckData() {
      this.isDataLoading = true;
      this.bClickBtnCheck = true; // 标记是否点击了当前页面的检测按钮
      const { ajid } = this.caseBase;
      const { headers, tableName } = this.sheetItem;
      await this.$store.dispatch("DataCollection/QueryTableData", {
        ajid,
        sheetIndex: this.activeName,
        tableName,
        matchedFields: this.sheetItem.matchedFields,
        index: 0,
        filterList: this.filterList,
        limit: this.pageSize,
        headers,
      });
      this.isDataLoading = false;
    },
    handleClickBtnGroup(item) {
      console.log(item);
      this.input = "";
      this.innerVisible = true;
      this.currentErrorField = item;
      this.innerDlgTitle = item.fieldcname;
    },
    handleClickTab(index) {
      console.log(index);
    },
    // 需要根据查询过滤条件进行
    async handleCurrentChange(val) {
      console.log(`当前页: ${val}`);
      let tableName = this.sheetItem.tableName;
      let ajid = this.caseBase.ajid;
      let offset = (val - 1) * this.pageSize;
      let matchedFields = this.sheetItem.matchedFields;
      let filterList = this.bClickBtnCheck ? this.filterList : [];
      let headers = this.sheetItem.headers;
      await this.$store.dispatch("DataCollection/QueryTableData", {
        ajid,
        sheetIndex: this.activeName,
        tableName,
        matchedFields,
        index: offset,
        filterList,
        limit: this.pageSize,
        headers,
      });
    },
  },
};
</script>
<style  scoped>
</style>