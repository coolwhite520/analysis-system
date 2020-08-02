<template>
  <div>
    <el-row>
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
    <el-row v-show="bClickBtnCheck&&sheetItem.showRows.length > 0">
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
          >{{item.fieldcname}}</el-button>
        </el-button-group>&nbsp;&nbsp;请点击按钮进行批量数据处理，或点击
        <el-button type="danger" size="mini">一键删除</el-button>&nbsp;&nbsp;清理所有的异常数据。
      </div>
    </el-row>
    <el-row style="text-align:center;" v-show="bClickBtnCheck&&sheetItem.showRows.length===0">
      <div>
        <el-button size="small" type="primary" @click="handleClickImportCurrentData">导入当前数据</el-button>
      </div>
    </el-row>

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
      <div v-if=" currentErrorField.filterName === 'exceedLen'">
        <div>
          <div style="font-size: 13px;margin-bottom:5px;">请输入新的数据进行批量覆盖：</div>
          <el-input size="mini" v-model="input" placeholder="请输入内容"></el-input>
        </div>
      </div>
      <div v-else-if=" currentErrorField.filterName === 'notNum'">
        <div>
          <div style="font-size: 13px;margin-bottom:5px;">请输入新的数据进行批量覆盖：</div>
          <el-input size="mini" type="number" v-model="input" placeholder="请输入数字"></el-input>
        </div>
      </div>
      <div v-else-if=" currentErrorField.filterName === 'notDate'">
        <div>
          <div style="font-size: 13px;margin-bottom:5px;">请输入新的数据进行批量覆盖：</div>
          <el-input size="mini" type="datetime" v-model="input" placeholder="请输入内容"></el-input>
        </div>
      </div>
      <el-row style="margin-top:20px;text-align:center;">
        <el-button type="primary" size="small">提交修改</el-button>
      </el-row>
    </el-dialog>
  </div>
</template>
<script>
import { mapState } from "vuex";
import dataImport from "../../../../db/DataImport";
export default {
  props: ["sheetItem", "activeName"],
  data() {
    return {
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
    ...mapState("CaseDetail", ["caseDetail"]),
    ...mapState("DataCollection", ["exampleDataList"]),
  },
  mounted() {},
  methods: {
    handleClickImportCurrentData() {},
    handleCheckChange(node, Checked, childrenChecked) {
      console.log(node, Checked, childrenChecked);
    },
    handleNodeClick(data) {
      console.log(data);
    },
    // 数据检查 1,字符串,2,小数,3整数,,4,日期,5,通话时长(没有用)
    async handleClickCheckData() {
      this.bClickBtnCheck = true; // 标记是否点击了当前页面的检测按钮
      const { ajid } = this.caseDetail;
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
    },
    handleClickBtnGroup(item) {
      console.log(item);
      this.innerVisible = true;
      this.currentErrorField = item;
      this.innerDlgTitle = item.fieldcname;
      switch (item.filterName) {
        case "exceedLen":
          this.innerDlgTitle += ` - 长度超过了${item.fieldlength}位的限制长度`;
          break;
        case "notNum":
          this.innerDlgTitle += " - 当前列的数据不是数字类型";
          break;
        case "notDate":
          this.innerDlgTitle += " - 当前列的数据不是日期类型";
          break;
      }
    },
    handleClickTab(index) {
      console.log(index);
    },
    // 需要根据查询过滤条件进行
    async handleCurrentChange(val) {
      console.log(`当前页: ${val}`);
      let tableName = this.sheetItem.tableName;
      let ajid = this.caseDetail.ajid;
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