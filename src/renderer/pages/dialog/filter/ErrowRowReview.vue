<template>
  <el-dialog
    v-dialogDrag
    :close-on-click-modal="false"
    class="standard-data-dialog"
    :title="currentTableData.renderErrorData.title"
    :visible.sync="showErrorRowRecordVisible"
    width="40%"
    :before-close="handleClose"
    :modal="true"
  >
    <div>错误数据最多展示30行</div>
    <el-table
      size="mini"
      :data="currentTableData.renderErrorData.tableList"
      style="width: 100%"
      :height="200"
    >
      <el-table-column
        v-for="header in currentTableData.renderErrorData.tableHeaders"
        :label="header.fieldcname"
        :key="header.cid + Math.random()"
        show-overflow-tooltip
        :prop="header.fieldename"
        :fixed="
          header.fieldename.toLowerCase() ===
          currentTableData.renderErrorData.ruleField.toLowerCase()
        "
      >
        <template slot-scope="scope">
          <div
            :style="{
              color:
                header.fieldename.toLowerCase() ===
                currentTableData.renderErrorData.ruleField.toLowerCase()
                  ? 'red'
                  : '',
            }"
          >
            {{ scope.row[header.fieldename] }}
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-row style="text-align: center; margin-top: 20px">
      <el-button size="small" type="primary" @click="handleClickResolve"
        >一键处理</el-button
      >
    </el-row>
  </el-dialog>
</template>
<script>
import { mapState } from "vuex";
import baseDb from "@/db/Base";
export default {
  computed: {
    ...mapState("DialogPopWnd", ["showErrorRowRecordVisible"]),
    ...mapState("CaseDetail", ["caseBase"]),
    ...mapState("ShowTable", ["currentTableData"]),
  },
  data() {
    return {};
  },
  async mounted() {
    console.log(this.currentTableData.renderErrorData);
  },
  methods: {
    async handleClickResolve() {
      try {
        await baseDb.QueryCustom(
          this.currentTableData.renderErrorData.updateSql,
          this.caseBase.ajid
        );
        this.$message({
          title: "成功",
          message: `数据处理完毕`,
          type: "success",
        });
        this.$store.commit("DialogPopWnd/SET_SHOWERRORROWRECORDVISIBLE", false);
        this.$emit("refreshErrorCharTree");
        // ?????通知father页面刷新
      } catch (e) {
        this.$message.error({
          title: "失败",
          message: `数据处理失败，error:${e.message}`,
        });
      }
    },
    handleClose() {
      this.$store.commit("DialogPopWnd/SET_SHOWERRORROWRECORDVISIBLE", false);
    },
  },
};
</script>
