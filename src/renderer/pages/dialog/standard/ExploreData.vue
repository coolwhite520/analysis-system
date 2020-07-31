<template>
  <div>
    <el-tabs v-model="activeName" type="card" @tab-click="handleClickTab(activeName)">
      <el-tab-pane
        v-for="(item, index) of exampleDataList"
        :key="index"
        :label="item.sheetName"
        :name="String(index)"
      >
        <el-table :data="item.showRows" size="mini" stripe style="width: 100%" border height="500">
          <el-table-column type="index" width="50" fixed label="编号"></el-table-column>
          <el-table-column
            v-for="(header, index) in item.headers"
            :label="header.cname"
            :key="index"
          >
            <template slot-scope="scope">{{ scope.row[header.ename]}}</template>
          </el-table-column>
        </el-table>
        <div style="float:right;margin-top:20px;">
          <el-pagination
            background
            layout="prev, pager, next"
            :page-size="pageSize"
            :total="item.rowSum"
            @current-change="handleCurrentChange"
          ></el-pagination>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import { mapState } from "vuex";
export default {
  async mounted() {
    this.activeName = "0";
  },
  data() {
    return {
      pageSize: 30,
      activeName: "",
    };
  },
  computed: {
    ...mapState("CaseDetail", ["caseDetail"]),
    ...mapState("DataCollection", ["exampleDataList"]),
  },
  methods: {
    handleClickTab(index) {
      console.log(index);
    },
    async handleCurrentChange(val) {
      let _this = this;
      console.log(`当前页: ${val}`);
      let index = parseInt(this.activeName);
      let item = this.exampleDataList[index];
      let tableName = item.tableName;
      let ajid = this.caseDetail.ajid;
      let offset = (val - 1) * _this.pageSize;
      await this.$store.dispatch("DataCollection/QueryTableData", {
        ajid,
        sheetIndex: index,
        tableName,
        index: offset,
        limit: _this.pageSize,
      });
    },
  },
};
</script>