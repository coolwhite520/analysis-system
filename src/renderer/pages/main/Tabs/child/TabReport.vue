<template>
  <div class="TabReport">
    <el-row style="text-align:center;">
      <el-col :span="1" class="el-col" style="border-right:1px solid #e5e7ec;">
        <el-button type="text" class="ctrl-button" @click="handleClickNewReport">
          <span class="iconfont selfIcont">&#xe630;</span>
          <br />
          <span class="title-content">新建报告</span>
        </el-button>
      </el-col>
    </el-row>
    <el-row style="font-size:8px;color:gray;text-align: center;">
      <el-col :span="1" style="border-right:1px solid #e5e7ec;">
        <div>报告</div>
      </el-col>
    </el-row>
    <analysis-report></analysis-report>
  </div>
</template>
<script>
import AnalysisReportDialog from "@/pages/dialog/report/AnalysisReportDialog";
import { mapState } from "vuex";
export default {
  components: {
    "analysis-report": AnalysisReportDialog,
  },
  computed: {
    ...mapState("ShowTable", ["currentTableData"]),
  },
  methods: {
    async handleClickNewReport() {
      await this.$store.commit("DialogPopWnd/SET_SHOWREPORTVISIBLE", true);
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