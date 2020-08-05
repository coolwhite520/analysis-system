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
    >
      <el-table-column fixed type="index" width="50" label="编号"></el-table-column>
      <el-table-column
        v-for="(header, index) in tableData.data.headers"
        :label="header.fieldcname"
        :key="index"
        show-overflow-tooltip
        sortable
      >
        <template slot-scope="scope">
          <div>{{ scope.row[index].value}}</div>
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
    ...mapState("CaseDetail", ["caseDetail"]),
    ...mapState("AppPageSwitch", ["contentViewHeight"]),
  },
  props: ["tableData"],
  data() {
    return {
      pageSize: 30,
    };
  },
  methods: {
    async handleCurrentChange(val) {
      let { ajid } = this.caseDetail;
      let offset = (val - 1) * this.pageSize;
      let { tid, tablecname, dispatchName } = this.tableData;
      console.log(this.tableData);
      // 根据tableName获取表的数据
      await this.$store.dispatch(dispatchName, {
        ajid,
        tid,
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