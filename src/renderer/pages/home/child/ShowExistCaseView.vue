<template>
  <div>
    <el-row :gutter="40">
      <el-col
        :span="24/columCount"
        v-for="(caseItem) in existCasesFilter"
        :key="caseItem.ajid"
        style="margin-bottom:20px;"
      >
        <div class="iconfont" style="color: #ddd;font-size:30px;margin-bottom:-30px;">&#xe65e;</div>
        <el-card @click.native="handleClickCase(caseItem)" class="cardStyle">
          <el-row>
            编号：
            <b style="color:#384e6e;font-size:12px;">{{caseItem.ajbh}}</b>
          </el-row>
          <el-row>
            <el-col :span="12">
              <div class="time">{{caseItem.cjsj}}</div>
            </el-col>
            <el-col :span="12">
              <div class="location">{{caseItem.asjfsddxzqmc}}</div>
            </el-col>
          </el-row>
          <el-row>
            <div class="caseName">{{ caseItem.ajmc }}</div>
          </el-row>
          <el-row>
            <p style="text-align:center;">[{{caseItem.ajlbmc}}]</p>
          </el-row>
          <el-row>
            <el-col :span="12">
              <div class="state">状态：{{caseItem.zcjdmc}}</div>
            </el-col>
            <el-col :span="12">
              <div>
                <el-button
                  class="button"
                  icon="el-icon-search"
                  type="text"
                  @click="handleClickAnalysis(caseItem)"
                >分析</el-button>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { mapState, mapGetters } from "vuex";
export default {
  data() {
    return {
      currentDate: new Date(),
      columCount: 3, //每行显示几个
    };
  },
  computed: {
    ...mapGetters("Cases", ["existCasesFilter"]),
    ...mapState("AppPageSwitch", ["currentViewName"]),
    ...mapState("CaseDetail", ["dataSum"]),
  },
  methods: {
    async handleClickCase(caseBase) {
      console.log(caseBase);
      // 把数据提交
      this.$store.commit("CaseDetail/SET_CASE_DETAIL", caseBase);
      this.$store.commit("HomePageSwitch/SET_VIEW_NAME", "case-detail-view");
    },
    // 点击分析按钮
    async handleClickAnalysis(caseBase) {
      window.event.stopPropagation();
      this.$store.commit("AppPageSwitch/SET_VIEW_NAME", "main-page");
      await this.$store.commit("CaseDetail/SET_CASE_DETAIL", caseBase);
      await this.$store.dispatch(
        "CaseDetail/queryCaseDataCenter",
        caseBase.ajid
      );
      await this.$store.dispatch("CaseDetail/queryBatchCount", caseBase.ajid);
      if (this.dataSum === 0) {
        await this.$store.dispatch("ShowTable/showNoDataPage", {
          tablecname: "数据采集",
        });
      } else {
        await this.$store.dispatch("ShowTable/showBaseTable", {
          ajid: caseBase.ajid,
          tid: "1",
          title: "人员基本信息",
          tableename: "gas_person",
          filter: "",
          offset: 0,
          count: 30,
        });
      }
    },
  },
  mounted() {
    this.$store.dispatch("Cases/getExistCaseAsync");
  },
};
</script>

<style scoped>
.cardStyle {
  border: 2px solid #384e6e;
  border-radius: 15px;
  color: #808080;
}

.cardStyle:hover {
  box-shadow: #384e6e 10px 10px 30px 5px;
}
.time {
  font-size: 13px;
}
.location {
  font-size: 12px;
  float: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.caseName {
  color: #384e6e;
  font-size: 20px;
  font-weight: bold;
  /* border-radius: 10px; */
  text-align: center;
  margin: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.state {
  font-size: 12px;
  margin-top: 12px;
}
.button {
  float: right;
}
</style>
