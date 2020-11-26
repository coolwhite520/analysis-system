<template>
  <div class="TabReport">
    <el-row style="text-align: center">
      <el-col :span="1" class="el-col">
        <el-button
          type="text"
          class="ctrl-button"
          @click="handleClickNewReport"
        >
          <span class="iconfont selfIcont">&#xe630;</span>
          <br />
          <span class="title-content">新建报告</span>
        </el-button>
      </el-col>
      <el-col :span="1" class="el-col" style="border-right: 1px solid #e5e7ec">
        <el-button
          type="text"
          class="ctrl-button"
          @click="handleClickReportHistory"
        >
          <span class="iconfont selfIcont">&#xe63d;</span>
          <br />
          <span class="title-content">报告历史</span>
        </el-button>
      </el-col>
    </el-row>
    <el-row style="font-size: 8px; color: gray; text-align: center">
      <el-col :span="2" style="border-right: 1px solid #e5e7ec">
        <div>报告</div>
      </el-col>
    </el-row>
    <analysis-report v-if="showReportVisible"></analysis-report>
    <analysis-history
      v-if="showReportHisVisible"
      :reportCollection="reportCollection"
    ></analysis-history>
  </div>
</template>
<script>
import Report from "@/db/Report";
import AnalysisReportDialog from "@/pages/dialog/report/AnalysisReportDialog";
import AnalysisHistory from "@/pages/dialog/report/AnalysisHistory";
import { mapState } from "vuex";
export default {
  data() {
    return {
      reportCollection: null,
    };
  },
  components: {
    "analysis-report": AnalysisReportDialog,
    "analysis-history": AnalysisHistory,
  },
  computed: {
    ...mapState("ShowTable", ["currentTableData"]),
    ...mapState("DialogPopWnd", ["showReportVisible", "showReportHisVisible"]),
  },
  methods: {
    async handleClickNewReport() {
      await this.$store.commit("DialogPopWnd/SET_SHOWREPORTVISIBLE", true);
    },
    async handleClickReportHistory() {
      try {
        let { success, rows } = await Report.QueryHistoryReport();
        this.reportCollection = rows;
        console.log(rows);
        await this.$store.commit("DialogPopWnd/SET_SHOWREPORTHISVISIBLE", true);
      } catch (e) {
        this.$message({
          message: "发生错误：" + e.message,
        });
      }
    },
  },
};
</script>
<style  scoped>
.TabReport {
  -webkit-user-select: none;
}
.selfIcont {
  font-size: 18px;
  color: rgb(24, 84, 95);
}
.title-content {
  font-size: 10px;
}
.ctrl-button {
  padding-top: 4px;
}
</style>