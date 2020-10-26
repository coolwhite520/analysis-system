<template>
  <div class="no-data-div">
    <el-row>
      <el-col :span="8">&nbsp;</el-col>
      <el-col :span="8">
        <div style="text-align: center">
          <el-button
            class="iconfont"
            type="text"
            style="font-size: 100px"
            @click="handleClickImportData"
            :loading="loading"
          >
            &#xe6a1;
            <div style="text-align: center; font-size: 20px">
              当前案件无数据，请进行数据采集
            </div>
          </el-button>
        </div>
      </el-col>
      <el-col :span="8">&nbsp;</el-col>
    </el-row>
  </div>
</template>
<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      loading: false,
    };
  },
  mounted() {
    this.loading = false;
  },
  computed: {
    ...mapState("CaseDetail", ["caseBase"]),
  },
  methods: {
    async handleClickImportData() {
      this.loading = true;
      await this.$electron.ipcRenderer.send("data-collection-open");
      this.$electron.ipcRenderer.on(
        "data-collection-open-complete",
        async () => {
          await this.$store.dispatch(
            "CaseDetail/queryBatchCount",
            this.caseBase.ajid
          );
          await this.$store.commit("CaseDetail/ADD_BATCHTOUNT");
          await this.$store.commit(
            "DialogPopWnd/SET_STANDARDVIEW",
            "begin-import"
          );
          await this.$store.commit(
            "DialogPopWnd/SET_STANDARDDATAVISIBLE",
            true
          );
          this.$electron.ipcRenderer.removeAllListeners(
            "data-collection-open-complete"
          );
          this.loading = false;
        }
      );
    },
  },
};
</script>
<style>
.no-data-div {
  margin-top: 100px;
}
</style>