<template>
  <div>
    <el-table
      style="width: 100%;"
      :data="tableData.data.rows"
      size="mini"
      max-height="600"
      height="600"
      stripe
      border
      @sort-change="sortChange"
    >
      <el-table-column fixed type="index" width="50" label="编号"></el-table-column>
      <el-table-column
        v-for="(header) in tableData.data.headers"
        :label="header.fieldcname"
        :key="header.cid"
        show-overflow-tooltip
        :prop="header.fieldename"
        sortable="custom"
      >
        <template slot-scope="scope">
          <div v-if="header.showrightbtn_type">
            <el-button
              type="text"
              size="mini"
              style="color:#2e69b7"
            >{{ scope.row[header.fieldename].value }}</el-button>
          </div>
          <div v-else>{{ scope.row[header.fieldename].value }}</div>
        </template>
      </el-table-column>
    </el-table>
    <el-row>
      <div
        style="float:left;margin-top:10px;font-size:12px;color:gray"
      >每页显示{{pageSize}}条，当前页面条目数量：{{ tableData.data.rows.length }}条, 总计：{{tableData.data.sum}}条</div>
      <div style="float:right;margin-top:10px;">
        <el-pagination
          small
          layout="prev, pager, next"
          :page-size="pageSize"
          :total="tableData.data.sum"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </el-row>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  mounted() {
    console.log(this.tableData);
  },
  computed: {
    ...mapState("CaseDetail", ["caseBase"]),
    ...mapState("AppPageSwitch", ["contentViewHeight"]),
  },
  props: ["tableData"],
  data() {
    return {
      pageSize: 30,
    };
  },
  methods: {
    sortChange(column) {
      console.log(column);
      //获取字段名称和排序类型
      let fieldName = column.prop;
      let sortingType = column.order;
      let newTableData = JSON.parse(JSON.stringify(this.tableData));
      if (sortingType == "descending") {
        newTableData.data.rows = newTableData.data.rows.sort((a, b) => {
          console.log(a[fieldName], b[fieldName]);
          return b[fieldName].value > a[fieldName].value;
        });
      } else {
        newTableData.data.rows = newTableData.data.rows.sort((a, b) => {
          return a[fieldName].value > b[fieldName].value;
        });
      }
      console.log(newTableData.data.rows);
      this.$store.commit("ShowTable/UPDATE_TABLE_DATA", {
        tid: this.tableData.tid,
        data: newTableData,
      });
    },
    async handleCurrentChange(val) {
      let { ajid } = this.caseBase;
      let offset = (val - 1) * this.pageSize;
      let { tid, tablecname, dispatchName, pgsql } = this.tableData;
      console.log(this.tableData);
      // 根据tableName获取表的数据
      await this.$store.dispatch(dispatchName, {
        ajid,
        tid,
        pgsql,
        tablecname,
        offset: offset,
        count: this.pageSize,
      });
    },
  },
};
</script>
<style >
</style>