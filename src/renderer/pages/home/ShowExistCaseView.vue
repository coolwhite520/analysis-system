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
            <b>编号：{{caseItem.ajbh}}</b>
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
                  @click="handleClickAnalysis()"
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
      columCount: 3 //每行显示几个
    };
  },
  computed: {
    ...mapGetters("Cases", ["existCasesFilter"]),
    ...mapState("AppPageSwitch", ["currentViewName"])
  },
  methods: {
    handleClickCase(caseDetail) {
      console.log(caseDetail);
      // 把数据提交
      this.$store.commit("CaseDetail/SET_CASE_DETAIL", caseDetail);
      this.$store.commit("HomePageSwitch/SET_VIEW_NAME", "case-detail-view");
    },
    handleClickAnalysis(event) {
      window.event.stopPropagation();
      console.log("clickAnalysis");
      this.$store.commit("AppPageSwitch/SET_VIEW_NAME", "main-page");
    }
  },
  mounted() {
    this.$store.dispatch("Cases/getExistCaseAsync");
  }
};
</script>

<style scoped>
.cardStyle {
  border: 2px solid #1b2735;
  border-radius: 15px;
  /* background: radial-gradient(ellipse at bottom, #1b2735 0%, #9fb6cd 100%); */
  color: #808080;
}

.cardStyle:hover {
  box-shadow: #1b2735 10px 10px 30px 5px;
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
  font-size: 18px;
  font-weight: bold;
  border-radius: 10px;

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
