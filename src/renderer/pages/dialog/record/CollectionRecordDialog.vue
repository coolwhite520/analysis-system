<template>
  <!-- top="30vh" -->
  <el-dialog
    v-dialogDrag
    :close-on-click-modal="false"
    class="standard-data-dialog"
    :title="title"
    :visible.sync="showCollectionRecordVisible"
    width="40%"
    :before-close="handleClose"
    :modal="true"
  >
    <div :loading="loading">
      <el-table
        ref="multipleTable"
        style="width: 100%"
        :data="CollectionRecords.rows"
        size="mini"
        :max-height="400"
        :height="400"
        stripe
        border
      >
        <el-table-column fixed type="index" label="编号"></el-table-column>
        <el-table-column type="selection"> </el-table-column>
        <el-table-column
          v-for="header in CollectionRecords.headers.filter(
            (header) => header.fieldename !== 'sjlyid'
          )"
          :label="header.fieldcname"
          :key="header.fieldename"
          show-overflow-tooltip
          :prop="header.fieldename"
          sortable="custom"
        >
          <template slot-scope="scope">
            <div v-if="header.fieldename === 'drrq'">
              {{ scope.row[header.fieldename].Format("yyyy-MM-dd hh:mm:ss") }}
            </div>
            <div v-else>
              {{ scope.row[header.fieldename] }}
            </div>
          </template>
        </el-table-column>
      </el-table>
      <el-row
        style="
          background-color: #f5f7fa;
          padding: 5px;
          border-bottom: 1px solid #dddfe5;
          border-left: 1px solid #dddfe5;
          border-right: 1px solid #dddfe5;
        "
      >
        <el-col :span="12">
          <div style="font-size: 12px; color: gray; margin-top: 5px">
            每页显示{{ pageSize }}条，当前页面条目数量：{{
              CollectionRecords.rows.length
            }}条, 总计：{{ CollectionRecords.rowCount }}条
          </div>
        </el-col>
        <el-col :span="8" style="text-align: right">
          <div>
            <el-pagination
              small
              :current-page="currentPage"
              layout="prev, pager, next"
              :page-size="pageSize"
              :total="CollectionRecords.rowCount"
              @current-change="handleCurrentChange"
            ></el-pagination>
          </div>
        </el-col>
        <el-col :span="4">
          <el-select
            v-model="pageSize"
            placeholder="请选择"
            size="mini"
            @change="handleChangePageSize"
          >
            <el-option
              v-for="item in optionsPageSize"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-col>
      </el-row>
      <el-row style="margin-top: 40px; text-align: center">
        <el-button type="primary" @click="handleClickDelCollection"
          >删除数据</el-button
        >
      </el-row>
    </div>
  </el-dialog>
</template>
<script>
import { mapState } from "vuex";
import cases from "@/db/Cases";
export default {
  computed: {
    ...mapState("DialogPopWnd", ["showCollectionRecordVisible"]),
    ...mapState("CaseDetail", ["CollectionRecords", "caseBase"]),
  },
  mounted() {
    for (let size = 1; size <= 60; size++) {
      this.optionsPageSize.push({
        label: String(size),
        value: size,
      });
    }
  },
  data() {
    return {
      loading: false,
      optionsPageSize: [],
      pageSize: 30,
      currentPage: 1,
      title: "数据采集记录",
    };
  },
  methods: {
    handleClose() {
      this.$store.commit("DialogPopWnd/SET_SHOWCOLLECTIONRECORDVISIBLE", false);
    },
    async handleClickDelCollection() {
      this.loading = true;
      try {
        let selectedRows = this.$refs.multipleTable.selection;
        console.log(selectedRows);
        if (selectedRows.length === 0) {
          this.$message({
            type: "info",
            message: "没有选中任何条目。",
          });
          return;
        }
        for (let row of selectedRows) {
          await cases.DeleteCollectionRecords(
            this.caseBase.ajid,
            parseInt(row.sjlyid)
          );
        }
        // 更新采集批次等一批数据
        await this.$store.dispatch(
          "CaseDetail/queryEntityCount",
          this.caseBase.ajid
        );
        await this.$store.dispatch(
          "CaseDetail/queryBatchCount",
          this.caseBase.ajid
        );
        await this.$store.dispatch(
          "CaseDetail/queryAwaitTaskCount",
          this.caseBase.ajid
        );
        await this.$store.dispatch(
          "CaseDetail/queryCaseDataCenter",
          this.caseBase.ajid
        );
        // 刷新页面数据
        await this.handleChangePageSize();
        //
        this.$message({
          type: "success",
          message: "数据删除成功！",
        });
      } catch (e) {
        console.log(e);
        this.$message.error({
          message: "数据删除失败！错误代码:" + e.message,
        });
      }

      this.loading = false;
    },
    async handleChangePageSize() {
      try {
        // 根据tableName获取表的数据
        let {
          success,
          rows,
          headers,
          rowCount,
        } = await cases.QueryCollectionRecords(
          this.caseBase.ajid,
          0,
          this.pageSize
        );
        if (success) {
          this.$store.commit("CaseDetail/SET_COLLECTIONRECORDS", {
            rows,
            headers,
            rowCount,
          });
        }
        this.currentPage = 1;
      } catch (e) {
        this.$message.error({
          message: `数据读取失败：` + e.message,
        });
      }
    },
    async handleCurrentChange(val) {
      try {
        let offset = (val - 1) * this.pageSize;
        // 根据tableName获取表的数据
        let {
          success,
          rows,
          headers,
          rowCount,
        } = await cases.QueryCollectionRecords(
          this.caseBase.ajid,
          offset,
          this.pageSize
        );
        if (success) {
          this.$store.commit("CaseDetail/SET_COLLECTIONRECORDS", {
            rows,
            headers,
            rowCount,
          });
        }
      } catch (e) {
        this.$message.error({
          message: `数据读取失败：` + e.message,
        });
      }
    },
  },
};
</script>
