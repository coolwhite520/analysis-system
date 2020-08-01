<template>
  <div>
    <el-row></el-row>
    <el-row style="margin-top:10px;">
      <el-col :span="3">
        <div>
          <h3>数据清理规则</h3>
        </div>
        <div style="margin-top:10px;margin-bottom:10px;">
          <el-tree
            ref="tree"
            :props="defaultProps"
            :data="treeData"
            node-key="id"
            default-expand-all
            :default-checked-keys="['notNum', 'exceedLen', 'notDate']"
            show-checkbox
          ></el-tree>
        </div>
        <div style="margin-top:10px;margin-bottom:100px;">
          <el-button
            size="small"
            type="primary"
            @click="handleClickCheckData"
          >&nbsp;&nbsp;数据检查&nbsp;&nbsp;</el-button>
        </div>
        <!-- <div style="position:absolute;left:0;bottom:0;">
          <div style="margin-top:10px;margin-bottom:10px;">
            <el-button size="small" type="primary" @click="handleClickBatchModify">批量处理</el-button>
          </div>
          <div style="margin-top:10px;margin-bottom:10px;">
            <el-button size="small" type="primary" @click="handleClickBatchDelete">批量删除</el-button>
          </div>
        </div>-->
      </el-col>
      <el-col :span="21">
        <el-table
          :cell-style="{padding:'0px'}"
          style="width: 100%;"
          :data="sheetItem.showRows"
          size="mini"
          stripe
          border
          height="450"
        >
          <el-table-column type="index" width="50" fixed label="编号"></el-table-column>
          <el-table-column
            show-overflow-tooltip
            v-for="(header, index) in sheetItem.headers"
            :label="header.fieldcname"
            :key="index"
          >
            <template slot-scope="scope">
              <div
                :style="{color: scope.row[header.fieldename.toLowerCase()].error?'red': 'black'}"
              >{{ scope.row[header.fieldename.toLowerCase()]}}</div>
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
  </div>
</template>
<script>
import { mapState } from "vuex";
import dataImport from "../../../../db/DataImport";
export default {
  props: ["sheetItem", "activeName"],
  data() {
    return {
      pageSize: 30,
      checkedNumber: true,
      checkedLength: true,
      checkedNull: false, // 不显示，感觉没用
      checkedDate: true,
      defaultProps: {
        children: "children",
        label: "label",
      },
      treeData: [
        { id: "exceedLen", label: "字符过长", children: [] },
        { id: "notNum", label: "非数值", children: [] },
        { id: "notDate", label: "非日期格式", children: [] },
      ],
    };
  },
  computed: {
    ...mapState("CaseDetail", ["caseDetail"]),
    ...mapState("DataCollection", ["exampleDataList"]),
  },
  methods: {
    handleNodeClick(data) {
      console.log(data);
    },
    // 数据检查 1,字符串,2,小数,3整数,,4,日期,5,通话时长(没有用)
    async handleClickCheckData() {
      for (let index = 0; index < this.treeData.length; index++) {
        this.treeData[index].children = [];
      }
      const { ajid } = this.caseDetail;
      const { headers, tableName } = this.sheetItem;

      let checkedKeys = this.$refs.tree.getCheckedKeys();
      let errorRows = [];

      for (let item of headers) {
        if (
          checkedKeys.find((el) => {
            return el === "exceedLen";
          })
        ) {
          if (item.fieldtype === 1) {
            // 检查字符串长度
            let obj = await dataImport.QueryFieldExceedLengthCount(
              ajid,
              tableName,
              item.fieldename,
              item.fieldlength
            );
            console.log("QueryFieldExceedLengthCount", obj);
            if (obj.success && obj.count > 0) {
              if (
                this.treeData[0].children.findIndex((el) => {
                  return el.id === item.fieldename;
                }) === -1
              ) {
                this.treeData[0].children.push({
                  id: item.fieldename,
                  label: item.fieldcname,
                });
                checkedKeys.push(item.fieldename);
                let temp = await dataImport.QueryFieldExceedLengthRows(
                  ajid,
                  tableName,
                  item.fieldename,
                  item.fieldlength
                );
                if (temp.success) errorRows = errorRows.concat(temp.rows);
              }
            } else if (!obj.success) {
              this.$notify.error({
                title: "错误",
                message: obj.msg,
              });
            }
          }
        }
        if (
          checkedKeys.find((el) => {
            return el === "notNum";
          })
        ) {
          if (item.fieldtype === 2 || item.fieldtype === 3) {
            let obj = await dataImport.QueryFieldNotNumberCount(
              ajid,
              tableName,
              item.fieldename
            );
            console.log("QueryFieldIsNumber", obj);
            if (obj.success && obj.count > 0) {
              if (
                this.treeData[1].children.findIndex((el) => {
                  return el.id === item.fieldename;
                }) === -1
              ) {
                this.treeData[1].children.push({
                  id: item.fieldename,
                  label: item.fieldcname,
                });
                checkedKeys.push(item.fieldename);
                let temp = await dataImport.QueryFieldNotNumberRows(
                  ajid,
                  tableName,
                  item.fieldename
                );
                if (temp.success) errorRows = errorRows.concat(temp.rows);
              }
            } else if (!obj.success) {
              this.$notify.error({
                title: "错误",
                message: obj.msg,
              });
            }
          }
        }
        if (
          checkedKeys.find((el) => {
            return el === "notDate";
          })
        ) {
          if (item.fieldtype === 4 || item.fieldtype === 6) {
            let obj = await dataImport.QueryFieldNotDateCount(
              ajid,
              tableName,
              item.fieldename
            );
            console.log("QueryFieldNotDateCount", obj);
            if (obj.success && obj.count > 0) {
              if (
                this.treeData[2].children.findIndex((el) => {
                  return el.id === item.fieldename;
                }) === -1
              ) {
                this.treeData[2].children.push({
                  id: item.fieldename,
                  label: item.fieldcname,
                });
                checkedKeys.push(item.fieldename);
                let temp = await dataImport.QueryFieldNotDateRows(
                  ajid,
                  tableName,
                  item.fieldename
                );
                if (temp.success) errorRows = errorRows.concat(temp.rows);
              }
            } else if (!obj.success) {
              this.$notify.error({
                title: "错误",
                message: obj.msg,
              });
            }
          }
        }
        if (this.checkedNull) {
        }
      }
      console.log(errorRows);
      if (errorRows.length > 0) {
        await this.$store.commit("DataCollection/MODIFY_SHOW_DATA_LIMIT", {
          sheetIndex: this.activeName,
          rows: errorRows,
        });
      }

      this.$refs.tree.setCheckedKeys(checkedKeys);
      console.log(checkedKeys);
    },
    // 数据批量修改
    handleClickBatchModify() {},
    // 数据批量删除
    handleClickBatchDelete() {},
    handleClickTab(index) {
      console.log(index);
    },
    async handleCurrentChange(val) {
      let _this = this;
      console.log(`当前页: ${val}`);
      let tableName = this.sheetItem.tableName;
      let ajid = this.caseDetail.ajid;
      let offset = (val - 1) * _this.pageSize;
      let matchedFields = this.sheetItem.matchedFields;
      await this.$store.dispatch("DataCollection/QueryTableData", {
        ajid,
        sheetIndex: this.activeName,
        tableName,
        matchedFields,
        index: offset,
        limit: _this.pageSize,
      });
    },
  },
};
</script>
<style  scoped>
</style>