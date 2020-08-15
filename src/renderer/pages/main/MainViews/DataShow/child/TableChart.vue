<template>
  <div>
    <el-table
      style="width: 100%;"
      :data="tableData.rows"
      size="mini"
      :max-height="limitHeight"
      stripe
      border
      @sort-change="sortChange"
    >
      <el-table-column fixed type="index" width="50" label="编号"></el-table-column>
      <el-table-column
        v-for="(header) in tableData.headers"
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
              @click="handleClickTableCellLink(scope.row, header.fieldename, header.link_mid, scope.row[header.fieldename].value)"
            >{{ scope.row[header.fieldename].value }}</el-button>
          </div>
          <div v-else>{{ scope.row[header.fieldename].value }}</div>
        </template>
      </el-table-column>
    </el-table>
    <el-row style="margin-top:10px;">
      <el-col :span="12">
        <div
          style="font-size:12px;color:gray"
        >每页显示{{pageSize}}条，当前页面条目数量：{{ tableData.rows.length }}条, 总计：{{tableData.sum}}条</div>
      </el-col>
      <el-col :span="12" style="text-align:right;">
        <div>
          <el-pagination
            small
            layout="prev, pager, next"
            :page-size="pageSize"
            :total="tableData.sum"
            @current-change="handleCurrentChange"
          ></el-pagination>
        </div>
      </el-col>
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
  props: ["tableData", "limitHeight"],
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
      function compare(property, sortingType) {
        return function (a, b) {
          var value1 = a[property].value;
          var value2 = b[property].value;
          // 如果是中文
          if (
            /^[\u4e00-\u9fa5]+$/i.test(value1) &&
            /^[\u4e00-\u9fa5]+$/i.test(value2)
          ) {
            return sortingType === "descending"
              ? value1.localeCompare(value2)
              : value2.localeCompare(value1);
          }
          return sortingType === "descending"
            ? value1 - value2
            : value2 - value1;
        };
      }
      newTableData.rows = newTableData.rows.sort(
        compare(fieldName, sortingType)
      );
      this.$store.commit("ShowTable/UPDATE_TABLE_DATA", {
        pageIndex: this.tableData.pageIndex,
        rows: newTableData.rows,
      });
    },
    async handleClickTableCellLink(row, fieldename, linkMid, value) {
      console.log(row, fieldename, linkMid, value);
      let newRow = {};
      for (let k in row) {
        newRow[k] = row[k].value;
      }

      this.$store.dispatch("ShowTable/showLinkTable", {
        tid: parseInt(this.tableData.tid),
        ajid: this.caseBase.ajid,
        linkMid,
        selectCondition: this.tableData.selectCondition,
        row: newRow,
        fieldename: fieldename.toUpperCase(), // 注意列名需要传递大写
        count: 30,
        offset: 0,
      });
    },

    async handleCurrentChange(val) {
      let offset = (val - 1) * this.pageSize;
      // 根据tableName获取表的数据
      await this.$store.dispatch(this.tableData.dispatchName, {
        ...this.tableData,
        offset: offset,
        count: this.pageSize,
      });
    },
  },
};
</script>
<style >
</style>