<template>
  <div :style="{
    height: mainViewHeight - 140 + 'px',
    padding: 15 + 'px',
  }">
    <el-row :gutter="40">
      <el-col :span="24 / columCount" v-for="caseItem in existCasesFilter" :key="caseItem.ajid"
        style="margin-bottom: 20px">
        <!-- <div
          class="iconfont"
          style="color: #ddd; font-size: 30px; margin-bottom: -30px"
        >
          &#xe65e;
        </div> -->
        <el-card @click.native="handleClickCase(caseItem)" class="cardStyle">
          <el-row class="rowstyle">
            <span class="iconfont" style="font-size: 20px">&#xe6d1;</span>
            <span style="font-size: 15px">编号：</span>
            <b style="color: #384e6e; font-size: 12px">{{ caseItem.ajbh }}</b>
          </el-row>
          <el-row class="rowstyle">
            <el-col :span="12">
              <div class="time">{{ caseItem.cjsj }}</div>
            </el-col>
            <el-col :span="12">
              <div class="location">{{ caseItem.asjfsddxzqmc }}</div>
            </el-col>
          </el-row>
          <el-row class="rowstyle">
            <div class="caseName">{{ caseItem.ajmc }}</div>
          </el-row>
          <el-row>
            <p style="text-align: center">[{{ caseItem.ajlbmc }}]</p>
          </el-row>
          <el-row>
            <el-col :span="12">
              <div class="state">状态：{{ caseItem.zcjdmc }}</div>
            </el-col>
            <el-col :span="12">
              <div>
                <el-button class="button" icon="el-icon-search" type="text" @click="handleClickAnalysis(caseItem)">分析
                </el-button>
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
      columCount: 4, //每行显示几个
    };
  },
  computed: {
    ...mapGetters("Cases", ["existCasesFilter"]),
    ...mapState("AppPageSwitch", ["currentViewName", "mainViewHeight"]),
    ...mapState("CaseDetail", ["dataSum", "dataCenterList"]),
  },
  methods: {
    async handleClickCase(caseBase) {
      // 把数据提交
      await this.$store.dispatch("CaseDetail/queryEntityCount", caseBase.ajid);
      await this.$store.dispatch("CaseDetail/queryBatchCount", caseBase.ajid);
      await this.$store.dispatch(
        "CaseDetail/queryAwaitTaskCount",
        caseBase.ajid
      );
      await this.$store.dispatch(
        "CaseDetail/queryCaseDataCenter",
        caseBase.ajid
      );
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
          title: "数据采集",
        });
      } else {
        // 查找第一个数据中心中的数据不为零的tid
        let tid = -1;
        let maxCount = 0;
        for (let item of this.dataCenterList) {
          for (let child of item.childrenArr) {
            if (child.count > maxCount) {
              maxCount = child.count;
              tid = child.tid;
            }
          }
        }
        await this.$store.dispatch("ShowTable/showBaseTable", {
          tid,
          offset: 0,
          count: 30,
        });
      }
    },
  },
  mounted() { },
};
</script>

<style scoped>
.cardStyle {
  border: 2px solid #384e6e;
  border-radius: 15px;
  /* background-image: linear-gradient(to right, #34435c, white); */
  color: #384e6e;
}

.cardStyle:hover {
  box-shadow: 1px 1px 10px 5px #b6beca;
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

.rowstyle {
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
