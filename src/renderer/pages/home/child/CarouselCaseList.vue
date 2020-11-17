<template>
  <el-row>
    <el-col :span="4">
      <div style="color: white; margin-top: 35px; text-align: right">
        <!-- <h3>已有案件轮播列表：</h3> -->
      </div></el-col
    >
    <el-col :span="16">
      <el-carousel
        :interval="100000"
        type="card"
        height="195px"
        style="margin-top: 20px"
        :initial-index="initialIndex"
      >
        <el-carousel-item
          v-for="caseItem in existCaseList"
          :key="caseItem.ajid"
        >
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
                  <el-button
                    class="button"
                    icon="el-icon-search"
                    type="text"
                    @click="handleClickAnalysis(caseItem)"
                    >分析</el-button
                  >
                </div>
              </el-col>
            </el-row>
          </el-card>
        </el-carousel-item>
      </el-carousel></el-col
    >
    <el-col :span="4">&nbsp;</el-col>
  </el-row>
</template>
<script>
import { mapState, mapGetters } from "vuex";

export default {
  computed: {
    ...mapState("Cases", ["existCaseList"]),
    ...mapState("AppPageSwitch", ["currentViewName", "mainViewHeight"]),
    ...mapState("CaseDetail", ["caseBase", "dataSum", "dataCenterList"]),
    initialIndex() {
      let index = this.existCaseList.findIndex((c) => {
        return c.ajmc === this.caseBase.ajmc;
      });
      console.log(index);
      return index;
    },
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
        let tid = "";
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
};
</script>
<style scoped>
.el-carousel__item:nth-child(2n) {
  border-radius: 15px;
}

.el-carousel__item:nth-child(2n + 1) {
  border-radius: 15px;
}

.cardStyle {
  /* background-image: linear-gradient(to right, #34435c, white); */
  color: #384e6e;
  background-color: white;
}
.cardStyle:hover {
  background-color: #d3dce6;
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